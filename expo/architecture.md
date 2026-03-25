# Jobii – Architecture Document
**Version:** 1.0 | **Date:** 2026-03-20 | **Status:** Living Document

---

## 1. System Overview

Jobii is a **two-sided mobile marketplace** connecting gig workers (Seekers) with event organizers and businesses (Organizers) in Israel.

| Role | Internal Name | Mode Color | Primary Action |
|---|---|---|---|
| **Work** – Gig Seeker | `participant` | Emerald green | Accept/reject shift invites |
| **Hire** – Organizer | `organizer` | Indigo | Create tenders, invite workers, consume credits |

Both roles live in **one app and one user account**. A user toggles between Work and Hire modes from the dashboard. The "Hire" tab is gated behind an organizer role check — a user can have either or both roles in future iterations.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native + Expo | RN 0.81.5, Expo 54 |
| Routing | Expo Router | ~6.0 |
| Backend / DB | Supabase (PostgreSQL + Realtime) | @supabase/supabase-js ^2 |
| Server State | TanStack React Query | ^5 |
| Animations | Moti + React Native Reanimated | latest |
| Toasts | sonner-native | latest |
| Icons | lucide-react-native | latest |
| i18n | Custom typed system | `constants/translations.ts` |
| Builds | Expo EAS | via `npx eas` |

---

## 3. Authentication Strategy

### 3.1 Current Implementation (v1 — Phone Lookup)
Authentication is **phone-number based with no OTP**. The flow:
1. User enters Israeli phone number
2. App formats to E.164: `+972XXXXXXXXX`
3. App calls `supabaseQueries.users.getByPhone(phone)`
4. If found → log in; if not found (PGRST116) → auto-create as `participant`
5. User ID is persisted to `AsyncStorage` for session restoration

> ⚠️ **Known limitation:** This is a simplified auth for the v1 launch. There is no OTP verification — any phone number can access any account if known. This is acceptable for internal/beta testing but must be upgraded before public launch.

### 3.2 Target Implementation (v2 — Supabase Auth + OTP)
Planned upgrade path:
1. Enable Supabase Auth with phone/SMS provider (Twilio or equivalent)
2. Replace `users` table phone lookup with `auth.users` session management
3. Store `auth.user.id` as the FK in all tables (replacing current custom `users.id`)
4. Use `supabase.auth.onAuthStateChange` for session listener
5. All RLS policies switch from `users.id` to `auth.uid()`

**Migration note:** The `users` table must gain a `auth_id` column (UUID FK to `auth.users`) and all RLS policies must be rewritten around `auth_id = auth.uid()`.

### 3.3 Session Flow (Current)
```
App Start
    ↓
AsyncStorage.getItem('currentUserId')
    ↓ found                    ↓ not found
AppContext.setCurrentUserId   → index.tsx (Login Screen)
    ↓
useQuery(['user', userId])    → user loaded, redirect to dashboard
```

---

## 4. Data Flow Architecture

```
User Action (Component)
        │
        ▼
   Custom Hook  ──────────────────────────────────────────┐
   (hooks/)     useMutation / useQuery                     │
        │                                                   │
        ▼                                                   │
supabase-queries.ts                                        │
   (Data Layer)                                            │
        │                                                   │
        ▼                                                   │
   Supabase                                                │
   PostgreSQL  ──→ Realtime Channel ──→ invalidateQueries ─┘
                   (AppContext.tsx)      (React Query Cache)
```

### 4.1 Rules of Data Flow
1. **Components** never call Supabase directly
2. **Hooks** in `hooks/` use React Query to fetch/mutate via the data layer
3. **`supabase-queries.ts`** is the **only** file that imports from `lib/supabase`
4. **Realtime** subscriptions live in `AppContext` and only call `queryClient.invalidateQueries`
5. **React Query cache** is the single source of truth for all server state

---

## 5. Database Schema (Core Tables)

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `phone` | TEXT UNIQUE | E.164 format (+972...) |
| `name` | TEXT | Display name |
| `role` | ENUM('organizer','participant') | Primary role |
| `credits` | INTEGER | Hire-mode credit balance |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `tenders`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `organizer_id` | UUID FK → users.id | |
| `title` | TEXT | |
| `description` | TEXT | |
| `location` | TEXT | |
| `date` | DATE | |
| `start_time` | TEXT | HH:MM format |
| `end_time` | TEXT | HH:MM format |
| `pay` | INTEGER | Per-shift pay (ILS) |
| `quota` | INTEGER | Max workers needed |
| `status` | ENUM('open','full','active','closed') | |
| `created_at` | TIMESTAMPTZ | |

### `invites`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tender_id` | UUID FK → tenders.id | |
| `user_id` | UUID FK → users.id NULLABLE | Null = guest invite |
| `user_name` | TEXT | Denormalized for guest support |
| `user_phone` | TEXT | Denormalized for guest support |
| `status` | ENUM('pending','accepted','rejected') | |
| `is_guest` | BOOLEAN | True if no user_id |
| `updated_at` | TIMESTAMPTZ | |

### `contacts`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `owner_id` | UUID FK → users.id | The organizer who owns this contact |
| `name` | TEXT | |
| `phone` | TEXT | |
| `linked_user_id` | UUID FK → users.id NULLABLE | If this contact is a registered user |
| `tag` | TEXT | e.g., "מלצר", "מנהל" |
| `notes` | TEXT | |

### `groups`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `owner_id` | UUID FK → users.id | |
| `name` | TEXT | |

### `group_members`
| Column | Type | Notes |
|---|---|---|
| `group_id` | UUID FK → groups.id | |
| `contact_id` | UUID FK → contacts.id | |

### Key RPCs (PostgreSQL Functions)
| Function | Purpose |
|---|---|
| `create_tender_with_payment` | Atomically creates a tender and deducts credits |
| `add_credits_to_user` | Atomically adds credits (used after purchase) |
| `get_user_credits` | Returns current credit balance |

---

## 6. Credits System

Credits are the **monetization engine** for the Hire side.

```
Organizer wants to post a tender
        ↓
Check credits > 0 (client-side guard)
        ↓
Call create_tender_with_payment RPC
        ↓
PostgreSQL function (atomic):
  1. Check credits >= cost
  2. Deduct cost from users.credits
  3. Insert into tenders
  4. Return new tender_id
        ↓
Client invalidates ['tenders'] and ['user', userId]
```

**Cost model (v1):** 1 tender = 1 credit (defined server-side in the RPC).

**Credit purchase flow:** Handled via in-app purchase (IAP) or payment gateway. On successful payment, call `add_credits_to_user` RPC from a server-side webhook (never trust client-side credit grants).

**UI rules:**
- Show credits badge in Hire mode header (amber color)
- Warn at < 10 credits
- Block tender creation at 0 credits

---

## 7. Realtime Strategy

Supabase Realtime keeps data fresh without polling.

| Channel | Table | On Event | Action |
|---|---|---|---|
| `tenders-changes` | `tenders` | INSERT/UPDATE/DELETE | `invalidateQueries(['tenders'])` |
| `invites-changes` | `invites` | INSERT/UPDATE/DELETE | `invalidateQueries(['tenders'])` |
| `contacts-changes` | `contacts` | INSERT/UPDATE/DELETE | `invalidateQueries(['contacts', userId])` |

All channels are opened in `AppContext` on mount and cleaned up on unmount.

> **Future optimization:** Add user-scoped filters to realtime subscriptions once user base grows, to reduce unnecessary re-renders.

---

## 8. Environment Management

### 8.1 Environment Files
```
.env.local          # Local development (gitignored)
.env.staging        # Staging (gitignored, loaded via EAS secrets)
.env.production     # Production (gitignored, loaded via EAS secrets)
```

Required environment variables:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

> `EXPO_PUBLIC_` prefix makes variables available to the Expo client bundle. Never put secret keys (service role) in the client app.

### 8.2 Supabase Projects
| Environment | Purpose |
|---|---|
| **Development** | Local dev (`supabase start`) or shared dev project |
| **Staging** | Matches production schema; used for pre-release testing |
| **Production** | Live app data (`jobii.co.il` domain) |

### 8.3 EAS Build Profiles
In `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "staging": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "autoIncrement": true,
      "distribution": "store"
    }
  }
}
```

### 8.4 Branch Strategy (Solo Dev)
```
main          ← production-ready code only
└── feat/     ← feature branches (feat/create-tender-v2)
└── fix/      ← bug fixes
```

**Workflow:** `feat/*` → PR to `main` → merge → EAS build triggers.

Commit message format: `feat(tender): add quota validation` / `fix(rtl): mirror icon in contacts row`

---

## 9. Security Considerations

### 9.1 Row-Level Security (RLS) — Critical
- **All tables must have RLS enabled.**
- Organizers can only read/write their own tenders and contacts.
- Participants can only read invites where `user_id = their id`.
- Credits can only be modified by server-side RPCs — never by direct table update.

### 9.2 Client-Side Role Guards
- Role guards in the UI (e.g., hiding the Hire dashboard from participants) are UX only.
- Security is enforced by RLS policies, not by UI conditionals.

### 9.3 Data Exposure
- The anon key is safe to expose in the client bundle — RLS prevents unauthorized access.
- Never log user PII (phone numbers, names) to console in production builds.
- Phone numbers are stored in E.164 format and never displayed in raw form to other users.

---

## 10. Scalability Roadmap

| Phase | Focus |
|---|---|
| **v1 (now)** | Stable Play Store / App Store release. Phone login, tenders, invites, contacts, credits purchase. |
| **v2** | Supabase Auth OTP, push notifications (Expo Notifications), deep links for guest invites. |
| **v3** | AI matching (suggest best candidates), ratings system, payment integration (Stripe/Tranzila). |
| **v4** | Dual-role accounts (user is both seeker and organizer), advanced analytics dashboard. |
