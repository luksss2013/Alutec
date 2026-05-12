# Pre-PRD draft

This is a **pre-publish PRD draft** prepared before running Matt Pocock's `/to-prd` skill.

Purpose:
- stabilize the current understanding
- keep weak schema assumptions out of the PRD
- give `/to-prd` cleaner repo inputs

This document is not a substitute for the official issue-tracker PRD that `/to-prd` will publish.

## Problem Statement

Alutec currently operates across three disconnected spreadsheets plus a paper-based OS workflow. Each artifact reflects a different department’s concern, and the business relies on memory, paper context, and customer names to connect them.

This creates fragility:
- the same customer can have multiple active jobs
- context is lost across months
- spreadsheet ownership is concentrated in specific people
- operational status is hard to see end-to-end
- expensive mistakes can happen when production proceeds from unofficial dimensions

The business needs one internal system that feels like a natural evolution of the current process while replacing spreadsheets and paper as the operating system of the company.

## Solution

Build an internal application centered on the **Project (Projeto)** as the unified entity for one customer engagement.

A Project groups:
- orçamento options and revisions
- commercial acceptance
- receivables
- OS
- supplier orders
- fabrication progress
- installation visits
- deviations and alerts

The product must:
- preserve the company’s real domain language
- support the real quote and OS document formats
- enforce the verified-dimensions hard gate
- give each role the same structural UI with role-scoped data and actions
- make the full project story visible without reconstructing it from separate spreadsheets

## User Stories

1. As a **Sales user**, I want to create a new orçamento so that a customer inquiry becomes a structured proposal.
2. As a **Sales user**, I want a Project to be created automatically when I begin an orçamento so that I do not need a separate project-creation step.
3. As a **Sales user**, I want a Project to support multiple orçamento options or revisions so that customers can choose between alternatives.
4. As a **Sales user**, I want only one orçamento to become the accepted commercial scope so that the project has a single active basis for execution.
5. As a **Sales user**, I want orçamento line items to preserve `LOCAL`, `DESCRIÇÃO`, `LINHA`, `TRATAMENTO`, `VIDRO`, `MEDIDA`, `QUANT.` and `PREÇO` so that the resulting PDF matches the business format.
6. As a **Sales user**, I want `DESCRIÇÃO` to remain manually entered free text so that unusual scope and operational notes are not overstructured.
7. As a **Sales user**, I want to generate the orçamento as a PDF so that it can replace the current Word-based document workflow.
8. As a **Finance user**, I want first-payment identification to mark the commercial acceptance event so that the workflow mirrors the real business process.
9. As a **Finance user**, I want accepted payment terms to become installments so that receivables match what was sold.
10. As a **Administrative user**, I want to create and number the OS from the accepted scope so that operations have a formal execution document.
11. As a **Sales user**, I want to review the OS before it proceeds so that quote/OS mismatches are caught early.
12. As a **Sales user**, I want measurement visits recorded explicitly so that official dimensions are traceable.
13. As the **system**, I want unofficial dimensions to block long-lead production readiness so that glass and stone are not purchased or fabricated from unsafe measurements.
14. As a **Purchasing user**, I want supplier orders tied to Projects and suppliers so that every material purchase has clear business context.
15. As a **Purchasing user**, I want the supplier’s pedido number tracked so that external follow-up uses the supplier’s own reference.
16. As a **Finance user**, I want supplier payments to follow the `sinal`, `saldo`, or `full` pattern so that the system matches the real payable model.
17. As an **Installation planner**, I want to schedule one or more installation visits per Project so that staged readiness is supported.
18. As an **Installation planner**, I want crew and vehicle commitments visible when scheduling so that double-booking is prevented.
19. As a **User**, I want the same dashboard, project page, and calendar structure regardless of role so that the system feels coherent across the company.
20. As a **User**, I want role differences to affect scope and available actions, not page structure, so that the application does not feel like multiple disconnected tools.
21. As a **User**, I want the dashboard to show my pendencies so that I know what I can unblock right now.
22. As a **User**, I want notifications and project alerts to reflect the same underlying conditions so that urgency is consistent across surfaces.
23. As a **User**, I want maintenance work to follow a shorter flow than a new fabrication project so that small repair jobs are not forced through the full workflow.
24. As a **User**, I want deviations such as missing material, damaged material, customer changes, payment disputes, and operational delays to be visible on the Project so that unhappy-path work is trackable.
25. As a **Manager or cross-functional user**, I want the full project lifecycle visible in one place so that work does not depend on one person’s spreadsheet or memory.

## Implementation Decisions

### Core domain decisions

- A **Project** is created when an orçamento is initiated.
- A Project can have multiple orçamento options or revisions, but only **one accepted orçamento**.
- Commercial acceptance is triggered by **first-payment identification**.
- A Project has **one primary OS** in MVP.
- The OS owns the detailed production lifecycle.
- The Project owns a higher-level commercial lifecycle.
- A measurement visit is a first-class workflow event.
- The catalog is structured as **Material → Specification → Dimensions**, with **LINHA** as the profile-system layer used by templates.
- Quote and OS lines preserve customer-facing snapshots while also supporting structured backing from templates / BOM logic.
- Fabrication with unofficial dimensions is a hard gate violation for long-lead items.

### Product decisions

- The **Project page** is the application’s main navigation root.
- Users share one UI structure; visibility and actions adapt by role.
- Users may hold **multiple roles**.
- Fabrication workers are not application users in MVP.
- Notifications, pendencies, and project alerts derive from the same underlying operational conditions.
- The application must generate both **orçamento PDFs** and **OS PDFs**.

### System modules

1. Customer & Project Registry
2. Orçamento Authoring & PDF Generation
3. Commercial Acceptance & Receivables
4. OS & Measurement Workflow
5. Catalog, Templates, and BOM Logic
6. Procurement & Supplier Orders
7. Installation Scheduling
8. Alerts, Pendencies, and Calendar Events
9. Auth, Roles, and Access Scoping

## Testing Decisions

Tests should focus on external business behavior, not implementation details.

### Highest-priority modules for tests

- workflow state / transition rules
- measurement and production-gate logic
- catalog / template / BOM calculations
- orçamento and OS PDF generation
- acceptance → installment creation behavior
- notification and pendency condition generation

### Medium-priority modules for tests

- supplier order / supplier payment behavior
- installation scheduling conflict behavior
- role-scoped visibility and action availability

## Out of Scope

- customer-facing portal
- lead-generation CRM
- full warehouse/inventory optimization beyond project execution needs
- native mobile apps
- advanced BI/reporting beyond operational visibility
- rich text editing for quote/OS descriptions
- recreating the spreadsheets as spreadsheets inside the app
- modeling every current informal workaround as a first-class target-state feature

## Further Notes

This draft assumes the repo has been stabilized so that:
- `CONTEXT.md` contains canonical domain context
- `docs/discovery/` contains current-state evidence
- `docs/product/` contains target-state application behavior
- ADRs capture hard-to-reverse tradeoffs
- the schema is treated as an implementation artifact, not the primary planning document
