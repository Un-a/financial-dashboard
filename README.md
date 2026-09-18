# Financial Dashboard (Finboard)

A financial monitoring dashboard for Serbian entrepreneurs, built as a portfolio project.

The application gives sole proprietors operating under Serbia's flat-rate tax regime (**paušal**) a single view of their cash position: multi-currency account balances, a full cash flow statement, and progress toward the two tax-regime limits that determine whether they can stay on paušal or have to register for VAT. It is not an invoicing tool, not a bookkeeping system, and not a compliance checker — it sits as a visibility layer on top of the entrepreneur's existing invoicing workflow (SEF or third-party tools).

## Demo

[Finboard](https://un-a.github.io/financial-dashboard/)

> **Note:** The project currently runs on mock data seeded with `@faker-js/faker` (15 months of invoices and payments across 4 accounts, with realistic seasonality).

## Features

* Cash Flow Statement (Operating / Investing / Financing) with drill-down by category and by period
* Simplified summary table (Beginning balance / Income / Expense / Ending balance) for Last month, Month-to-date, and Year-to-date
* Paušal limit tracker — 6,000,000 RSD, calculated on a calendar-year basis
* VAT (PDV) limit tracker — 8,000,000 RSD, calculated on a rolling 365-day basis
* Sortable, filterable, paginated tables for invoices and payments

## How It Works

The project is a client-side React app; there is no backend in the current phase.

### 1. Data model

Two core entities — `Invoice` and `Payment` — plus `Account` and `ExchangeRate`. Payments carry a `direction` (`in`/`out`) and a `category` (`operating` / `investing` / `financing`) from the start, even though the MVP only needs inflows, because a real bank statement import (a later phase) will need both directions and categories to already exist in the model.

### 2. Tax limit tracking

Both limits are calculated on **promet** — accrual, based on invoice issue date — never on actual cash received, since that's how the regime is legally defined. The paušal limit resets every calendar year; the VAT limit is a rolling 365-day window, so the two widgets use different date logic even though they look identical.

### 3. Cash flow statement

Payments are aggregated into a standard three-category statement (Operating / Investing / Financing), mirroring the structure a real bank statement import will eventually populate.

### 4. Planned: forecasting

A rule-based baseline (known obligations + expected payments on unpaid invoices) will later be extended with an AI layer that looks at 12–18 months of historical patterns and seasonality to flag likely cash shortfalls, with the AI output clearly labeled as an estimate rather than a fact.

## Tech Stack

### Frontend

* **React + TypeScript**
* **Zustand** — state management
* **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`
* **Vite** — build tooling
* **TanStack Table** — sortable/filterable/paginated tables

### Data

* **@faker-js/faker** — mock data generation (development phase)

## Why I Built It

Sole proprietors on Serbia's paušal regime mostly track their finances in Excel or a notebook, or use niche invoicing tools (SEF and similar) that show individual invoices but no consolidated financial picture. The two things that actually cause stress — missing the moment to register for VAT, and not knowing whether there's enough cash coming — are both things a dashboard sitting on top of the existing invoicing tools can answer, without asking the user to change how they invoice or trusting a compliance engine to file anything on their behalf.