// Alpine — Alutec Database Schema
// Drizzle ORM + PostgreSQL
//
// State machines use pgEnum for database-level constraint enforcement.
// All timestamps are TIMESTAMPTZ (UTC). Financial dates are DATE (no time).
// Customer name dedup uses PostgreSQL full-text search.

import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS — State machines & fixed vocabularies
// ─────────────────────────────────────────────

// Orçamento status
export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "draft",       // being created by Sales
  "sent",        // sent to customer
  "accepted",    // customer accepted — project created
  "rejected",    // customer rejected
  "expired",     // 10 business days passed without acceptance
  "revised",     // superseded by a new revision
]);

// Project (venda) status
export const projectStatusEnum = pgEnum("project_status", [
  "quotation",               // orçamento sent, awaiting acceptance
  "payment_identified",      // Finance recorded first payment
  "os_created",              // OS created by Admin
  "pending_sales_review",    // OS awaiting Sales review
  "pending_measurement",     // OS awaiting official measurement visit
  "dimensions_verified",     // Official dimensions confirmed
  "ready_for_production",    // Ready for Zé's material takeoff
  "in_fabrication",          // Fabrication started
  "frame_complete",          // Frame assembled, glass dimensions taken
  "glass_ordered",           // Glass purchase order placed
  "glass_ready",             // Glass received at factory / ready for pickup
  "installation_scheduled",  // Installation date set
  "installed",               // Installation completed
  "closed",                  // All payments received, project settled
]);

// OS status mirrors project status for the production pipeline
export const osStatusEnum = pgEnum("os_status", [
  "created",                 // OS created by Admin
  "pending_sales_review",    // Awaiting Sales review
  "approved",               // Sales approved
  "pending_measurement",    // Awaiting measurement visit
  "dimensions_verified",    // Official dimensions confirmed
  "ready_for_production",   // Materials ready, can start fabrication
  "in_fabrication",         // Fabrication in progress
  "frame_complete",         // Frame done, glass dims taken
  "glass_ordered",          // Glass PO placed
  "glass_ready",            // Glass ready for pickup
  "installation_scheduled", // Installation date set
  "installed",              // Installation completed
]);

// OS type: new project vs maintenance/repair
export const osTypeEnum = pgEnum("os_type", [
  "new",          // Standard new project OS
  "maintenance",  // Maintenance/repair OS (shorter flow)
]);

// Dimension verification status on the OS
export const dimensionStatusEnum = pgEnum("dimension_status", [
  "unofficial",    // Customer-provided or estimated dimensions
  "verified",      // Official dimensions from measurement visit
  "discrepancy",   // Official dimensions differ >5cm from quoted — re-quote needed
]);

// Orçamento line item dimension status
export const lineItemDimensionStatusEnum = pgEnum("line_item_dimension_status", [
  "unofficial",   // From customer sketch
  "verified",     // From official measurement
  "discrepancy",  // Differs >5cm from quoted — needs re-quote
]);

// Installment payment status
export const installmentStatusEnum = pgEnum("installment_status", [
  "aberto",    // Open / not yet due
  "atrasado",  // Overdue
  "ok",        // Paid
]);

// Payment method
export const paymentMethodEnum = pgEnum("payment_method", [
  "a_vista",  // Cash / bank transfer
  "boleto",   // Bank slip
  "credito",  // Credit card
  "cheque",   // Check
  "debito",   // Debit
]);

// Supplier order status
export const supplierOrderStatusEnum = pgEnum("supplier_order_status", [
  "placed",       // Order placed with supplier
  "confirmed",    // Supplier confirmed, pedido number received
  "sinal_paid",   // Deposit paid
  "ready",        // Material ready for pickup/delivery
  "saldo_paid",   // Balance paid
  "received",     // Material received at factory
]);

// Material category
export const materialCategoryEnum = pgEnum("material_category", [
  "aluminum",
  "glass",
  "stone",
  "hardware",
]);

// Supplier order payment type
export const supplierPaymentTypeEnum = pgEnum("supplier_payment_type", [
  "sinal",  // Deposit payment
  "saldo",  // Balance payment
  "full",   // Full payment (small items)
]);

// Installation task status
export const installationTaskStatusEnum = pgEnum("installation_task_status", [
  "scheduled",    // Scheduled for a date
  "in_progress",  // Installer on site
  "completed",   // Task finished
  "continued",   // CONTINUA... — needs another visit
  "cancelled",   // Cancelled
]);

// Notification severity
export const notificationSeverityEnum = pgEnum("notification_severity", [
  "info",     // Something happened, no action needed
  "warning",  // Needs attention within ~1 week
  "alert",    // Blocking or past deadline — cannot dismiss
]);

// Notification trigger type
export const notificationTriggerEnum = pgEnum("notification_trigger", [
  "state_transition",  // Something changed in the workflow
  "time_proximity",    // Something is approaching or past a deadline
]);

// User role
export const userRoleEnum = pgEnum("user_role", [
  "sales",
  "finance",
  "admin",
  "purchasing",
  "installation",
  "ceo",
]);

// Deviation type
export const deviationTypeEnum = pgEnum("deviation_type", [
  "missing_material",     // Missing material at installation
  "defective_material",   // Defective or damaged material
  "customer_change",      // Customer change order (aditamento)
  "payment_dispute",      // Payment dispute or withholding
  "operational_delay",    // Multi-day job / site not ready
]);

// ─────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────

// ─── Customers ──────────────────────────────

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 10 }),  // "CPF" or "CNPJ"
  documentNumber: varchar("document_number", { length: 20 }), // actual CPF/CNPJ
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),             // Customer's home/business address
  notes: text("notes"),                 // Free-text notes about this customer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Full-text search index for customer name deduplication
  nameSearchIdx: index("customers_name_search_idx").using("gin", table.name),
  // Unique constraint on document number when provided
  documentIdx: uniqueIndex("customers_document_idx").on(table.documentNumber),
}));

// ─── Projects (Vendas) ─────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  saleNumber: integer("sale_number").unique(), // Sequential sale number assigned by Finance
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  siteAddress: text("site_address"),           // OBRA — where installation happens (can differ from customer address)
  contactName: varchar("contact_name", { length: 255 }), // A/C — project-level contact
  contactPhone: varchar("contact_phone", { length: 50 }),
  status: projectStatusEnum("status").default("quotation").notNull(),
  totalValue: numeric("total_value", { precision: 12, scale: 2 }), // Set when orçamento accepted
  deliveryLeadTimeDays: integer("delivery_lead_time_days"), // From orçamento terms (e.g., 30-35)
  validityDays: integer("validity_days").default(10), // Orçamento validity in business days
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("projects_customer_idx").on(table.customerId),
  statusIdx: index("projects_status_idx").on(table.status),
}));

// ─── Orçamentos (Quotations) ───────────────

export const orcamentos = pgTable("orcamentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  versionLabel: varchar("version_label", { length: 100 }), // "Rev 01", "Opção Preta", etc.
  status: orcamentoStatusEnum("status").default("draft").notNull(),
  emissionDate: date("emission_date"),           // 1ª EMISSÃO date
  revisionDate: date("revision_date"),           // REVISÃO date
  totalValue: numeric("total_value", { precision: 12, scale: 2 }),
  totalValueInWords: text("total_value_in_words"), // Valor por extenso
  deliveryLeadTimeDays: integer("delivery_lead_time_days"), // 30-35 days
  generalTerms: jsonb("general_terms"),          // Standard terms stored as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("orcamentos_project_idx").on(table.projectId),
  statusIdx: index("orcamentos_status_idx").on(table.status),
}));

// ─── Orçamento Line Items ──────────────────

export const orcamentoItems = pgTable("orcamento_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orcamentoId: uuid("orcamento_id").references(() => orcamentos.id, { onDelete: "cascade" }).notNull(),
  lineNumber: numeric("line_number", { precision: 5, scale: 1 }).notNull(), // 1.1, 1.2, etc.
  local: varchar("local", { length: 255 }),     // Room/location: "SALA GOURMET"
  descricao: text("descricao").notNull(),        // Free-text description
  linha: varchar("linha", { length: 100 }),      // Profile system: "Suprema", "Tub."
  tratamento: varchar("tratamento", { length: 255 }), // Surface finish
  vidro: varchar("vidro", { length: 255 }),      // Glass specification
  medida: varchar("medida", { length: 50 }),    // W × H in meters: "2,10 x 2,20"
  widthMm: integer("width_mm"),                  // Parsed width for BOM calculation
  heightMm: integer("height_mm"),                 // Parsed height for BOM calculation
  dimensionStatus: lineItemDimensionStatusEnum("dimension_status").default("unofficial"),
  quantidade: integer("quantidade").default(1).notNull(),
  precoUnitario: numeric("preco_unitario", { precision: 12, scale: 2 }), // All-in price per unit
  precoTotal: numeric("preco_total", { precision: 12, scale: 2 }),  // precoUnitario × quantidade
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orcamentoIdx: index("orcamento_items_orcamento_idx").on(table.orcamentoId),
}));

// ─── Orçamento Payment Terms ───────────────

export const orcamentoPaymentTerms = pgTable("orcamento_payment_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  orcamentoId: uuid("orcamento_id").references(() => orcamentos.id, { onDelete: "cascade" }).notNull(),
  label: varchar("label", { length: 50 }),     // "50% sinal", "25% in 30 days", etc.
  percentage: numeric("percentage", { precision: 5, scale: 2 }), // 50.00, 25.00
  dueDays: integer("due_days"),                 // Days after acceptance: 0=sinal, 30, 60, etc.
  sortOrder: integer("sort_order").notNull(),   // Display order
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orcamentoIdx: index("orcamento_payment_terms_orcamento_idx").on(table.orcamentoId),
}));

// ─── OS (Ordem de Serviço) ─────────────────

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  osNumber: integer("os_number").unique(),     // Sequential OS number (currently paper-only, now digitized)
  type: osTypeEnum("type").default("new").notNull(),
  status: osStatusEnum("status").default("created").notNull(),
  dimensionStatus: dimensionStatusEnum("dimension_status").default("unofficial").notNull(),
  stampedAt: timestamp("stamped_at"),           // When Admin stamped the OS
  stampedById: uuid("stamped_by_id"),           // Who stamped it
  reviewedById: uuid("reviewed_by_id"),         // Sales person who reviewed
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("service_orders_project_idx").on(table.projectId),
  statusIdx: index("service_orders_status_idx").on(table.status),
}));

// ─── OS Line Items ─────────────────────────

export const serviceOrderItems = pgTable("service_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }).notNull(),
  lineNumber: numeric("line_number", { precision: 5, scale: 1 }).notNull(),
  local: varchar("local", { length: 255 }),
  descricao: text("descricao").notNull(),        // Free-text — same as orçamento
  linha: varchar("linha", { length: 100 }),
  tratamento: varchar("tratamento", { length: 255 }),
  vidro: varchar("vidro", { length: 255 }),
  medida: varchar("medida", { length: 50 }),
  widthMm: integer("width_mm"),
  heightMm: integer("height_mm"),
  dimensionStatus: lineItemDimensionStatusEnum("dimension_status").default("unofficial"),
  quantidade: integer("quantidade").default(1).notNull(),
  isMaintenanceTask: boolean("is_maintenance_task").default(false), // True for maintenance OS scoped work
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  serviceOrderIdx: index("service_order_items_so_idx").on(table.serviceOrderId),
}));

// ─── Installments (Customer Receivables) ───

export const installments = pgTable("installments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  label: varchar("label", { length: 50 }).notNull(),   // "1/3", "2/2-1", "sinal"
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date"),                     // When the installment is due
  paidAt: timestamp("paid_at"),                  // When it was actually paid
  status: installmentStatusEnum("status").default("aberto").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  sortOrder: integer("sort_order").notNull(),    // Display order
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("installments_project_idx").on(table.projectId),
  statusIdx: index("installments_status_idx").on(table.status),
}));

// ─── Suppliers ─────────────────────────────

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // "Alumínio", "Vidro", "Pedra", "Ferragem"
  contactName: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  isCore: boolean("is_core").default(false),     // Core supplier (constant) vs rotating
  creditTermsDays: integer("credit_terms_days"), // e.g., 30 for "pay within 30 days"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("suppliers_name_idx").on(table.name),
  categoryIdx: index("suppliers_category_idx").on(table.category),
}));

// ─── Supplier Orders ────────────────────────

export const supplierOrders = pgTable("supplier_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  externalPedidoNumber: varchar("external_pedido_number", { length: 100 }), // Supplier's own reference
  status: supplierOrderStatusEnum("status").default("placed").notNull(),
  orderDate: date("order_date"),                  // When order was placed
  confirmedDate: date("confirmed_date"),           // When supplier confirmed
  expectedDeliveryDate: date("expected_delivery_date"), // Supplier's estimate
  receivedDate: date("received_date"),             // When received at factory
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("supplier_orders_project_idx").on(table.projectId),
  supplierIdx: index("supplier_orders_supplier_idx").on(table.supplierId),
  statusIdx: index("supplier_orders_status_idx").on(table.status),
}));

// ─── Supplier Order Items ───────────────────

export const supplierOrderItems = pgTable("supplier_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierOrderId: uuid("supplier_order_id").references(() => supplierOrders.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id), // Links to catalog material
  description: text("description").notNull(),    // Free-text description of what's ordered
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }),         // "m", "m²", "un"
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
  treatment: varchar("treatment", { length: 255 }), // Surface treatment for aluminum
  dimensions: varchar("dimensions", { length: 100 }), // Specific dimensions ordered
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  supplierOrderIdx: index("supplier_order_items_so_idx").on(table.supplierOrderId),
}));

// ─── Supplier Order Payments ─────────────────

export const supplierPayments = pgTable("supplier_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierOrderId: uuid("supplier_order_id").references(() => supplierOrders.id).notNull(),
  type: supplierPaymentTypeEnum("type").notNull(), // "sinal", "saldo", or "full"
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at"),                   // When payment was made
  paymentMethod: paymentMethodEnum("payment_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  supplierOrderIdx: index("supplier_payments_so_idx").on(table.supplierOrderId),
}));

// ─── Product Catalog: LINHAS ───────────────

export const linhas = pgTable("linhas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // "Suprema", "Tubular", "Gold"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Product Catalog: Materials ─────────────

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),  // "U681", "TG 2\""
  name: varchar("name", { length: 255 }).notNull(), // "Perfil U", "Vidro temperado"
  category: materialCategoryEnum("category").notNull(),
  linhaId: uuid("linha_id").references(() => linhas.id), // Null for glass/stone/hardware; set for aluminum profiles
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }), // "m", "m²", "un"
  crossSectionDimensions: varchar("cross_section", { length: 100 }), // For aluminum profiles
  weightPerMeter: numeric("weight_per_meter", { precision: 8, scale: 4 }), // For aluminum
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("materials_code_idx").on(table.code),
  categoryIdx: index("materials_category_idx").on(table.category),
  linhaIdx: index("materials_linha_idx").on(table.linhaId),
}));

// ─── Product Catalog: Specifications ────────

export const materialSpecs = pgTable("material_specs", {
  id: uuid("id").defaultRandom().primaryKey(),
  materialId: uuid("material_id").references(() => materials.id, { onDelete: "cascade" }).notNull(),
  specName: varchar("spec_name", { length: 255 }).notNull(), // "Pintura eletrostática preta", "Temperado 6mm"
  specType: varchar("spec_type", { length: 50 }), // "surface_treatment", "thickness", "finish"
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }), // Current price
  supplierId: uuid("supplier_id").references(() => suppliers.id), // Which supplier offers this
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  materialIdx: index("material_specs_material_idx").on(table.materialId),
  supplierIdx: index("material_specs_supplier_idx").on(table.supplierId),
}));

// ─── Product Templates (BOM Generators) ─────

export const productTemplates = pgTable("product_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),       // "Janela de Correr 2 Folhas"
  linhaId: uuid("linha_id").references(() => linhas.id).notNull(), // LINHA determines profiles
  description: varchar("description", { length: 500 }),    // Brief template description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  linhaIdx: index("product_templates_linha_idx").on(table.linhaId),
}));

// Template parameters (what inputs the template accepts)
export const productTemplateParams = pgTable("product_template_params", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => productTemplates.id, { onDelete: "cascade" }).notNull(),
  paramName: varchar("param_name", { length: 100 }).notNull(), // "width", "height", "glass_type"
  paramType: varchar("param_type", { length: 50 }).notNull(), // "dimension", "material", "spec"
  required: boolean("required").default(true),
  sortOrder: integer("sort_order").notNull(),
}, (table) => ({
  templateIdx: index("product_template_params_template_idx").on(table.templateId),
}));

// Template BOM entries (what materials the template generates)
export const productTemplateBom = pgTable("product_template_bom", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => productTemplates.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => materials.id).notNull(),
  specId: uuid("spec_id").references(() => materialSpecs.id),  // Which spec variant
  quantityFormula: varchar("quantity_formula", { length: 500 }), // e.g., "2 * H", "W * H - clearance"
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }),    // "m", "m²", "un"
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull(),
}, (table) => ({
  templateIdx: index("product_template_bom_template_idx").on(table.templateId),
}));

// ─── Installation Tasks ─────────────────────

export const installationTasks = pgTable("installation_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  installerName: varchar("installer_name", { length: 255 }).notNull(),   // Instalador
  helperName: varchar("helper_name", { length: 255 }),                   // Ajudante
  vehicle: varchar("vehicle", { length: 100 }),                           // "Kombi", "Saveiro", "Gol"
  status: installationTaskStatusEnum("status").default("scheduled").notNull(),
  description: text("description"),                // What to bring, what to pick up
  conclusionNotes: text("conclusion_notes"),        // Completion notes or "CONTINUA..."
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("installation_tasks_project_idx").on(table.projectId),
  dateIdx: index("installation_tasks_date_idx").on(table.scheduledDate),
  statusIdx: index("installation_tasks_status_idx").on(table.status),
}));

// ─── Deviations ─────────────────────────────

export const deviations = pgTable("deviations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  type: deviationTypeEnum("type").notNull(),
  description: text("description").notNull(),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("deviations_project_idx").on(table.projectId),
  typeIdx: index("deviations_type_idx").on(table.type),
}));

// ─── Notifications ───────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id),
  targetRole: userRoleEnum("target_role").notNull(),
  severity: notificationSeverityEnum("severity").notNull(),
  trigger: notificationTriggerEnum("trigger").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  isAcknowledged: boolean("is_acknowledged").default(false), // For alerts — snoozes 24h
  acknowledgedAt: timestamp("acknowledged_at"),
  autoResolvedAt: timestamp("auto_resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("notifications_project_idx").on(table.projectId),
  targetRoleIdx: index("notifications_target_role_idx").on(table.targetRole),
  severityIdx: index("notifications_severity_idx").on(table.severity),
  unreadIdx: index("notifications_unread_idx").on(table.isRead, table.isDismissed),
}));

// ─── Users ──────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── File Attachments ───────────────────────

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // "project", "service_order", "supplier_order"
  entityId: uuid("entity_id").notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),          // UploadThing URL
  fileType: varchar("file_type", { length: 50 }), // "drawing", "photo", "receipt", "other"
  fileSize: integer("file_size"),                 // Bytes
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("attachments_entity_idx").on(table.entityType, table.entityId),
}));

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const customersRelations = relations(customers, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, { fields: [projects.customerId], references: [customers.id] }),
  orcamentos: many(orcamentos),
  serviceOrders: many(serviceOrders),
  installments: many(installments),
  supplierOrders: many(supplierOrders),
  installationTasks: many(installationTasks),
  deviations: many(deviations),
  notifications: many(notifications),
}));

export const orcamentosRelations = relations(orcamentos, ({ one, many }) => ({
  project: one(projects, { fields: [orcamentos.projectId], references: [projects.id] }),
  items: many(orcamentoItems),
  paymentTerms: many(orcamentoPaymentTerms),
}));

export const orcamentoItemsRelations = relations(orcamentoItems, ({ one }) => ({
  orcamento: one(orcamentos, { fields: [orcamentoItems.orcamentoId], references: [orcamentos.id] }),
}));

export const orcamentoPaymentTermsRelations = relations(orcamentoPaymentTerms, ({ one }) => ({
  orcamento: one(orcamentos, { fields: [orcamentoPaymentTerms.orcamentoId], references: [orcamentos.id] }),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  project: one(projects, { fields: [serviceOrders.projectId], references: [projects.id] }),
  items: many(serviceOrderItems),
}));

export const serviceOrderItemsRelations = relations(serviceOrderItems, ({ one }) => ({
  serviceOrder: one(serviceOrders, { fields: [serviceOrderItems.serviceOrderId], references: [serviceOrders.id] }),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  project: one(projects, { fields: [installments.projectId], references: [projects.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(supplierOrders),
  materialSpecs: many(materialSpecs),
}));

export const supplierOrdersRelations = relations(supplierOrders, ({ one, many }) => ({
  project: one(projects, { fields: [supplierOrders.projectId], references: [projects.id] }),
  supplier: one(suppliers, { fields: [supplierOrders.supplierId], references: [suppliers.id] }),
  items: many(supplierOrderItems),
  payments: many(supplierPayments),
}));

export const supplierOrderItemsRelations = relations(supplierOrderItems, ({ one }) => ({
  supplierOrder: one(supplierOrders, { fields: [supplierOrderItems.supplierOrderId], references: [supplierOrders.id] }),
  material: one(materials, { fields: [supplierOrderItems.materialId], references: [materials.id] }),
}));

export const supplierPaymentsRelations = relations(supplierPayments, ({ one }) => ({
  supplierOrder: one(supplierOrders, { fields: [supplierPayments.supplierOrderId], references: [supplierOrders.id] }),
}));

export const linhasRelations = relations(linhas, ({ many }) => ({
  materials: many(materials),
  productTemplates: many(productTemplates),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  linha: one(linhas, { fields: [materials.linhaId], references: [linhas.id] }),
  specs: many(materialSpecs),
  supplierOrderItems: many(supplierOrderItems),
}));

export const materialSpecsRelations = relations(materialSpecs, ({ one }) => ({
  material: one(materials, { fields: [materialSpecs.materialId], references: [materials.id] }),
  supplier: one(suppliers, { fields: [materialSpecs.supplierId], references: [suppliers.id] }),
}));

export const productTemplatesRelations = relations(productTemplates, ({ one, many }) => ({
  linha: one(linhas, { fields: [productTemplates.linhaId], references: [linhas.id] }),
  params: many(productTemplateParams),
  bom: many(productTemplateBom),
}));

export const productTemplateParamsRelations = relations(productTemplateParams, ({ one }) => ({
  template: one(productTemplates, { fields: [productTemplateParams.templateId], references: [productTemplates.id] }),
}));

export const productTemplateBomRelations = relations(productTemplateBom, ({ one }) => ({
  template: one(productTemplates, { fields: [productTemplateBom.templateId], references: [productTemplates.id] }),
  material: one(materials, { fields: [productTemplateBom.materialId], references: [materials.id] }),
  spec: one(materialSpecs, { fields: [productTemplateBom.specId], references: [materialSpecs.id] }),
}));

export const installationTasksRelations = relations(installationTasks, ({ one }) => ({
  project: one(projects, { fields: [installationTasks.projectId], references: [projects.id] }),
}));

export const deviationsRelations = relations(deviations, ({ one }) => ({
  project: one(projects, { fields: [deviations.projectId], references: [projects.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  project: one(projects, { fields: [notifications.projectId], references: [projects.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploadedBy: one(users, { fields: [attachments.uploadedById], references: [users.id] }),
}));