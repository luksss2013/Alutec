# Alutec — Domain Context

## About

Alutec is a **construction finishes fabricator and installer** based in Rio de Janeiro. It buys raw materials (primarily aluminum profiles, glass sheets, and stone/marble slabs), fabricates and cuts them, and installs finished products at residential and commercial properties.

## Core products

- **Aluminum structures** — window frames, sliding doors, shower boxes (box), curtain walls (cortina de vidro), portinhas, and ACM cladding.
- **Glass** — tempered (temperado), laminated (laminado), mirror (espelho), insulated (insulado), mini boreal, fumê, canelado.
- **Stone / marble** — countertops and surfaces in granite and marble.

## Workflow — from quotation to installation

```text
Solicitation → Orçamento → Payment identified → OS created → Sales review OS → Measurement verification (if needed) → Material takeoff → Purchase orders → Materials arrive → Fabrication starts → Frame complete → Glass ordered → Glass ready → Installation scheduled → Installed
```

**Key sequencing rule:** glass is ordered **after** the frame is fabricated and measured, not in parallel. Exact glass dimensions are confirmed from the finished frame.

### Step-by-step

1. **Sales** receives the customer solicitation and creates the orçamento.
2. **Finance** identifies the first customer payment. This is the binding acceptance event. Payment terms from the accepted orçamento become project installments.
3. **Administrative** creates the OS from the accepted project scope.
4. **Sales** reviews the OS against the accepted orçamento.
5. **Administrative** stamps and numbers the OS.
6. If dimensions are unofficial, **Sales** performs an official measurement visit before production can proceed.
7. **Fabrication** performs the material takeoff.
8. **Purchasing** places supplier orders for aluminum, accessories, and later glass.
9. **Finance** pays suppliers according to the supplier payment structure.
10. **Fabrication** starts production when materials are available and the OS is production-ready.
11. After frame completion, exact glass dimensions are confirmed.
12. **Purchasing** orders glass.
13. **Installation** schedules visits when materials and customer availability align.
14. Installation completion marks the service as delivered.

## Roles

| Sector | People | Responsibility |
|--------|--------|----------------|
| **Sales** | Edmilson, Daniel | Customer solicitation, orçamento generation, OS review, measurement visits |
| **Finance** | Fátima | First-payment identification, receivable tracking, supplier payments |
| **Administrative** | Munique, Aline, Daniel | OS creation, OS stamping, document handling |
| **Purchasing** | Aline | Supplier orders, spreadsheet control today, supplier follow-up |
| **Fabrication** | Zé, Guilherme, Fernando | Material takeoff, frame production, glass measurement |
| **Installation** | Aline | Crew scheduling, installation dispatch, completion tracking |
| **CEO** | (unnamed) | Rare special approvals, such as OS without payment |

**Aline** spans three operational roles: Administrative, Purchasing, and Installation.

**Operational constraint:** Fabrication workers are not system users in the target application. Their work is coordinated through OS documents and by the purchasing / administrative side of the business.

## Key domain concepts

### Project (Venda / Contrato)

A **Project** is the business container for one customer engagement.

A Project is created when a new orçamento is initiated. It groups the full lifecycle of the job:
- customer
- site address (obra)
- project-level contact (A/C)
- one or more orçamento options or revisions
- the accepted commercial scope
- receivables
- OS
- supplier orders
- fabrication progress
- installation visits

Each Project has:
- a **sale number** (número da venda) assigned by Finance
- one **customer**
- one **site address** (obra / installation address)
- an optional **project-level contact** (A/C)
- one or more **products / services**
- a **payment arrangement**
- one or more **installation visits**

**Quote relationship:** a Project may have multiple orçamento options or revisions, but only **one accepted orçamento** becomes the active commercial scope.

**OS relationship:** in the current domain model, one Project has **one primary OS**.

### Customer

A **Customer** can be:
- an individual (`CPF`)
- a company (`CNPJ`)

Customers may return for multiple Projects over time.

### Orçamento

An **Orçamento** is the commercial proposal sent to the customer.

It contains:
- customer and obra information
- a flat list of quote line items
- proposed payment terms
- delivery lead time
- warranty
- standard commercial terms
- one revision / option label when applicable

**Line item structure:**
- `ITEM`
- `LOCAL`
- `DESCRIÇÃO`
- `LINHA`
- `TRATAMENTO`
- `VIDRO`
- `MEDIDA`
- `QUANT.`
- `PREÇO`

**Important rule:** `DESCRIÇÃO` is **manually typed free text**. It is not derived automatically from templates.

### OS (Ordem de Serviço)

The **OS** is the operational document that drives production and installation.

It has its own numbering system, separate from the sale number.

It moves through this lifecycle:

```text
Created → Pending Sales Review → Approved → Pending Measurement → Dimensions Verified → Ready for Production → In Fabrication → Frame Complete → Glass Ordered → Glass Ready → Installation Scheduled → Installed
```

The OS carries both:
- **quoted dimensions** — what was sold
- **official dimensions** — what will actually be built

### Measurement Visit

A **Measurement Visit** is the official on-site dimension verification step performed by **Sales**.

Two paths exist:
- **Pre-sale measurement** — complex jobs are measured before the orçamento is finalized
- **Post-acceptance measurement** — standard jobs are measured after acceptance and before production

Measurement outcomes:
- **Unofficial** — dimensions still come from sketch / estimate / customer-provided source
- **Verified** — official site measurement completed
- **Discrepancy** — official dimensions materially differ from quoted dimensions and a re-quote / change is required

**Critical business rule:** production must not proceed with unofficial dimensions for long-lead items.

### Installment (Parcela)

An **Installment** is one receivable payment inside a Project.

Each installment has:
- a fractional label (for example `1/3`, `2/2-1`)
- due date
- value
- payment method
- payment status (`Ok`, `Aberto`, `Atrasado`)

### Supplier (Fornecedor)

A **Supplier** provides raw materials to Alutec.

Supplier behavior in the domain:
- some suppliers are **core / stable** month to month
- others rotate based on project needs
- some suppliers offer credit terms
- supplier liability can carry forward as a running balance

### Supplier Order (Pedido de Compra)

A **Supplier Order** is a material order placed for a specific Project.

Each Supplier Order has:
- a supplier
- a project
- ordered materials
- expected delivery timing
- the supplier’s own pedido number
- payment tracking
- receipt tracking

### Supplier payment structure

Supplier payments follow a domain-specific pattern:
- **Sinal** — deposit when placing the order
- **Saldo** — balance at delivery / pickup
- **Full** — one-shot payment for small/off-the-shelf items

**Validation rule:** `sinal + saldo` must equal the supplier order total when the order uses the two-payment structure.

### Installation (Instalação)

An **Installation Visit** is on-site work performed for a Project.

Rules:
- one installation visit serves **one Project only**
- one Project may require **multiple installation visits**
- scheduling depends on material readiness, crew availability, vehicle availability, and customer availability
- vehicle choice depends on transport needs

Each installation day tracks:
- installer
- helper
- vehicle
- task description
- completion / continuation status

### Maintenance / Repair

Maintenance and repair work follows a shorter flow than a new fabrication project:

```text
Customer call → Quick assessment → (Small orçamento or direct dispatch) → Maintenance execution
```

Maintenance may still lead to a broader new orçamento if additional work is discovered.

### Financial model

**Customer receivables** are multi-installment.

- A Project can have one or many installments.
- Installments carry due dates, statuses, methods, and values.
- Monthly receivables are important for cash-flow planning.

**Supplier payables** are not modeled as customer-style installment plans.

- Supplier orders usually use `sinal + saldo`
- small items may be paid in full

### Numbering systems

| Number | Who assigns | Purpose |
|--------|-------------|---------|
| **Sale number (venda)** | Finance | Commercial reference |
| **OS number** | Administrative | Operational / production reference |
| **Pedido number** | Supplier | Supplier’s own order reference |

## Product catalog model

The catalog separates:
- **Material** — what the thing is
- **Specification** — the chosen variant
- **Dimensions** — the job-specific size

This avoids catalog explosion and supports structured BOM generation.

### Material

Base identity, not size-specific:
- aluminum profile code
- glass type family
- stone material
- hardware model/category

### LINHA

A **LINHA** is a family of compatible aluminum profiles designed to work together.

Examples include:
- Suprema
- Tubular
- Gold
- Performance

**Key implication:** Product template = **LINHA × product type**.

### Specification

Variant attributes that affect behavior or pricing but are not dimensions.

Examples:
- aluminum treatment / finish
- glass thickness
- hardware finish
- stone finish

### Dimensions

Job-specific dimensions are kept separate from the base catalog.

Examples:
- aluminum cut length
- glass width × height
- stone width × height

### Product Templates (BOM generators)

A **Product Template** is a reusable generator that turns:
- product type
- LINHA
- dimensions
- selected specs

into a structured BOM.

Templates are used for:
- pricing support
- structured quote backing
- procurement support
- future production automation

### Pricing model

Pricing follows the material family:
- aluminum — price per meter or kg
- glass — price per m²
- stone — price per m²
- hardware — price per unit

Operationally:
- Sales calculates quote line prices manually today
- supplier price lists are maintained informally today
- the customer sees only the **all-in line-item price**
- margin is variable by job and relationship

## Warranty and standard terms

### Warranty

Standardized warranty periods:
- manufacturing defects — 2 years
- accessories / hardware — 2 years
- EPDM gaskets — 5 years

### Standard commercial terms

Key rules:
- orçamento validity is **10 business days**
- if official dimensions differ from quoted dimensions by more than **5 cm**, the orçamento is subject to re-quoting
- irregular-opening finishing items (cantoneiras, barras, alisares) are charged separately
- masonry, putty work, and painting are outside scope

## Deviations from the happy path

### 1. Missing materials at installation
A job reaches site and a required part is missing.

### 2. Defective or damaged materials
Glass or profiles arrive damaged or are damaged during handling.

### 3. Customer changes (aditamento / change order)
Scope, dimensions, finishes, or quantities change mid-project.

### 4. Payment disputes & withholding
The customer delays or withholds payment due to dissatisfaction or incompletion.

### 5. Operational delays
Weather, site readiness, or job complexity causes work to continue across multiple visits.

## Volume

- **New projects per month:** ~15–25
- **Simultaneously active projects:** ~40–60
- **Installation crews:** ~5 teams working most days
