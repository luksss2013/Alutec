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

### Step-by-step

1. **Sales** receives customer solicitation and generates the orçamento.
2. **Finance** (Fátima) identifies the payment condition upon customer acceptance; records receivable installments in the spreadsheet. OS can only proceed after this step.
3. **Administrative** (Munique, Aline, Daniel) creates the OS with technical drawing based on the accepted quote.
4. **Sales** (Edmilson, Daniel) reviews the OS against the original quote for correctness. If correct, returns to Administrative.
5. **Administrative** stamps and dates the OS. Three copies are printed: one to **Fabrication** (Zé), one attached to the printed quote, one for the **official measurement visit**.
6. If customer-provided dimensions are unofficial, an official measurement visit (visita de medição) is required before fabrication can start. Note: OS must have official dimensions before fabrication begins.

    **The measurement visit is performed by Sales** (Edmilson/Daniel) — they have the technical knowledge to verify what fits and the customer relationship to negotiate any changes.

    **Two paths exist:**
    - **Scenario A (Pre-sale measurement, complex jobs):** Sales visits the site first, measures, and the orçamento is based on official dimensions. When the OS is created, it's immediately marked as "Dimensions Verified."
    - **Scenario B (Post-acceptance measurement, standard flow):** Customer sends sketches. Orçamento is created with unofficial dimensions. Customer accepts. OS is created with status "Pending Measurement." Sales visits the site, enters official dimensions. If dimensions match the quote, OS status moves to "Ready for Production." If there's a discrepancy, a change order is issued — the quote may need to be revised.

    **Critical business rule: Fabrication MUST NOT start with unofficial dimensions.** Cutting glass or stone to wrong dimensions causes irreversible waste. Aluminum profiles cut too short become scrap. The system must enforce this as a hard gate — no cut lists or purchase orders for long-lead items (glass, stone) until the OS has official dimensions verified.
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
- One **customer** (cliente)
- One or more **products/services** (e.g. "janelas + box + cortina de vidro")
- A **total value** (valor total)
- A **delivery address** (endereço)
- A **payment arrangement** — can be **à vista** (single payment) or **parcelado** (split across installments)
- A **delivery/installation date** — can span multiple visits

**Relationship to OS:** one project → one OS (service order), but they carry different numbers. The sale number is Finance's commercial reference; the OS number is the shop floor's operational reference.

### OS (Ordem de Serviço) — Status Lifecycle

```
Created → Pending Sales Review → Approved → Pending Measurement → Dimensions Verified → Ready for Production → In Fabrication → Frame Complete → Glass Ordered → Glass Ready → Installation Scheduled → Installed
```

The OS carries two sets of dimensions:
- **Quoted dimensions** — what was sold to the customer (for reference)
- **Official dimensions** — what will actually be built (linked to production)

Measurement status: `Draft` → `Verified` → or `Discrepancy` (triggers change order/re-quote).

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

On-site work performed by Alutec's crew to install fabricated products at the customer's property. Each installation day tracks:

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

### Product templates (BOM generators)

A **product template** (e.g., "Janela de Correr 2 Folhas") takes inputs (width, height, profile color, glass type, glass thickness) and generates a full BOM:

```
Example: Janela de Correr 2 Folhas
Inputs: W = 1500mm, H = 1200mm, profile = branco, glass = temperado 6mm

Generates:
  2x Perfil U681 @ length H (verticals)
  2x Perfil U681 @ length W (horizontals)
  1x Vidro temperado 6mm @ area (W × H, less clearance)
  4x Roldana (finish = branco)
  2x Trinco (finish = branco)
```

Templates reference Materials and Specs — not hard-coded sizes. Dimensions are computed at quote/OS time.

### Rule of thumb

- If a dimension is **variable per job** (window sizes, glass cuts, stone cuts) → keep dimensions **separate** and calculated
- If a dimension is **fixed per model** (hinge hole spacing, roller dimensions) → store as a **fixed attribute** of the Material/Item

## Services

- **Installation** — on-site installation of fabricated products by Alutec's crew of installers and helpers.
- **Maintenance & repairs** — replacing broken glass, fixing frames, adjusting sliding mechanisms.

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
