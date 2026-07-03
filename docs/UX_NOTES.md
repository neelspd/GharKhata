# GharKhata — UX Notes

## UX Goal

GharKhata should feel like a digital household diary, not accounting software.

The user should be able to quickly answer:

- What happened today?
- What did we consume and from whom?
- Who do we need to pay?
- What is pending this month?

---

## Design Tokens (locked)

```
--paper:   #F4F1EA   page background
--panel:   #FAFAF8   cards, drawers, panels
--ink:     #2C2C2A   primary text
--muted:   #888780   labels, captions, secondary info
--rule:    #B4B2A9   borders (solid in final; dashed only for draft/unsettled states)
--redline: #B14A2C   the single accent — corrections, audit markers, primary CTA per screen
```

Typography:
- IBM Plex Mono (or JetBrains Mono) for all numbers, amounts, quantities, dates — with `font-variant-numeric: tabular-nums` so columns align
- IBM Plex Sans (or Inter) for labels and UI chrome

CTA rule: one filled `--redline` button per screen for the state-changing action. Everything else ghost or text-style.

---

## Main Navigation

```text
Diary          ← calendar-based daily entries (home screen)
Dashboard      ← monthly overview
Vendors        ← vendor ledger / khata per vendor
Settlement     ← monthly close workflow
Categories     ← config management (units, bill types)
```

Settings lives outside the main nav (user profile, household settings, auth).

---

## Screen 1: Diary (Calendar)

Primary daily interaction surface.

Each day shows small inline chips:

```text
Milk ₹105   Laundry 5 items   Veg ₹230
```

Dot on the cell = day has at least one entry logged.

Clicking a day opens the entry drawer:

- Desktop: calendar left, drawer right
- Mobile: calendar or date list, bottom sheet

**Entry drawer:**

For each active daily category, show:
- Vendor selector (who is this from? Ramesh Dairy, Suresh Laundry, etc.)
- Unit dropdown (Liters / Packets for Milk)
- Quantity input
- Live computed amount (quantity × rate, or direct amount if no rate)

Already-logged values pre-fill. Editing shows a note: *"editing posts a correction — original preserved."*

Fixed-monthly items (Newspaper, House Help Salary) are excluded from the daily drawer — they appear in a separate read-only section below the calendar.

---

## Screen 2: Dashboard

Month-to-date overview.

Cards:
- Total spend this month
- Pending payments (sum of outstanding vendor balances)
- Per-category totals

Charts:
- Category breakdown (bar or donut)
- Month-over-month trend per category

Feed:
- Recent corrections (audit trail, redline-accented)
- Upcoming salary or fixed-bill payments

Language guide:
- Use: *This month*, *Pending payments*, *People to pay*, *Recent entries*
- Avoid: *Accounts payable*, *Debtors*, *Journal*, *Trial balance*

---

## Screen 3: Vendors

List of all vendors in the household's khata.

```text
Ramesh Dairy         Milk        ₹3,150 due
Suresh Laundry       Laundry       ₹820 due
Kamla Bai            House help  ₹6,000 due
```

Clicking a vendor opens their ledger page:

- Vendor profile (name, category, contact)
- This month: total consumed, paid, balance
- Daily entries for this vendor (chronological, with corrections visible)
- Payment history
- Notes or disputes

The user should always be able to see at a glance:

> How much do I owe this vendor?

---

## Screen 4: Settlement (Monthly Close)

Month-end payable summary.

State machine: `Draft → Reviewed → Closed → Paid`

Each vendor advances independently. Milk can be Paid while Laundry is still Draft.

```text
Vendor          | Total   | Paid    | Balance | Status    | Action
Ramesh Dairy    | ₹3,150  | ₹2,000  | ₹1,150  | Reviewed  | [Mark closed]
Suresh Laundry  | ₹820    | —       | ₹820    | Draft     | [Mark reviewed]
Kamla Bai       | ₹6,000  | ₹6,000  | —       | Paid      | Settled ✓
```

Draft borders use `--rule` dashed style to signal unsettled state.
Paid rows use the `--redline` accent on the badge.

Actions per row:
- Mark reviewed / closed / paid
- Record partial payment
- Add note

Export actions *(v0.2)*:
- WhatsApp-friendly settlement text
- PDF statement
- Excel/CSV

---

## Screen 5: Categories

Config-driven bill types. Adding a new category (Eggs, Gas Cylinder, Water Cans) is a data insert — no redeploy.

Each category shows:
- Name and type (Quantity + rate / Variable amount / Fixed monthly)
- Units assigned, with rate per unit (or "direct amount" if no rate)
- Inline "+ Add unit" control to assign more units to the same category

Units Master section below the category list:
- Shared units (L, KG, PKT, DZ, PCS) reusable across categories
- "+ Add unit" form (code + name)

---

## Mobile UX

Bottom navigation tabs:
```text
Today   |   Calendar   |   Vendors   |   Settlement   |   More
```

Priorities:
- Today screen with quick-add per category
- Vendor balances visible in one tap
- Large touch targets, minimal typing
- Bottom sheet for entry drawer
- Numeric keyboard auto-opens for quantity/amount fields

---

## Tone of Voice

Use:
```
Add today's milk
People to pay
Milk skipped today?
Generate monthly bill
Mark as paid
How much is pending?
```

Avoid:
```
Create financial transaction
Reconcile liability
Post journal entry
Debit / Credit (internal only, never shown to users)
```

---

## Correction UX

Corrections are visible, not silent.

When a user edits an already-logged entry:
- The form pre-fills the logged values
- A note reads: *"Logged on [date]. Editing this will post a correction — the original is preserved in the audit trail."*
- After saving, the corrected value shows on the calendar cell; the original is visible in the vendor ledger history and the Dashboard corrections feed
- Corrections use the `--redline` accent in the feed to make them easy to spot
