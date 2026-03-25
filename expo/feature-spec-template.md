# Feature Spec: [FEATURE NAME]
**Status:** Draft | In Review | Approved | In Progress | Done
**Date:** YYYY-MM-DD
**Affects Mode:** Work | Hire | Both | Auth | Global

---

## 1. Overview

### 1.1 One-Line Summary
> What does this feature do in one sentence?

### 1.2 Problem Statement
> What user pain or gap in the product does this solve? Be specific.
>
> Example: "Organizers have no way to know if an invited worker is available before sending an invite, resulting in high rejection rates."

### 1.3 Success Criteria
> How do we know this feature is working correctly?
- [ ] Criterion 1
- [ ] Criterion 2

---

## 2. User Stories

### Work Mode (Seeker – `participant` role)
> Delete if this feature doesn't affect Work mode.

- **As a** gig seeker, **I want to** [action], **so that** [outcome].
- **As a** gig seeker, **I want to** [action], **so that** [outcome].

### Hire Mode (Organizer – `organizer` role)
> Delete if this feature doesn't affect Hire mode.

- **As an** organizer, **I want to** [action], **so that** [outcome].
- **As an** organizer, **I want to** [action], **so that** [outcome].

---

## 3. UI / Screen Design

### 3.1 Screens Affected
List every screen that changes, and what changes:

| Screen | Route | Change Type | Description |
|---|---|---|---|
| Example: Dashboard | `/(tabs)/dashboard` | New section added | Show new widget below header |
| Example: Tender Detail | `/organizer/tender/[id]` | New button | Add "Share" CTA |

### 3.2 New Screens (if any)
For each new screen, describe:

**Screen: [Name]**
- **Route:** `app/path/to/screen.tsx`
- **Mode:** Work / Hire / Both
- **Background gradient:** Work (emerald) / Hire (indigo) / Login (blue-yellow)
- **Layout description:**
  ```
  [SafeAreaView]
  ├── [Header: BlurView glass card] — title, back button
  ├── [Body: ScrollView]
  │   ├── [Section 1: ...]
  │   └── [Section 2: ...]
  └── [Footer: action button]
  ```
- **RTL notes:** Describe any layout elements that need mirroring in RTL.

### 3.3 New Components (if any)
| Component | Location | Props | Notes |
|---|---|---|---|
| `TenderCard` | `components/tender/TenderCard.tsx` | `tender: Tender, onPress: () => void` | Glass card style |

---

## 4. Data Model

### 4.1 New Tables / Columns
> Leave empty if no DB changes.

```sql
-- Example: Add availability flag to invites
ALTER TABLE invites ADD COLUMN is_available BOOLEAN DEFAULT NULL;
```

| Table | Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|---|
| `invites` | `is_available` | BOOLEAN | YES | NULL | Set by seeker before invite sent |

### 4.2 Modified Tables
> Describe any changes to existing columns (renames, type changes, index additions).

### 4.3 New RPCs Required
> Use RPCs for any multi-table or atomic operations.

| Function Name | Input Params | Returns | Purpose |
|---|---|---|---|
| `mark_worker_available` | `p_tender_id UUID, p_user_id UUID` | `BOOLEAN` | Atomic update of invite availability |

### 4.4 RLS Policies Required
> For every new table or access pattern, define the RLS rule.

| Table | Policy | Role | Condition |
|---|---|---|---|
| `invites` | SELECT | participant | `user_id = auth.uid()` |
| `invites` | UPDATE `is_available` | participant | `user_id = auth.uid()` |

---

## 5. State & Data Fetching

### 5.1 New React Query Keys
> Follow the hierarchy: `[entity, scope?, id?]`

| Key | Scope | Trigger |
|---|---|---|
| `['availability', userId]` | Work | User opens availability screen |
| `['hire', userId, 'candidates']` | Hire | Organizer opens candidate list |

### 5.2 New Hooks
| Hook | File | Purpose |
|---|---|---|
| `useWorkerAvailability` | `hooks/useWorkerAvailability.ts` | Fetch/set availability for current user |

### 5.3 New Supabase Query Functions
> Add to `utils/supabase-queries.ts` under the appropriate group.

```typescript
// Example structure — not the actual implementation
availability: {
  set: async (tenderId: string, userId: string, available: boolean) => { ... },
  getForTender: async (tenderId: string) => { ... },
}
```

### 5.4 Realtime Updates
> Does this feature need live updates? If yes, describe the new subscription.

| Event | Table | Handler |
|---|---|---|
| UPDATE | `invites` | Invalidate `['tenders', tenderId]` |

### 5.5 AppContext Changes
> Does AppContext need new mutations or state? (Prefer dedicated hooks over AppContext additions.)

- [ ] No AppContext changes needed
- [ ] New mutation: `[name]` — reason why it belongs in AppContext:

---

## 6. Credits & Monetization

> Delete this section if the feature doesn't involve the credit system.

- **Does this feature consume credits?** Yes / No
- **Cost per action:** X credits per [action]
- **Where is cost enforced?** Server-side (RPC) / Client guard / Both
- **Low-credit behavior:** Block the action / Show warning / Both
- **New RPC modification needed?** Describe:

---

## 7. i18n — Translation Keys

> Add ALL new user-facing strings here before writing any JSX. Both languages required.

| Key | Hebrew (`he`) | English (`en`) |
|---|---|---|
| `feature.title` | `כותרת הפיצ'ר` | `Feature Title` |
| `feature.description` | `תיאור הפיצ'ר` | `Feature Description` |
| `feature.actionButton` | `בצע פעולה` | `Do Action` |
| `feature.emptyState` | `אין פריטים` | `No items` |
| `feature.emptyStateDesc` | `פריטים יופיעו כאן` | `Items will appear here` |
| `feature.errorGeneric` | `אירעה שגיאה` | `An error occurred` |

**Section in `TranslationKeys` type:**
```typescript
featureName: {
  title: string;
  // ... rest of keys
};
```

---

## 8. Error & Edge Cases

> For every data-fetching operation, define all three states.

| State | Work Mode Behavior | Hire Mode Behavior |
|---|---|---|
| Loading | Skeleton / spinner | Skeleton / spinner |
| Empty | `EmptyState` component with [icon, title, desc, CTA] | `EmptyState` component with [icon, title, desc, CTA] |
| Error | Toast + retry button | Toast + retry button |
| No credits (Hire) | N/A | Block action + amber warning banner |
| Offline | N/A for v1 | N/A for v1 |

**Specific edge cases for this feature:**
- **Edge case 1:** What happens if [X]?
- **Edge case 2:** What happens if [Y]?

---

## 9. RTL / Hebrew Checklist

Before marking this feature as done, verify:

- [ ] All text is right-aligned by default
- [ ] Row layouts that use icons (icon + text) are mirrored in RTL
- [ ] Modal headers have close button on the left (RTL: leading side = left visually)
- [ ] Date/time formats are locale-appropriate (Hebrew: DD/MM/YYYY)
- [ ] No hardcoded strings in JSX — all use `t('key')`
- [ ] All new keys exist in both `he` and `en` in `translations.ts`
- [ ] `TranslationKeys` type is updated with new keys

---

## 10. Navigation & Routing

| Trigger | From | To | Method |
|---|---|---|---|
| Tap tender card | `/(tabs)/dashboard` | `/organizer/tender/[id]` | `router.push` |
| Back button | `/organizer/tender/[id]` | Previous screen | `router.back()` |

**New route files to create:**
- `app/[route].tsx` — description

---

## 11. Implementation Checklist

Use this to track progress during development.

### Backend
- [ ] DB migration written and tested
- [ ] RPC function created and tested
- [ ] RLS policies applied and verified
- [ ] TypeScript types updated in `types/index.ts`

### Data Layer
- [ ] New functions added to `utils/supabase-queries.ts`
- [ ] Input params and return types are fully typed (no `any`)
- [ ] `mapXFromDB()` mapper written if new table introduced

### Hooks
- [ ] New hook(s) created in `hooks/`
- [ ] React Query keys follow hierarchy convention
- [ ] `staleTime` set explicitly
- [ ] Mutation `onSuccess` invalidates correct keys

### UI
- [ ] Translation keys added to `translations.ts` (he + en)
- [ ] `TranslationKeys` type updated
- [ ] All colors use `colors.X` tokens
- [ ] Glassmorphism card pattern used for new cards
- [ ] Mode-appropriate gradient used for new screens
- [ ] Loading, empty, and error states implemented
- [ ] `EmptyState` component used for empty states
- [ ] `sonner-native` toast used for success/error feedback
- [ ] `expo-haptics` used on primary actions
- [ ] RTL checklist completed (see Section 9)

### QA
- [ ] Feature works in Hebrew (RTL) layout
- [ ] Feature works in English (LTR) layout
- [ ] Credits system not affected if unrelated to credits
- [ ] Work-mode state not leaking into Hire-mode queries (separate query keys)
- [ ] No new `console.log` statements left in production paths

---

## 12. Notes & Open Questions

> Capture decisions, risks, and unresolved questions here.

- **Decision:** [What was decided and why]
- **Risk:** [What could go wrong]
- **Open question:** [What still needs to be figured out]
- **Dependency:** [What must be done first]
