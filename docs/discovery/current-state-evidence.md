# Current-state evidence

This document captures the **observed current-state operational evidence** used during discovery.

It is intentionally different from `CONTEXT.md`:
- `CONTEXT.md` captures the **canonical domain language and invariants**
- this file captures **source artifacts, current operating habits, and migration evidence**

## Source artifacts reviewed

### Spreadsheets

1. `CONTROLE MENSAL - ALUMÍNIO, VIDROS E PEDRAS - MARÇO 2026.xlsx`
   - supplier control and material ordering
2. `RECEBIMENTOS COM VENDAS MES DE MARÇO-2026.xls`
   - receivables and sales tracking
3. `RELATÓRIO DE INSTALAÇÕES DE MARÇO 2026.xlsx`
   - weekly installation scheduling

### Documents

1. `Passo a passo E&M.pdf`
   - operational workflow reference used as an initial understanding aid
2. `ROBERTA E FRED ... rev 01 - Opção preta.docx`
   - real orçamento example
3. `OS EDM - FLÁVIO VIANA ... .doc`
   - real maintenance OS example

## Observed orçamento structure

From the Roberta e Fred document, the current orçamento format includes:

- company letterhead and contact block
- customer block with customer, obra, A/C, contact info, CPF/CNPJ, email
- revision/version labels
- a flat line-item table with these columns:
  - `ITEM`
  - `LOCAL`
  - `DESCRIÇÃO`
  - `LINHA`
  - `TRATAMENTO`
  - `VIDRO`
  - `MEDIDA`
  - `QUANT.`
  - `PREÇO`
- total price section
- payment terms section
- delivery lead-time section
- warranty section
- general terms section

### What this evidence influenced

This document structure directly informed:
- the quote line-item model
- the requirement to generate orçamento PDFs
- the decision to keep `DESCRIÇÃO` as free text
- the distinction between customer-facing snapshot fields and structured catalog backing

## Observed maintenance OS structure

From the Flávio Viana OS, the current maintenance OS includes:

- company letterhead
- customer identification
- maintenance-focused descriptive section
- line items describing scoped repair work, not just products
- explicit references such as `MEDIDA NÃO OFICIAL`
- treatment and location data

### What this evidence influenced

This document structure directly informed:
- the distinction between new-project flow and maintenance flow
- the need to represent unofficial vs verified dimensions
- the decision to keep maintenance descriptions as free text

## Current spreadsheet ownership model

The current operation is split across spreadsheets owned by different people with different concerns.

| Operational artifact | Primary owner | Main concern | Current join habit |
|----------------------|---------------|--------------|--------------------|
| Supplier control | Aline | purchasing and supplier follow-up | customer name + paper OS context |
| Receivables | Fátima | sales / receivables | sale number |
| Installation schedule | Aline | dispatch and field scheduling | customer name + free text |

## Current cross-referencing behavior

The current system relies heavily on:
- paper OS context
- shared memory
- verbal coordination
- customer name recognition across departments

In practice, **customer name** is the de facto cross-reference between disconnected operational artifacts.

## Why the current system works (sometimes)

It works because the same small set of people carry the context in their heads.

Examples:
- Aline places supplier orders while physically looking at the paper OS
- Fabrication knows the customer name associated with the work
- Installation crews know the customer name, not necessarily the OS number
- Finance knows the sale number and customer, but not the paper OS workflow

## Where the current system breaks

Observed failure conditions:

1. **Aline is absent**
   - other staff lose the paper-context bridge
2. **Projects span multiple months**
   - paper context becomes harder to recover
3. **The same customer has concurrent projects**
   - spreadsheet rows become genuinely ambiguous
4. **Names vary by spelling / formatting**
   - cross-file matching becomes unreliable

This evidence directly supported ADR-0001 (unified software over spreadsheets + paper).

## Current operational volume evidence

From the reviewed month and discussion:
- roughly 15–25 new projects per month
- roughly 40–60 active projects at one time
- roughly 5 installation teams working most days

## How to use this file

Use this file when you need:
- current-state operational evidence
- migration context
- source-document structure for PDF generation
- justification for replacing spreadsheet/paper coordination

Do **not** treat this file as the canonical target-state domain model. That lives in `CONTEXT.md`.
