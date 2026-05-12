# Alutec — Domain Context

## About

Alutec is a **construction finishes fabricator and installer** based in Rio de Janeiro. It buys raw materials (primarily aluminum profiles, glass sheets, and stone/marble slabs), fabricates/cuts them, and installs finished products at residential and commercial properties.

## Core products

- **Aluminum structures** — window frames, sliding doors, shower boxes (box), curtain walls (cortina de vidro), portinhas (small doors), ACM cladding (revestimento ACM). Aluminum profiles are ordered from suppliers with specified surface treatments (branco, fosco, anodizado, cromado, preto, bronze, etc.) and fabricated in-house or by partners.
- **Glass** — tempered (temperado), laminated (laminado), mirror (espelho), insulated (insulado), mini boreal, fumê, canelado. Glass is cut and tempered by supplier partners (Glasspel, Salete, etc.).
- **Stone/marble** — countertops and surfaces in granite (Amarelo Icaraí, Verde Ubatuba, etc.) and marble (Branco, Preto São Gabriel).

## Workflow — from quotation to installation

```
Solicitation → Orçamento → Payment identified (Finance) → OS created (Admin) → Sales review OS → OS stamped & printed (3 copies) → Fabrication material takeoff (Zé) → Purchase orders (Purchasing) → Materials arrive → Fabrication starts → Frame measured → Glass ordered → Glass ready → Installation scheduled → Installation completed
```

*Note: Glass is ordered AFTER the frame is fabricated and measured, not in parallel. The frame must be finished first so exact glass dimensions can be confirmed.*

### Orçamento (Quotation) — real document structure

Based on the Roberta e Fred quotation (Rev 01 – Opção Preta):

**Header:** Company name (E&M / Alutec), address, phone, email, Instagram.
**Customer block:** NOME (customer name), OBRA (site address), A/C (attention/contact), TEL/FAX, CPF/CNPJ, E-MAIL.
**Versioning:** 1ª EMISSÃO (date) and REVISÃO: 01 – opção cor preta.
**Reference line:** "Orçamento proposta para fornecimento, entrega e instalação de esquadrias em alumínio e vidros."

**Section 1 – DESCRIÇÃO DAS ESQUADRIAS:**

| Column | Content |
|--------|----------|
| ITEM | Sequence: 1.1, 1.2, 1.3… |
| LOCAL | Room/location: "SALA GOURMET", "ÁREA EXTERNA", "ESCRITÓRIO" |
| DESCRIÇÃO | **Manually typed free-text field.** Sales writes whatever is relevant — product descriptions, scope notes (e.g., "retirada de massa de vidraceiro"), diagnostic observations (e.g., "à ser verificada na desmontagem"). Not derived from templates or other columns. |
| LINHA | Profile family/brand: "Suprema", "Tub." |
| TRATAMENTO | Surface finish: "Pintura eletrostática preta", "Anodização bronze 3002" |
| VIDRO | Glass specification: "Liso incolor 04 mm", "Laminado inc. 08 mm", "Mini boreal" |
| MEDIDA | Width × Height in meters: "2,10 x 2,20" |
| QUANT. | Quantity (usually 01) |
| PREÇO | Total price per line item (R$) |

**Section 2 – PREÇO TOTAL:** Option label + total value in words.
**Section 3 – CONDIÇÕES DE PAGAMENTO:** Installment breakdown (e.g., 50% sinal, 25% in 30 days, 25% in 60 days).
**Section 4 – PRAZO DE ENTREGA E INSTALAÇÃO:** Lead time in days after acceptance (e.g., 30-35).
**Section 5 – GARANTIA:** Warranty periods per component.
**Section 6 – TERMOS GERAIS:** General terms and conditions.

**Key design implications:**
- The orçamento is a **flat list with a location attribute** — items are not nested under rooms
- The DESCRIÇÃO column is **manually typed free text** — it can contain anything related to the project: product descriptions, scope notes, diagnostic observations. It is not auto-generated from templates.
- Multiple orçamentos per customer are supported — tracked via version labels ("Rev 01", "Opção preta")
- Payment terms are **proposed on the orçamento** and flow into installments upon acceptance
- The orçamento has a **validity period** (10 days) and **lead time**

### OS (Ordem de Serviço) — real document structure

Based on the Flávio Viana OS (a maintenance/repair order):

- **Header:** Same company letterhead
- **Customer:** FLÁVIO GONÇALVES REIS VIANNA FILHO
- **Section:** "DESCRIÇÃO DAS ESQUADRIAS PARA MANUTENÇÃO"
- **Items include descriptions like:**
  - "Porta de correr com duas folhas móveis e uma fixa: retirada de massa de vidraceiro para instalação de guarnição EPDM, substituição de escovas de vedação e roldanas"
  - "Janela de correr com duas folhas móveis: à ser verificada na desmontagem para saber se tem conserto"
  - "Janela maxim-ar em duas seções com alisar interno"
- **Each item has:** Anodização bronze 3002 (treatment specified per item)
- **Marked: "MEDIDA NÃO OFICIAL"** — confirming that unofficial dimensions require a measurement visit
- **Columns for:** DESCRITIVO (description), TRATAMENTO (treatment), LOCAL (location)

**Key design implications:**
- The OS inherits the line item structure from the orçamento but can include **diagnostic uncertainty** ("à ser verificada na desmontagem")
- The OS explicitly marks whether dimensions are official or unofficial
- Maintenance OS items include **scoped work** (tasks to perform, not just products to build)

### Step-by-step

1. **Sales** receives customer solicitation and generates the orçamento.
2. **Finance** (Fátima) identifies/records the first payment. This is the binding trigger — not a signature, but **payment received**. Fátima records receivable installments in the spreadsheet. The payment terms proposed on the orçamento are what the customer commits to (no renegotiation at this stage). OS can only proceed after payment identification. **Rare exception:** CEO may approve OS creation without payment.
3. **Administrative** (Munique, Aline, Daniel) creates the OS with technical drawing based on the accepted quote.
4. **Sales** (Edmilson, Daniel) reviews the OS against the original quote for correctness. If correct, returns to Administrative.
5. **Administrative** stamps and dates the OS. Three copies are printed: one to **Fabrication** (Zé), one attached to the printed quote, one for the **official measurement visit**.
6. If customer-provided dimensions are unofficial, an official measurement visit (visita de medição) is required before fabrication can start. Note: OS must have official dimensions before fabrication begins.

    **The measurement visit is performed by Sales** (Edmilson/Daniel) — they have the technical knowledge to verify what fits and the customer relationship to negotiate any changes.

    **Two paths exist:**
    - **Scenario A (Pre-sale measurement, complex jobs):** Sales visits the site first, measures, and the orçamento is based on official dimensions. When the OS is created, it's immediately marked as "Dimensions Verified."
    - **Scenario B (Post-acceptance measurement, standard flow):** Customer sends sketches. Orçamento is created with unofficial dimensions. Customer accepts. OS is created with status "Pending Measurement." Sales visits the site, enters official dimensions. If dimensions match the quote, OS status moves to "Ready for Production." If there's a discrepancy, a change order is issued — the quote may need to be revised.

    **Critical business rule: Fabrication MUST NOT start with unofficial dimensions.** Cutting glass or stone to wrong dimensions causes irreversible waste. Aluminum profiles cut too short become scrap. The system must enforce this as a hard gate — no cut lists or purchase orders for long-lead items (glass, stone) until the OS has official dimensions verified.

### Maintenance/Repair — separate flow

Maintenance and repair jobs follow a **shorter workflow** than new projects:

```
Customer call → Quick assessment → (Small orçamento or direct dispatch) → Maintenance OS → Execution
```

**Key differences from new projects:**
- No full procurement cycle if parts are in stock — direct dispatch
- Procurement only when the repair needs custom-ordered items
- No formal minimum threshold for dispatching, but the business has an informal sense of what's worth a truck roll
- The maintenance OS (like Flávio Viana's) describes **scoped work** (e.g., "retirada de massa de vidraceiro", "substituição de escovas de vedação e roldanas"), not products to fabricate
- Items may include **diagnostic uncertainty** written as free text ("à ser verificada na desmontagem para saber se tem conserto") — not a status flag, just manually typed

A maintenance visit **can lead to a new project orçamento** — the installer sees broader scope and a new quotation is generated.
7. **Fabrication** (Zé) receives the OS and performs material takeoff (aluminum + accessories). A copy is given to **Purchasing** for ordering.
8. **Purchasing** (Aline) creates purchase orders for required materials (aluminum, accessories) and sends to suppliers. Tracks in the spreadsheet: date Zé received the OS, date order placed with supplier, treatment (aluminum color), and observations.
9. Supplier confirms order and returns pedido number + values. This is recorded in the spreadsheet.
10. **Finance** pays the supplier. Payment date is recorded in the spreadsheet.
11. Materials arrive at the factory. **Fabrication** receives them and records receipt in the spreadsheet. **Fabrication starts production.**
12. After frame assembly, if the product needs glass (windows, doors, cabinets...), the finished frame is measured again to get exact glass dimensions.
13. **Fabrication** passes glass dimensions to **Purchasing** for glass ordering.
14. **Purchasing** orders glass from the appropriate glass supplier. Records in the spreadsheet: date ordered, pedido number, customer name, glass type, payment date, pickup date.
15. **Finance** pays the glass supplier.
16. When glass is ready for pickup at the supplier, **Purchasing/Installation** marks it in the spreadsheet and schedules installation with the customer.
17. **Installation** (Aline) assigns crews (employees + helpers + vehicles) and schedules the installation.
18. Installation completion marks the service order and product delivery as complete.

### Roles

| Sector | People | Responsibility |
|--------|---------|---------------|
| **Sales** | Edmilson, Daniel | Customer solicitation, orçamento generation, OS review |
| **Finance** | Fátima | Payment identification, receivable recording, supplier payments |
| **Administrative** | Munique, Aline, Daniel | OS creation with technical drawing, OS stamping & printing |
| **Purchasing** | Aline | Supplier orders (aluminum, accessories, glass), spreadsheet control |
| **Fabrication** | Zé, Guilherme, Fernando | Material takeoff, frame production, glass measurement |
| **Installation** | Aline | Crew scheduling, installation dispatch, completion tracking |
| **CEO** | (unnamed) | Approves special cases (rare — OS without payment) |

**Aline** holds three roles: Administrative, Purchasing, and Installation. This is why the supplier control and installation spreadsheets share the same owner.

## Key domain concepts

### Project (Venda / Contrato)

A **project** (venda, also called contrato) is an agreement with a customer to supply and install products. Each project has:

- A **sale number** (número da venda) — a sequential commercial identifier assigned by **Finance** when recording the sale in the receivables spreadsheet. Cumulative since the business started (not per-year). In March 2026, numbers were roughly in the 32,491–33,135 range. Customer-facing reference.
- One **customer** (cliente) — can be an individual (CPF) or company (CNPJ). Customers can return for multiple projects over time.
- A **site address** (obra/endereço) — where installation happens. Can differ from customer's home address (e.g., a contractor ordering for a client's property).
- A **contact/reference** (A/C) — the person Sales communicates with about this specific project (e.g., the customer's engineer). Not a separate entity, just a project-level contact.
- One or more **products/services** (e.g. "janelas + box + cortina de vidro")
- A **total value** (valor total)
- A **payment arrangement** — can be **à vista** (single payment) or **parcelado** (split across installments)
- A **delivery/installation date** — can span multiple visits

**Relationship to OS:** one project → one OS (service order), but they carry different numbers. The sale number is Finance's commercial reference; the OS number is the shop floor's operational reference.

**Multiple orçamentos per customer:** Sales may send multiple quotation options (e.g., Option 1: white profiles, Option 2: black profiles). Customer picks one. The accepted orçamento becomes the project scope. Customers cannot cherry-pick items across options — they accept one option whole.

### OS (Ordem de Serviço) — Status Lifecycle

```
Created → Pending Sales Review → Approved → Pending Measurement → Dimensions Verified → Ready for Production → In Fabrication → Frame Complete → Glass Ordered → Glass Ready → Installation Scheduled → Installed
```

The OS carries two sets of dimensions:
- **Quoted dimensions** — what was sold to the customer (for reference)
- **Official dimensions** — what will actually be built (linked to production)

Measurement status: `Unofficial` → `Verified` → or `Discrepancy` (triggers change order/re-quote).

### Installment (Parcela)

Each **installment** is one partial payment within a project. Installments are labeled by fraction: `1/3` = first of three, `2/2-1` = first half of the second installment (in case of renegotiation). Each installment has:

- A **due date** (prazo)
- A **value** (valor)
- A **payment status** (status pagamento): **Ok** (paid), **Aberto** (open/not yet due), **Atrasado** (overdue)
- A **payment method** (forma de pagamento): **à vista** (cash/transfer), **boleto** (bank slip), **crédito** (credit card), **cheque** (check), **débito** (debit)

### Supplier (Fornecedor)

A supplier provides raw materials to Alutec. Each has their own tab in the monthly control sheet.

**Stability:** A core group (aluminum extruders, main glass suppliers) is constant month-to-month. A secondary group (hardware, stone, ACM, finishing supplies) rotates based on project needs.

**Credit terms:** Some suppliers offer credit terms (e.g., "pay within 30 days"). This fits the existing sinal/saldo structure by adjusting percentages — e.g., 0% sinal + 100% saldo paid at day 30.

**Payment structure:** Strictly two payments per order:
- **Sinal** (deposit): paid when placing the order. Can be 0% for credit-term suppliers or small items.
- **Saldo** (balance): paid upon delivery/pickup.
- **Validation rule:** Sinal + Saldo = Total Value. The system must enforce this.

**Small/off-the-shelf items** (consumables, small hardware) may be paid in full at pickup — single-value orders with no deposit.

**Running balance:** Each supplier has a cumulative **saldo devedor total** that carries forward unpaid balances month to month, adding new purchases minus payments made.

### Supplier Order (Pedido de Compra)

An **order** (pedido) placed with a supplier for materials that will go into a specific customer project. Each order has:

- A **supplier** (fornecedor)
- A **customer** (cliente) — the end customer whose project this material is for
- **Materials ordered** (products + dimensions + surface treatment)
- A **deposit** (sinal) and **balance** (saldo) payment structure
- A **delivery date** (previsão de entrega)
- An **external pedido number** — assigned by the supplier after order confirmation
- **Status tracking:** order date → pedido number received → sinal paid → material ready → saldo paid → material received at factory

### Installation (Instalação)

On-site work performed by Alutec's crew to install fabricated products at the customer's property.

**Key rules:**
- An **installation visit** serves ONE project only — materials and measurements are project-specific
- A single project can require **multiple visits** — different products may be ready at different times (e.g., windows installed first, shower box glass arrives later)
- **Scheduling** is done by Aline based on: material/pickup readiness → crew availability → customer availability
- **Vehicle assignment** based on transport needs: large glass → Kombi, small fittings → Saveiro/Gol

Each installation day tracks:
- **Installer** (instalador) and **helper** (ajudante)
- **Vehicle** used (Kombi, Saveiro, Gol)
- **Task description** including what to bring, what to pick up from suppliers
- **Conclusion status** — whether the job was completed or needs follow-up

### Financial model

**Customer receivables (Accounts Receivable)** are multi-installment:
- Each project can have 1–N installments, each with its own due date, value, payment method, and status.
- Fractional labels: 1/3 (first of three), 2/2-1 (renegotiated split).
- Payment methods: à vista (lump sum), boleto (bank slip), crédito (credit card), cheque, débito.
- Payment status: Ok (paid), Aberto (open/not yet due), Atrasado (overdue).
- The "A Receber_Mês" sheet is a **cash flow forecast** — aggregated expected income by month to ensure liquidity for covering supplier deposits and operational costs.

**Supplier payables (Accounts Payable)** are binary — two payments only:
- **Sinal** (deposit): paid upfront when placing the order.
- **Saldo** (balance): paid upon delivery/pickup of materials.
- Unlike customer receivables, suppliers are not paid in installments.

**Running balance:** Each supplier has a cumulative **saldo devedor total** that carries unpaid balances month to month, adding new purchases minus payments made. This is a running liability, not reset monthly.

## Volume

- **New projects per month:** ~15–25
- **Simultaneously active projects:** ~40–60 (across different lifecycle stages — quoting, ordering, fabrication, installation, payment collection)
- **Installation crews:** ~5 teams working most days

## Organizational silos — cross-referencing challenge

The three spreadsheets were built by **three different people** with **three different concerns**, and until now there's been no systematic cross-referencing:

| File | Owner | Primary key | Why OS number doesn't appear |
|------|-------|-------------|------------------------------|
| Supplier control (File 1) | **Aline** (Purchasing) | Customer name | Aline has the paper OS on her desk; no need to transcribe the number |
| Receivables (File 2) | **Fátima** (Finance) | Sale number | Finance never receives the OS physically — paper stays in Admin/Fabrication |
| Installation (File 3) | **Aline** (Installation) | Customer name + free text | Same person as File 1; same paper reference |

**Customer name** is the de facto join key across all three files. It travels verbally and visually across all sectors without requiring anyone to look at the OS paper:
- Zé (production) knows the customer name
- Fátima (finance) knows the customer name
- The installation crew knows the customer name
- Nobody memorizes OS numbers

### Why it works (mostly)

When Aline places a supplier order, she has the paper OS on her desk. She knows which project a glass order belongs to because the OS says "Box 120×200 fumê" and the dimensions match. She doesn't need to write the sale number — the paper is right there.

### When it breaks

This arrangement is brittle under several conditions:
1. **Aline is absent** — someone else needs to interpret the sheet without the paper context
2. **Project spans months** — the paper gets filed away and the context fades
3. **Same customer, concurrent projects** — two projects for Adezuíta active simultaneously (sale 33124: Box + espelho, R$4,000; sale 33050: Janelas, R$20,740) with glass orders from the same supplier (Glasspel) in the same month. The rows are genuinely ambiguous to anyone except Aline with the paper in hand
4. **Name spelling inconsistencies** across the three files

This isn't a hypothetical risk — it's a live condition visible in the March 2026 data.

## Numbering systems

| Number | Who assigns | Where it lives | Purpose |
|--------|-------------|----------------|---------|
| Sale number (venda) | Finance (when recording in receivables) | Receivables spreadsheet | Commercial identifier, customer-facing |
| OS number | Administrative (when stamping the OS document) | Physical paper only | Operational identifier for production |
| Pedido number | Supplier (returned after order confirmation) | Supplier sheets | Supplier's own reference |

## Product catalog model

The product catalog separates **what a material is** from **how it's specified** from **its dimensions**. This avoids catalog explosion and enables BOM automation, pricing updates, and template-driven quoting.

### Material (what it is)

Base identity — the type/family of the thing. Not size-specific or color-specific.

- **Aluminum:** profile code (e.g., U681, TG 2"), cross-section dimensions, weight per meter
- **Glass:** type family (temperado, laminado, insulado, espelho, mini boreal, fumê, canelado)
- **Stone:** material name (Amarelo Icaraí, Verde Ubatuba, Cinza Corumbá, Mármore Branco, Preto São Gabriel)
- **Hardware:** category (trinco, roldana, dobradiça, fecho, baguete) + model code

### LINHA (profile system / product line)

A **LINHA** is a family of compatible aluminum profiles designed to work together. Examples: Suprema, Tubular (Tub.), Gold, Supreme, Performance, etc.

The LINHA determines **which profiles are used** in a product template. A "Janela de Correr 2 Folhas" in Suprema uses different profiles than the same product type in Tubular.

There are approximately **5–10 common LINHAs**.

**Key implication:** Product Template = LINHA × product type. The template can't just be "Janela 2 Folhas" — it must know which profile system to use.

### Specification (variant attributes)

Attributes that change price/behavior but aren't dimensions:
- **Aluminum:** surface treatment — branco, fosco, anodizado, preto, bronze, cromado
- **Glass:** thickness — 4mm, 6mm, 8mm, 10mm, 12mm
- **Stone:** finish — polished, honed (if applicable)
- **Hardware:** finish/color — branco, preto, cromado

### Dimensions (variable per job)

- **Aluminum:** length in meters (per cut piece)
- **Glass:** width × height in mm → derived area in m² (used for pricing and ordering)
- **Stone:** width × height (job-specific) → area in m², slab count
- **Hardware:** usually fixed per model (not variable per job)

### Pricing model

- **Aluminum:** price per meter or price per kg (varies by profile + spec)
- **Glass:** price per m² (varies by type + thickness)
- **Stone:** price per m² (varies by material)
- **Hardware:** price per unit

Supplier-specific pricing: each supplier maintains their own price list per material + spec.

**How line item prices are calculated:**
- Sales manually calculates each line item price using supplier price lists + a margin
- The customer sees only the **all-in price per line item** — no cost breakdown showing materials vs. labor vs. margin
- **Supplier price lists** are maintained informally (WhatsApp, paper, memory) — a pain point the system should solve
- **Margin is variable** by job size and customer relationship, but likely based on a standard markup percentage that Sales adjusts per quote

### Pricing rules from the general terms

- **Orçamento validity:** 10 business days from emission date — after that, prices subject to change
- **Unit prices valid for total purchase only** — partial changes may affect pricing
- **Dimension change rule:** if official measurements differ from quoted dimensions by more than 5cm, the orçamento is subject to re-quoting
- Items for irregular openings (cantoneiras, barras, alisares) are charged separately as ad-hoc line items

### Product templates (BOM generators)

A **product template** (e.g., "Janela de Correr 2 Folhas") takes inputs (width, height, profile color, glass type, glass thickness) and generates a full BOM:

```
Example: Janela de Correr 2 Folhas (LINHA: Suprema)
Inputs: W = 1500mm, H = 1200mm, profile color = branco, glass = temperado 6mm

Generates:
  2x Perfil U681 @ length H (verticals) — Suprema-specific profile
  2x Perfil U681 @ length W (horizontals) — Suprema-specific profile
  1x Vidro temperado 6mm @ area (W × H, less clearance)
  4x Roldana (finish = branco) — Suprema-compatible model
  2x Trinco (finish = branco) — Suprema-compatible model
```

Templates reference Materials and Specs — not hard-coded sizes. Dimensions are computed at quote/OS time.

### Rule of thumb

- If a dimension is **variable per job** (window sizes, glass cuts, stone cuts) → keep dimensions **separate** and calculated
- If a dimension is **fixed per model** (hinge hole spacing, roller dimensions) → store as a **fixed attribute** of the Material/Item

## System UX philosophy

### Unified interface — same structure, different scope

The system presents the **same page structure to all roles**. What changes per role is the **scope of data shown** and **which actions are available** — not the layout or component structure. Actions a role cannot perform are **hidden entirely, not disabled**. This keeps the UI consistent and prevents it from feeling like different applications for different people. Same project page, same calendar, same dashboard structure — for everyone.

### Project as the navigation root

The main entity users navigate to is a **Project (Projeto)** — an abstraction that groups everything related to a customer engagement: the orçamento, the commercial record, the OS, purchase orders, fabrication, and installation.

- A project is **created automatically** when a new orçamento is initiated — the user doesn't create a project explicitly, they create an orçamento and the project is transparently created underneath.
- The project is the **navigation root**.
- Pre-acceptance quotes that haven't converted yet live in a separate "Orçamentos" section.

### Notification system

Notifications are **alert-driven** with two trigger types:
1. **State transition events** — something changed in the workflow
2. **Time-proximity conditions** — something is approaching or has passed a deadline

Three severity levels:

| Level | Behavior | UI |
|-------|----------|----|
| **Info** | Something happened the role should know about. No immediate action. | Dismissible. Lives in bell inbox. |
| **Warning** | Something needs attention within ~1 week. | Dismissible. Bell badge updates on login. |
| **Alert (red)** | Something is blocking a project or past a committed deadline. | **Cannot be dismissed** — only acknowledged (snoozes 24h). Auto-resolves when underlying condition resolves. Bell icon turns red. |

**Separate from inbox:** toasts are temporary overlays for immediate feedback on the current user's action ("PO sent to supplier"). Auto-dismiss after seconds. Not stored in bell inbox.

**Fabrication workers are not system users** and receive no notifications. Notifications that would target fabrication are routed to the purchasing role, who manages fabrication by proxy.

**Single data source:** When the underlying condition resolves (materials received, installation completed, block resolved), the alert auto-resolves across all surfaces — bell inbox, dashboard, project page.

### Dashboard pendency component

The dashboard shows a **fixed, persistent list** — not dismissable — of items where the **next required action belongs to the current logged-in user**. This is the user's work queue: "these things are waiting on you." Updates automatically when the list changes. Not the same as the notification inbox — inbox is "things you should know about," the pendency list is "things only you can unblock right now." Both derive from the same data source, filtered differently.

### Project page alert section

When a user opens a specific project, the project page shows an **alert section** listing all active warnings and alerts for that project — regardless of which role they target. This gives anyone who opens the project a full picture of what is blocking or at risk. Same data source as bell inbox and dashboard pendency, filtered to the current project.

### Calendar — one component, role-aware filters

One calendar component, same for all roles. Role awareness is expressed through **which filter options are visible** — filter types irrelevant or restricted for a role are hidden.

- Everyone sees **installations** (customer commitments)
- Finance and purchasing see **receivable and payable due dates**
- Purchasing sees **supplier pickups and deliveries**

Shows **dated events** — installation appointments, due dates, supplier deliveries, forecast delivery dates. Does not show the project lifecycle as a timeline (that's a kanban or Gantt, a different view).

Events are **color-coded using the same severity palette** as notifications: neutral when healthy, amber when a warning exists, red when an alert exists. This makes the calendar a consistent surface — same color language everywhere.

The calendar also serves **installation scheduling**: when selecting a date for a new installation, it shows what's already committed (crew assignments, vehicles) to prevent double-booking.

- **Installation** — on-site installation of fabricated products by Alutec's crew of installers and helpers.
- **Maintenance & repairs** — replacing broken glass, fixing frames, adjusting sliding mechanisms.

## Warranty & general terms

**Warranty periods (standardized):**
- Manufacturing defects (defeito de fabricação): 2 years
- Hardware/accessories (acessórios): 2 years
- EPDM gaskets (guarnição em EPDM): 5 years

**General terms (standard boilerplate, rarely changed):**
- Customer must have the installation opening ready 15 days before delivery
- Customer must receive and store delivered items for up to 5 days before installation
- Vertical transport is Alutec's responsibility; if technical conditions don't allow (no stairs/elevator), customer hires external crane/hoisting
- **Dimension change rule:** if official measurements differ from quoted dimensions by more than 5cm, the orçamento is subject to re-quoting
- Corner covers, flashings, and trims (cantoneiras, barras, alisares) for irregular openings are **charged separately** as ad-hoc line items, not included in the standard template
- Orçamento validity: 10 business days from emission
- Unit prices valid only for the total purchase; partial changes may affect pricing
- Waste removal from installation is Alutec's responsibility
- Masonry, putty work, and painting are **not included** in scope

## Deviations from the happy path

### 1. Missing materials at installation

Installer discovers a missing part on site (e.g., "falta 01 U 681"). Resolution:
- If stock exists → immediate rush production/repair order
- If no stock → specific purchase from supplier
- OS status or notes often show "CONTINUA..." — job paused pending resolution

### 2. Defective or damaged materials

Glass arrives scratched ("arranhado") or profiles damaged during transport/install. Resolution:
- **Glass:** typically requires a full new order from the supplier (cutting/tempering can't be fixed)
- **Profiles:** may be re-cut if excess stock exists, or a new bar is ordered
- **Financial impact:** this is a hidden cost that often isn't billed back to the customer, eating into margins unless tracked via a rework/scrap log

### 3. Customer changes (aditamento / change order)

Customer wants to modify dimensions, change finishes, or add items mid-project. Resolution:
- A new OS or a modification to the existing OS is created manually (aditamento)
- Payment schedule is renegotiated or an extra installment is added to cover the difference

### 4. Payment disputes & withholding

Customer refuses to pay or withholds the final installment because the job isn't finished or has unresolved defects. Resolution:
- Manual negotiation via phone or WhatsApp
- "Atrasado" status flags this for Finance/Admin follow-up

### 5. Operational delays (multi-day jobs)

Site not ready (masonry/concrete issues), weather, or job complexity causes installation to span multiple days ("CONTINUA..."). Resolution:
- Installer returns the next day or on a rescheduled date
- Currently no formal delay-cost tracking mechanism
- Can cause scheduling conflicts with other jobs
