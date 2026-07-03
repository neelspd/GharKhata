# GharKhata — Product Brief

## Summary

GharKhata is a calendar-based household ledger designed for Indian homes.

It digitizes the physical household diary used to track daily services, recurring bills, vendor accounts, and monthly payments.

The product is not a generic expense tracker. It is a digital khata for household operations — one that understands vendors, daily consumption, and end-of-month settlement.

---

## Problem

Many Indian households track recurring daily and monthly expenses in a physical diary or khata.

Common entries include:

- Daily milk (from the milkman)
- Laundry clothes (at the dhobi or laundry shop)
- Fruits and vegetables
- Grocery bills
- Maid salary
- Cook salary
- Driver salary
- Newspaper bill
- Water cans
- Society maintenance
- Garbage collection fees

At the end of the month, these entries are manually totalled and settled with vendors or house-help workers.

This creates problems:

- Entries are easy to forget
- Rates change and are hard to track
- Skipped days are missed
- Partial payments are not clearly recorded
- Monthly settlement is manual and error-prone
- Vendor-wise balances are unclear
- Physical diaries are not searchable or shareable
- No audit trail when there are disputes

---

## Target Users

Primary:

- Indian families
- Household managers
- Parents managing daily household services
- Young adults helping digitize family workflows

Secondary:

- Small paying guest homes
- Shared apartments
- Small hostels
- Small residential communities
- Domestic operations managers

---

## Product Positioning

GharKhata is:

> A digital household khata for tracking daily services, recurring bills, and monthly settlements — vendor by vendor.

It should feel like:

- A household diary
- A vendor ledger
- A calendar
- A monthly payment assistant

It should not feel like:

- Corporate accounting software
- A complex ERP
- A generic budgeting app

---

## Core Value Proposition

GharKhata helps users answer:

- What did the household consume today?
- What did we buy, from whom, at what rate?
- How much do we owe each vendor this month?
- Which payments are pending?
- Which recurring services were skipped?
- What changed compared to last month?
- What should be settled at the end of the month?

---

## MVP Scope (v0.1)

1. Household setup (single household per account)
2. Vendor management (Ramesh Dairy, Suresh Laundry, etc.)
3. Category and unit setup (config-driven, data not code)
4. Calendar-based daily entries (manual)
5. Correction workflow (corrections are new events, originals preserved)
6. Payment recording
7. Vendor-wise monthly settlement (Draft → Reviewed → Closed → Paid)
8. Simple dashboard (spend summary, pending balances, category breakdown)

Core categories seeded by default:

- Milk
- Laundry
- House help
- Newspaper
- Vegetables and Grocery
- Other

---

## Out of Scope for MVP

The following are intentionally deferred:

- Recurring rules / auto-entry *(v0.2)*
- Multi-household support *(v0.2)*
- PDF / WhatsApp export *(v0.2)*
- Role-based permissions within a household *(v0.2)*
- Mobile app store release
- Voice entry
- OCR bill scanning
- WhatsApp bot integration
- AI-powered insights
- Complex tax or accounting features
- Multi-currency support

---

## Success Criteria

The MVP is successful when a user can:

1. Add vendors (milkman, dhobi, maid, etc.)
2. Add daily entries from a calendar view
3. See vendor-wise monthly totals
4. Record payments against a vendor
5. See pending balances per vendor
6. Advance a vendor's monthly statement through the close workflow (Draft → Paid)

---

## Product Principles

### 1. Calendar-first

Daily usage revolves around dates. The calendar is the home screen.

### 2. Vendor-wise clarity

Every recurring service connects to a named vendor. Settlement is always vendor-wise, never just category-wise.

### 3. Diary before accounting

The UX should feel like opening a household diary, not launching accounting software.

### 4. Append-only honesty

Corrections are visible — they don't silently overwrite. The audit trail matches how a physical diary actually works.

### 5. Recurring-friendly, exception-aware *(v0.2)*

Predictable daily and monthly entries should not require forever-manual input. Skipped days, rate changes, and notes matter.

### 6. Household-friendly language

Use:
- Today's entries
- People to pay
- Monthly settlement
- Pending amount
- Mark as paid

Avoid:
- Accounts payable
- Journal entry
- Debit / Credit (in the UI — used internally in the ledger engine, not exposed to users)
- Reconcile
