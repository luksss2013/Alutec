# Unified interface with role-scoped data — not role-specific pages

## Decision

The system presents the same page structure, calendar, dashboard, and project view to all roles. Role differences are expressed through data scope (what you see) and available actions (what you can do), not through separate UI layouts. Actions a role cannot perform are hidden entirely, not disabled.

The project (Projeto) is the navigation root, created transparently when an orçamento is initiated. The project page contains an alert section showing all active warnings/alerts for that project regardless of target role.

## Context

Multiple roles (Sales, Finance, Administrative, Purchasing, Fabrication, Installation) interact with the same business entities. A naive approach creates separate dashboard layouts per role, which leads to UI fragmentation, duplicated components, and the feeling of using different apps.

## Rationale

1. **Consistency** — Everyone navigates the same project page the same way. Knowledge transfers across roles naturally.
2. **Simplicity** — One project page, one calendar, one dashboard. Only the data scope and available actions change per role.
3. **Cross-role visibility** — Finance can open a project and see purchasing alerts. Purchasing can see installation scheduling. This mirrors how the current paper/spreadsheet process already shares information across roles.
4. **Single data source** — Notifications, pendency lists, and project alerts all derive from the same underlying conditions. When a condition resolves, it auto-resolves everywhere.

## Fabrication workers are not system users

Notifications and actions targeting the fabrication role are routed to the purchasing role, who manages fabrication by proxy (currently Aline). Zé and his team receive work via printed OS, not through the system.