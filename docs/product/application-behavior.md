# Application behavior

This document captures **target-state product and UX behavior** for the internal Alutec application.

It complements `CONTEXT.md`:
- `CONTEXT.md` defines the business language and domain invariants
- this file defines how the application expresses those concepts to users

## Project as the navigation root

The main entity users navigate to in the application is the **Project (Projeto)**.

The Project page groups everything related to one customer engagement:
- orçamento options and revisions
- commercial acceptance
- receivables
- OS
- supplier orders
- fabrication progress
- installation scheduling
- alerts and deviations

A Project is created transparently when an orçamento is initiated. Users do not need a separate “create project” action.

Pre-acceptance commercial work still lives in an **Orçamentos** area, but it belongs to the same Project context.

## Unified interface

All roles use the **same page structure**:
- same dashboard structure
- same project page structure
- same calendar component

What changes per role is:
- which data is visible
- which actions are available

Actions a role cannot perform are **hidden**, not disabled.

## Role-scoped behavior

The application adapts by:
- data scope
- available actions
- filters relevant to the current role(s)

Users may hold **multiple roles** and should see the union of the behaviors available to them.

## Notifications

Notifications are triggered by:
1. **state transitions**
2. **time-proximity conditions**

### Severity levels

| Severity | Meaning | UI behavior |
|----------|---------|-------------|
| `info` | Something happened the user should know about | dismissible in bell inbox |
| `warning` | Something needs attention soon | dismissible in bell inbox |
| `alert` | Something is blocking work or overdue | cannot be dismissed; can be acknowledged / snoozed and auto-resolves when the condition resolves |

### Notification surfaces

The same underlying conditions drive:
- bell inbox
- project alert section
- dashboard pendency list
- calendar severity color state

### Toasts

Toasts are separate from the bell inbox.

They are used for immediate feedback about an action the current user just performed, for example:
- `PO sent to supplier`
- `OS approved`
- `Installation scheduled`

## Dashboard pendency list

The dashboard contains a **persistent work-queue component** showing items where the next required action belongs to the current logged-in user.

This is different from notifications:
- **notifications** = things the user should know about
- **pendencies** = things the user can unblock right now

The pendency list updates automatically as responsibilities change.

## Project alert section

Every Project page includes an alert section showing the active warnings and alerts affecting that Project, regardless of which role they target.

This gives any user opening the Project a full risk picture.

## Calendar

There is one shared calendar component.

The calendar shows dated operational events such as:
- installation appointments
- receivable due dates
- supplier payable dates
- supplier pickup / delivery dates
- forecast delivery dates where relevant

### Calendar filtering

Role differences appear through **filter visibility**, not through separate calendar UIs.

Examples:
- everyone sees installation commitments
- Finance and Purchasing see receivable / payable dates
- Purchasing sees supplier pickups and deliveries

### Calendar color language

Events use the same severity language as notifications:
- neutral = healthy
- amber = warning
- red = alert

### Calendar as scheduling guardrail

When scheduling installation, the calendar must expose existing crew and vehicle commitments so double-booking is visible before confirming a date.

## Fabrication workers and system access

Fabrication workers are **not application users** in MVP.

The system must still support the fabrication workflow, but through:
- OS documents
- purchasing / administrative coordination
- project and task visibility for the users who proxy that work

## Document generation

The application must generate:
- orçamento PDFs
- OS PDFs

The generated documents must reflect the actual company format closely enough to replace the current Word-based workflow.

## How to use this file

Use this file when you need:
- target-state product behavior
- UI consistency rules
- notification behavior
- dashboard / project page / calendar behavior
- document-generation behavior

Do **not** treat this file as the canonical business glossary. That lives in `CONTEXT.md`.
