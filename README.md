# GharKhata

**GharKhata** (घर + खाता) is a calendar-based household ledger for tracking everyday Indian household expenses, recurring services, vendor-wise accounts, and monthly settlements.

It is inspired by the physical household diary or khata commonly used to track milk bills, laundry, groceries, newspaper bills, house-help salaries, and other recurring household payments.

> The traditional Indian household diary, rebuilt as a seriously over-engineered web app.

DHELA — Digital Household Expense Ledger App.

---

## Project Status

Personal pet project and portfolio project by [Neel Shah]().

The goal is not to build another generic expense tracker. The goal is a digital household ledger that understands daily consumption, recurring vendors, monthly settlements, and real-world household workflows.

Current status:

- Product ideation complete
- Backend architecture designed (FastAPI + PostgreSQL, append-only event store, double-entry ledger)
- Database schema defined and verified
- OpenAPI 3.1 contract drafted
- Frontend wireframes and vanilla HTML/CSS/JS prototype complete
- Active development in progress

---

## Core Idea

Most expense trackers ask:

> How much did you spend?

GharKhata asks:

> What did the household consume, from whom, on which date, at what rate, and what remains payable?

Example use cases:

- Track daily milk quantity and monthly milkman payment
- Track clothes given to laundry and settle with the dhobi at month-end
- Track monthly salaries for maid, cook, driver, gardener, or other house help
- Track newspaper bills
- Track daily grocery, fruits, and vegetable spending
- Generate vendor-wise monthly settlements with paid/pending breakdown
- Track payments, partial payments, and outstanding balances

---

## Core Architecture Decisions

### Append-only entry log

Every diary entry is an immutable event. Corrections are new events referencing the original — never overwrites. This preserves the full audit trail, matching how a physical diary actually works: you cross out and write below, you never erase.

### Double-entry ledger

Every entry produces a balanced debit/credit pair. The database enforces this with a constraint trigger — an unbalanced write is rejected at commit.

### Vendor-centric

Every recurring service connects to a named vendor (Ramesh the milkman, Suresh Laundry). Settlement is vendor-wise, not just category-wise.

### Config-driven categories and units

New bill types (Eggs, Bread, Gas Cylinder) are a data insert, not a code change. Each category supports multiple units (Milk in Liters or Packets, each with their own rate).

### Monthly close state machine

Each vendor's monthly statement moves through: Draft → Reviewed → Closed → Paid — independently per vendor.

---

## Planned Features

### Calendar Diary

A calendar-first view where users add daily household entries.

Examples:
- Milk: 1.5 L (Ramesh Dairy)
- Laundry: 3 shirts, 2 pants (Suresh Laundry)
- Vegetables: ₹230
- Newspaper: daily auto-entry

### Vendor Ledger

A khata-style ledger for each household vendor or service provider.

Examples:
- Ramesh Dairy (Milkman)
- Suresh Laundry
- Kamla Bai (Maid)
- Rajesh Newspapers
- Vegetable vendor

### Monthly Settlement

At month-end, a vendor-wise settlement summary:

```text
Ramesh Dairy — June 2026

Total Milk: 45 L
Rate: ₹70/L
Total: ₹3,150
Paid: ₹2,000
Balance: ₹1,150
```

### Recurring Rules *(v0.2)*

Automate predictable household entries:
- Add 1.5 L milk every day (Ramesh Dairy)
- Add newspaper bill daily
- Add maid salary monthly

### Dashboard

Monthly overview:
- Total household spend
- Pending payments and vendor-wise balances
- Category-wise spend breakdown
- Month-over-month trends

### Export and Sharing *(v0.2)*

- PDF monthly statements
- WhatsApp-friendly settlement text
- Printable monthly ledger

---

## Tech Stack

### Backend

- FastAPI (Python)
- PostgreSQL (schema-per-tenant)
- SQLAlchemy + Alembic
- Pydantic
- Docker Compose

### Frontend

- Vue 3 + TypeScript + Quasar *(preferred)*
- or Angular + Ionic
- Capacitor for mobile packaging later

### Infrastructure

Initial:
- Backend API + PostgreSQL + Frontend (Docker Compose)

Later:
- Redis, background workers, object storage, PDF export, notifications, observability

---

## Repository Structure

```text
gharkhata/
├── .gitignore
├── backend/
├── frontend/
├── docs/
├── .github/
├── LICENSE
├── NOTICE
├── CITATION.cff
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── README.md
```

---

## License

Apache License 2.0.

Free to use commercially or non-commercially. Attribution required — preserve the NOTICE file in all distributions.

See the `LICENSE` file for the full text (add via GitHub's Apache 2.0 template).

---

## Attribution

If you use, fork, modify, or distribute this project, please preserve the original copyright and attribution notices in the NOTICE file. A mention or link to the original project is appreciated.

See `CITATION.cff` for the preferred citation format (APA, BibTeX, and others).

---

## Sponsorship

Pet project, no profit intent. If this helps you, a mention or credit is appreciated. Sponsorship links in `.github/FUNDING.yml`.

---

## Author

Designed and built by **Neel Shah** — Solutions Architect, Vadodara, India.


<!-- [vadsystems.com](https://vadsystems.com) -->
