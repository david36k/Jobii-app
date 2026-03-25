# Jobii (formerly Mihrazone) — Deep Codebase Audit Report

**Date:** February 2, 2025  
**Role:** Senior React Native Architect / Lead Developer  
**Scope:** Full codebase — structure, data flow, config, design system, rebrand gaps.

---

## 1. Executive Summary

**Jobii** is a React Native Expo (SDK 54) app using **TypeScript**, **Expo Router**, **Supabase**, and **TanStack Query**. It implements a **two-sided marketplace** for shift/tender management: “Work” (participant) and “Hire” (organizer). The codebase is generally coherent: file-based routing is used correctly, context + React Query centralize state, and a glassmorphism-style UI is applied across screens.

**Health:** **Good** — P0/P1/P2 remediation items below are implemented (logout, single Supabase client, rebrand, tokens, dashboard structure, profile persistence, single-step login, typed tender creation, dependency cleanup). Residual notes: third-party typings are shimmed in `types/` where needed; `ModernMobileMenu` may still be unused depending on navigation.

### Remediation status (post-implementation)

| Finding / Section | Status |
|------------------|--------|
| 3.1 Logout uses `switchUser('')` | **Done** – Settings now uses `logout()` |
| 3.2 Dead `utils/supabase.ts` | **Done** – Removed; `.env.example` documents `lib/supabase.ts` |
| 3.3 Guest invites | **Done** – Documented in `supabase-queries.ts` (Option A) |
| 3.4 AddCredits cache invalidation | **Done** – Invalidates by `userId` argument |
| 3.5 Index redirect | **Done** – Redirect in `loginMutation.onSuccess` |
| 3.6 Package name / scripts | **Done** – `name`: `jobii-app`; scripts unchanged (Rork CLI); README updated |
| Section 4 Rebrand | **Done** – Translations + app.json scheme/origin → Jobii |
| Section 5.1 Colors | **Done** – `constants/colors.ts` extended; screens refactored |
| Section 5.2 Dashboard hooks / views | **Done** – `useDashboardMode`, `useWorkViewData`, `useHireViewData`; `WorkView` / `HireView` in `components/dashboard/` |
| Section 5.3 EmptyState | **Done** – Used in dashboard, contacts, archive |
| Section 5.4 Typed routes | **Done** – `as any` removed from router calls |
| Section 5.5 Profile save | **Done** – `users.update` + `updateProfile` + profile/edit |
| Section 5.6 Login OTP | **Done** – Option A: single-step phone login |
| Section 8 Next steps | **Done** – P0/P1/P2 items addressed |

---

## 2. Architecture Map

High-level flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTRY & PROVIDERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  app/_layout.tsx                                                             │
│    QueryClientProvider → GestureHandlerRootView → LanguageProvider           │
│      → AppProvider → RootLayoutNav (Stack) → Toaster                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTH GATE (app/index.tsx)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Reads: useApp() → currentUser, isInitialized, switchUser                   │
│  • If !isInitialized || currentUser → show loading then redirect             │
│  • If no user: phone input → “OTP” (mock) → loginMutation (getByPhone/create)│
│  • onSuccess: switchUser(user.id) → useEffect redirects to /(tabs)/dashboard │
│  • Data: supabaseQueries.users.getByPhone(phone) / .create()                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│   AppContext (contexts/        │         │   LanguageContext             │
│   AppContext.tsx)              │         │   (LanguageContext.tsx)       │
├───────────────────────────────┤         ├───────────────────────────────┤
│ • currentUserId (AsyncStorage) │         │ • language, isRTL              │
│ • React Query: user, tenders,  │         │ • switchLanguage, t()         │
│   contacts, groups             │         │ • translations (he/en)        │
│ • Realtime: tenders, invites,  │         └───────────────────────────────┘
│   contacts                     │
│ • Mutations: switchUser,       │
│   addCredits, createTender,     │
│   updateInviteStatus, contacts │
│   CRUD, deleteAccount, logout   │
└───────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TAB LAYOUT (app/(tabs)/_layout.tsx)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Stack (dashboard | contacts | groups | archive | settings)                 │
│  + BottomNavBar: Dashboard, Contacts, Archive (no Settings/Groups in nav)   │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬───────────────┬───────────────┐
    ▼               ▼               ▼               ▼               ▼
dashboard.tsx   contacts.tsx   groups.tsx    archive.tsx   settings.tsx
(Work/Hire      (contacts +     (placeholder  (past         (profile,
 toggle,         groups tabs)   “בקרוב”)      tenders)      credits, logout)
 myWork / 
 myTenders)
    │
    ├── Work: myWork (invites for currentUser) → participant/tender-details
    └── Hire: myTenders (organizerId === currentUser) → organizer/tender-details
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DEEP ROUTES (expo-router)                                                    │
│  organizer/create-tender, organizer/tender-details                           │
│  participant/tender-details, profile/edit, tokens (credits)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data flow summary:**  
Auth is determined by `currentUserId` in AsyncStorage. AppContext loads it, then React Query fetches user, tenders, contacts, groups from Supabase via `supabase-queries`. Realtime subscriptions invalidate these queries. Screens consume `useApp()` (and optionally `useLanguage()`). Navigation is file-based; links use `router.push()` / `router.replace()` with path strings (some `as any` for typing).

---

## 3. Critical Findings (Red Flags)

### 3.1 Logout uses `switchUser('')` instead of `logout()`

**Where:** `app/(tabs)/settings.tsx` — `handleLogout` calls `await switchUser('')`.

**Issue:**  
- `switchUser('')` stores `'currentUserId' => ''` in AsyncStorage and sets `currentUserId` to `''`.  
- Next app load runs `currentUserQuery` with key `['user', '']`, which can trigger a bogus API call and odd UX.  
- `logout()` in AppContext correctly: removes `currentUserId` from AsyncStorage, sets `currentUserId` to `null`, and clears the query client.

**Fix:** In settings, call `logout()` from `useApp()` instead of `switchUser('')`, then `router.replace('/')` (and optional haptic). Ensure `logout()` is exported and used consistently for “log out” actions.

---

### 3.2 Two Supabase clients and dead `utils/supabase.ts`

**Where:**  
- **Active:** `lib/supabase.ts` — uses `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, AsyncStorage for auth.  
- **Unused:** `utils/supabase.ts` — uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, no AsyncStorage.

**Issue:**  
- Only `lib/supabase` is imported (by `supabase-queries.ts` and `AppContext.tsx`).  
- `utils/supabase.ts` is dead code and references different env vars; keeping it risks future misuse or wrong client in new code.

**Fix:** Remove `utils/supabase.ts`. Standardize on `lib/supabase.ts` and document required env vars (`EXPO_PUBLIC_SUPABASE_*`) in README or `.env.example`.

---

### 3.3 Guest invites cannot accept/reject in-app

**Where:**  
- `utils/supabase-queries.ts`: `invites.updateStatus(tenderId, userId, status)` filters by `user_id = userId`.  
- DB: `invites.user_id` is nullable (guests).  
- `app/participant/tender-details.tsx`: finds invite by `inv.userId === currentUser.id`; `updateInviteStatus(tender.id, currentUser.id, …)`.

**Issue:**  
Guests (invited by phone only, `user_id` null) never have `userId === currentUser.id`. So they never see the participant tender-details screen as “invited” and cannot accept/reject. Either the product assumes only registered users get in-app invites, or a separate flow (e.g. link + phone/OTP) is needed for guests.

**Recommendation:**  
- If only registered users are intended to respond in-app: document this and optionally hide “invite by phone only” or show a message that they must register first.  
- If guests should respond: add a flow keyed by `(tender_id, user_phone)` or invite id (e.g. magic link or OTP) and an update path that doesn’t rely on `user_id`.

---

### 3.4 Add-credits mutation cache invalidation

**Where:** `contexts/AppContext.tsx` — `addCreditsMutation.onSuccess` invalidates `['user', currentUserId]`.

**Note:** Call sites pass `currentUser.id` (e.g. dashboard “add credits”). So `currentUserId` and the passed `userId` match. If you later allow “add credits for another user” (e.g. admin), invalidate `['user', userId]` (the argument) or both.

---

### 3.5 Index screen redirect logic

**Where:** `app/index.tsx`: `if (!isInitialized || currentUser) { return loading; }` then `useEffect` redirects when `isInitialized && currentUser`.

**Note:** For a brief moment after `switchUser(user.id)`, `currentUser` can still be from the previous query (e.g. undefined) until the new query resolves. The redirect depends on the next render with updated `currentUser`. If you see rare “stuck on loading” or double redirects, consider redirecting in `loginMutation.onSuccess` (e.g. `router.replace('/(tabs)/dashboard')`) as well, or ensure `setCurrentUserId` and query invalidation are synchronous enough.

---

### 3.6 Package name and scripts

**Where:** `package.json`: `"name": "expo-app"`; scripts use `bunx rork start ...` (e.g. `rork` instead of `expo`).

**Issue:**  
- “expo-app” is generic; “jobii” or “jobii-app” would match the product.  
- If “rork” is a typo for “expo”, fix scripts; if it’s a custom wrapper, document it so future devs don’t “correct” it to expo.

---

## 4. Rebranding Gaps (Mihrazone → Jobii)

| Location | Current | Action |
|----------|--------|--------|
| `constants/translations.ts` (he) | `contactEmail: '...support@mihrazone.com'` | Replace with Jobii support email / copy. |
| `constants/translations.ts` (en) | Same key, `support@mihrazone.com` | Same as above. |
| `app.json` | `"scheme": "rork-app"` | Consider `jobii` or `com.jobii.app` for deep links. |
| `app.json` | `expo-router plugin "origin": "https://rork.com/"` | Align with Jobii domain if different. |

**Already updated:**  
- `app.json`: name “Jobii - מכרזי עובדים”, slug “jobii”, iOS/Android identifiers `com.jobii.app`.  
- Login and settings: “Jobii” in UI.  
- `LanguageContext`: `LANGUAGE_KEY = '@jobii_language'`.  
- Migrations: “Jobii Database Schema” comment.

**Suggested:**  
- Grep for `mihrazone`, `rork`, and `Mihrazone` (case-insensitive) in code, config, and comments and replace or document any remaining references.

---

## 5. Refactoring Recommendations

### 5.1 Use `constants/colors.ts` and reduce hardcoded hex

**Current:**  
`constants/colors.ts` defines a minimal light theme (`tintColorLight`, `text`, `background`, etc.). Almost all screens use raw hex (e.g. `#4F46E5`, `#10B981`, `#6B7280`, `#111827`).

**Recommendation:**  
- Extend `colors.ts` with semantic tokens: primary, secondary, success, warning, error, text, textSecondary, background, card, border, etc., and reuse them.  
- Replace hardcoded hex in `app/` and `components/` with imports from `@/constants/colors`.  
- Optionally add glassmorphism presets (e.g. `glassBackground`, `glassBorder`) to keep blur/cards consistent.

---

### 5.2 Extract dashboard “Work” / “Hire” logic into hooks

**Current:**  
`app/(tabs)/dashboard.tsx` is large: mode toggle, `myWork`/`myTenders` derived lists, `monthlyEarnings`, `upcomingShifts`, credits logic, and two big sub-views (`WorkView`, `HireView`) with inline styles.

**Recommendation:**  
- `useDashboardMode()`: mode state + `handleModeChange`.  
- `useWorkViewData(currentUser, tenders)`: `myWork`, `monthlyEarnings`, `upcomingShifts`.  
- `useHireViewData(currentUser, tenders)`: `myTenders`, `hasLowCredits`, `hasNoCredits`.  
- Move `WorkView` and `HireView` to `components/` (or `app/(tabs)/components/`) and pass props from the hooks.  
- Reduces re-renders and makes dashboard.tsx a thin orchestrator.

---

### 5.3 Use shared `EmptyState` component

**Current:**  
`components/EmptyState.tsx` exists but is not imported anywhere. Screens (dashboard, contacts, archive, create-tender) each implement their own empty-state layout (icon + title + subtitle).

**Recommendation:**  
- Use `<EmptyState icon={...} title="..." subtitle="..." />` (and optional `iconColor`) everywhere an empty list or state is shown.  
- Aligns copy and layout and reduces duplication.

---

### 5.4 Unify Hebrew/English and RTL in dashboard

**Current:**  
Dashboard keeps local `language` state and toggles he/en in the header, but does not use `useLanguage()` or `t()` for strings; other screens (e.g. settings, archive) use `t()`.

**Recommendation:**  
- Use `useLanguage()` and translation keys for all dashboard strings (greeting, mode labels, section titles, empty states, credits, etc.).  
- Remove local `language` state from dashboard if the single source of truth is `LanguageContext`; or clearly document why dashboard language is separate.

---

### 5.5 Typed routes and navigation

**Current:**  
Many `router.push(... as any)` / `router.replace(... as any)` (e.g. `router.push('/(tabs)/settings' as any)`). `app.json` has `"typedRoutes": true`.

**Recommendation:**  
- Regenerate or fix typed routes so `router.push` accepts typed paths and params.  
- Replace `as any` with proper `Href` types to catch broken links at compile time.

---

### 5.6 Profile edit does not persist

**Current:**  
`app/profile/edit.tsx` has name/phone state and “Save” shows an alert “הפרופיל עודכן בהצלחה” but does not call Supabase or any mutation to update the user.

**Recommendation:**  
- Add `updateProfile` (or similar) in AppContext/supabase-queries that updates `users` by id.  
- Call it from EditProfile on Save, then invalidate `['user', currentUserId]` and optionally `router.back()`.

---

### 5.7 Login “OTP” is not real verification

**Current:**  
Index screen shows “קוד אימות” and an OTP input, but the submit path only uses phone number (formatted) with `getByPhone`/create; the OTP value is not validated or sent to the backend.

**Recommendation:**  
- Either remove the OTP step and make it “phone only” for now, or integrate a real SMS/backend OTP verification and send the code in the login request.  
- Avoid implying security (e.g. “קוד אימות”) if there is no verification.

---

## 6. Design System & UI Consistency

### 6.1 Glassmorphism usage

- **Blur:** `expo-blur`’s `BlurView` with `intensity={80–90}` and `tint="light"` is used on headers, cards, toggles, and modals.  
- **Gradients:** `expo-linear-gradient` for backgrounds (e.g. `#EEF2FF` → `#F8FAFC` → `#FFFFFF`) and CTAs (indigo/purple, green, amber).  
- **Cards:** Often `backgroundColor: 'rgba(255,255,255,0.7)'` or similar with border and shadow.  
- **Consistency:** The pattern is consistent; the main gap is color values being scattered (see 5.1).

### 6.2 Hardcoded values that should move to constants

- **Primary / accent:** `#4F46E5`, `#6366F1` (indigo) — primary actions, links, active states.  
- **Success / work mode:** `#10B981`, `#059669`, `#047857`.  
- **Warning / credits:** `#F59E0B`, `#D97706`, `#FBBF24`.  
- **Error / danger:** `#DC2626`, `#EF4444`.  
- **Neutrals:** `#111827`, `#374151`, `#6B7280`, `#9CA3AF`, `#D1D5DB`, `#E5E7EB`, `#F9FAFB`.  
- **Archive purple:** `#7C3AED`, `#6D28D9`, `#A78BFA`.  

These should live in `constants/colors.ts` (and optionally in a small theme object) and be referenced by screens and components.

### 6.3 RTL and layout

- RTL is forced in root layout (`I18nManager.forceRTL(true)`).  
- Screens use `flexDirection: 'row-reverse'`, `textAlign: 'right'`, and `alignItems: 'flex-end'` appropriately.  
- Settings and LanguageContext handle language switch and RTL; dashboard language toggle is the outlier (see 5.4).

---

## 7. Configuration & Dependencies

### 7.1 package.json

- **React 19.1.0, React Native 0.81.5, Expo ~54:** Reasonable and aligned.  
- **expo-router ~6.0.15, @tanstack/react-query ^5.83.0:** Appropriate.  
- **lucide-react-native, expo-blur, expo-linear-gradient, sonner-native:** Good choices for icons, blur, gradients, and toasts.  
- **moti:** Used for enter animations; no issue.  
- **zustand:** Present in dependencies but not used in the audited files; remove if unused or reserve for future state.  
- **@rork-ai/toolkit-sdk:** If unused, remove to avoid confusion.  
- **Scripts:** Clarify or fix `rork` vs `expo` (see 3.6).

### 7.2 app.json

- **name, slug, bundle id, package:** Set to Jobii; good.  
- **scheme:** `rork-app` — align with Jobii if this is the public URL scheme.  
- **expo-router origin:** `https://rork.com/` — align with Jobii domain.  
- **typedRoutes: true:** Use it to remove `as any` (see 5.5).

### 7.3 tsconfig.json

- **paths:** `"@/*": ["./*"]` — correct for `@/contexts`, `@/components`, etc.  
- **strict: true** — good.

### 7.4 babel.config.js

- **babel-preset-expo** with `unstable_transformImportMeta: true` — fine for Expo.

---

## 8. Next Steps (Prioritized)

1. **Fix logout (P0)**  
   In `app/(tabs)/settings.tsx`, replace `switchUser('')` with `logout()` from AppContext and then `router.replace('/')`. Verify no other place relies on “logout by switching to empty string”.

2. **Finish rebrand (P0)**  
   In `constants/translations.ts`, replace `support@mihrazone.com` with Jobii support email (and any other Mihrazone/rork references). In `app.json`, set `scheme` and expo-router `origin` to Jobii values if needed.

3. **Remove dead code and duplicate client (P1)**  
   Delete `utils/supabase.ts`. Confirm no references; document that Supabase is only via `lib/supabase.ts` and `EXPO_PUBLIC_*` env vars.

4. **Design tokens and colors (P1)**  
   Extend `constants/colors.ts` with semantic tokens (primary, success, warning, error, neutrals, glass). Refactor 2–3 high-traffic screens (e.g. index, dashboard, settings) to use these tokens; then roll out to the rest.

5. **Profile save and login honesty (P2)**  
   Implement real profile update in Supabase and call it from profile/edit.  
   Either remove the fake OTP step on login or implement real OTP and document the flow.

6. **Dashboard refactor and i18n (P2)**  
   Extract Work/Hire hooks and optional subcomponents; switch dashboard to `useLanguage()` and `t()` for all user-facing strings.

7. **Typed routes and EmptyState (P2)**  
   Fix or regenerate typed routes and replace `as any` on navigation. Start using `EmptyState` in dashboard, contacts, and archive.

---

## 9. Folder Structure (Expo Router & Separation)

- **app/:** File-based routes; `_layout.tsx` at root and under `(tabs)`; `index` as auth gate; `(tabs)` group for main tabs. Aligns with Expo Router.  
- **components/:** Only three files; BottomNavBar is used; EmptyState and ModernMobileMenu are unused.  
- **contexts/:** AppContext and LanguageContext; clear and used.  
- **constants/, types/, utils/, lib/:** Clear roles. Duplicate Supabase client in `utils/` should be removed.  
- **Suggested:** Add `app/(tabs)/components/` or `components/dashboard/` for WorkView/HireView if extracted; keep `components/` for global UI (BottomNavBar, EmptyState, etc.).

---

*End of audit. Use this document as a living checklist; update as you address items and re-run spot checks (logout, env, rebrand grep, and one navigation path).*
