// Alutec Database Schema
// Drizzle ORM + PostgreSQL
//
// This schema reflects the stabilized domain model after the grill/discovery phase.
// It intentionally separates:
// - Project: high-level commercial lifecycle
// - Service Order (OS): detailed production lifecycle
//
// Notes:
// - All timestamps use TIMESTAMPTZ (`timestamp(..., { withTimezone: true })`)
// - Financial due dates use DATE
// - Customer dedup/search is modeled through `normalizedName`; a trigram index can be
//   added in a raw SQL migration if needed.

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
// ENUMS
// ─────────────────────────────────────────────

export const customerDocumentTypeEnum = pgEnum("customer_document_type", [
  "cpf",
  "cnpj",
]);

export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "revised",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "new_work",
  "maintenance",
]);

// Project status is deliberately high-level.
export const projectStatusEnum = pgEnum("project_status", [
  "quoting",
  "accepted",
  "in_progress",
  "installed",
  "closed",
]);

// OS status owns the detailed production lifecycle.
export const osStatusEnum = pgEnum("os_status", [
  "created",
  "pending_sales_review",
  "approved",
  "pending_measurement",
  "dimensions_verified",
  "ready_for_production",
  "in_fabrication",
  "frame_complete",
  "glass_ordered",
  "glass_ready",
  "installation_scheduled",
  "installed",
]);

export const dimensionStatusEnum = pgEnum("dimension_status", [
  "unofficial",
  "verified",
  "discrepancy",
]);

export const lineItemSourceEnum = pgEnum("line_item_source", [
  "manual",
  "templated",
]);

export const measurementVisitTypeEnum = pgEnum("measurement_visit_type", [
  "pre_sale",
  "post_acceptance",
]);

export const installmentStatusEnum = pgEnum("installment_status", [
  "aberto",
  "atrasado",
  "ok",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "a_vista",
  "boleto",
  "credito",
  "cheque",
  "debito",
]);

export const supplierOrderStatusEnum = pgEnum("supplier_order_status", [
  "placed",
  "confirmed",
  "sinal_paid",
  "ready",
  "saldo_paid",
  "received",
]);

export const supplierPaymentTypeEnum = pgEnum("supplier_payment_type", [
  "sinal",
  "saldo",
  "full",
]);

export const materialCategoryEnum = pgEnum("material_category", [
  "aluminum",
  "glass",
  "stone",
  "hardware",
]);

export const templateParamTypeEnum = pgEnum("template_param_type", [
  "dimension",
  "material",
  "spec",
  "option",
]);

export const bomFormulaTypeEnum = pgEnum("bom_formula_type", [
  "fixed_quantity",
  "per_width",
  "per_height",
  "perimeter",
  "area",
]);

export const installationTaskStatusEnum = pgEnum("installation_task_status", [
  "scheduled",
  "in_progress",
  "completed",
  "continued",
  "cancelled",
]);

export const employeeRoleEnum = pgEnum("employee_role", [
  "installer",
  "helper",
  "fabrication",
]);

export const notificationSeverityEnum = pgEnum("notification_severity", [
  "info",
  "warning",
  "alert",
]);

export const notificationTriggerEnum = pgEnum("notification_trigger", [
  "state_transition",
  "time_proximity",
]);

export const userRoleEnum = pgEnum("user_role", [
  "sales",
  "finance",
  "admin",
  "purchasing",
  "installation",
  "ceo",
]);

export const workflowTaskTypeEnum = pgEnum("workflow_task_type", [
  "identify_first_payment",
  "create_os",
  "sales_review_os",
  "perform_measurement",
  "place_material_orders",
  "pay_supplier",
  "order_glass",
  "schedule_installation",
  "collect_installment",
  "resolve_deviation",
]);

export const workflowTaskStatusEnum = pgEnum("workflow_task_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const deviationTypeEnum = pgEnum("deviation_type", [
  "missing_material",
  "defective_material",
  "customer_change",
  "payment_dispute",
  "operational_delay",
]);

// ─────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 255 }).notNull(),
    documentType: customerDocumentTypeEnum("document_type"),
    documentNumber: varchar("document_number", { length: 20 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    normalizedNameIdx: index("customers_normalized_name_idx").on(table.normalizedName),
    documentIdx: uniqueIndex("customers_document_idx").on(table.documentNumber),
  }),
);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.role] }),
    roleIdx: index("user_roles_role_idx").on(table.role),
  }),
);

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: employeeRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  plate: varchar("plate", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: projectTypeEnum("type").default("new_work").notNull(),
    saleNumber: integer("sale_number").unique(),
    customerId: uuid("customer_id")
      .references(() => customers.id)
      .notNull(),
    acceptedOrcamentoId: uuid("accepted_orcamento_id").references(() => orcamentos.id),
    siteAddress: text("site_address"),
    contactName: varchar("contact_name", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    status: projectStatusEnum("status").default("quoting").notNull(),
    totalValue: numeric("total_value", { precision: 12, scale: 2 }),
    firstPaymentIdentifiedAt: timestamp("first_payment_identified_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index("projects_customer_idx").on(table.customerId),
    statusIdx: index("projects_status_idx").on(table.status),
    typeIdx: index("projects_type_idx").on(table.type),
  }),
);

export const orcamentos = pgTable(
  "orcamentos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    versionLabel: varchar("version_label", { length: 100 }),
    status: orcamentoStatusEnum("status").default("draft").notNull(),
    emissionDate: date("emission_date"),
    revisionDate: date("revision_date"),
    validUntilDate: date("valid_until_date"),
    totalValue: numeric("total_value", { precision: 12, scale: 2 }),
    deliveryLeadTimeDays: integer("delivery_lead_time_days"),
    termsVersion: integer("terms_version").default(1).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("orcamentos_project_idx").on(table.projectId),
    statusIdx: index("orcamentos_status_idx").on(table.status),
  }),
);

export const linhas = pgTable("linhas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const materials = pgTable(
  "materials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    category: materialCategoryEnum("category").notNull(),
    linhaId: uuid("linha_id").references(() => linhas.id),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
    crossSectionDimensions: varchar("cross_section_dimensions", { length: 100 }),
    weightPerMeter: numeric("weight_per_meter", { precision: 8, scale: 4 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("materials_code_idx").on(table.code),
    categoryIdx: index("materials_category_idx").on(table.category),
    linhaIdx: index("materials_linha_idx").on(table.linhaId),
  }),
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }),
    contactName: varchar("contact_name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    address: text("address"),
    isCore: boolean("is_core").default(false).notNull(),
    creditTermsDays: integer("credit_terms_days"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("suppliers_name_idx").on(table.name),
    categoryIdx: index("suppliers_category_idx").on(table.category),
  }),
);

export const materialSpecs = pgTable(
  "material_specs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    materialId: uuid("material_id")
      .references(() => materials.id, { onDelete: "cascade" })
      .notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    specName: varchar("spec_name", { length: 255 }).notNull(),
    specType: varchar("spec_type", { length: 50 }),
    pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    materialIdx: index("material_specs_material_idx").on(table.materialId),
    supplierIdx: index("material_specs_supplier_idx").on(table.supplierId),
  }),
);

export const productTemplates = pgTable(
  "product_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    linhaId: uuid("linha_id")
      .references(() => linhas.id)
      .notNull(),
    description: varchar("description", { length: 500 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    linhaIdx: index("product_templates_linha_idx").on(table.linhaId),
  }),
);

export const productTemplateParams = pgTable(
  "product_template_params",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .references(() => productTemplates.id, { onDelete: "cascade" })
      .notNull(),
    paramName: varchar("param_name", { length: 100 }).notNull(),
    paramType: templateParamTypeEnum("param_type").notNull(),
    required: boolean("required").default(true).notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    templateIdx: index("product_template_params_template_idx").on(table.templateId),
  }),
);

export const productTemplateBom = pgTable(
  "product_template_bom",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .references(() => productTemplates.id, { onDelete: "cascade" })
      .notNull(),
    materialId: uuid("material_id")
      .references(() => materials.id)
      .notNull(),
    specId: uuid("spec_id").references(() => materialSpecs.id),
    formulaType: bomFormulaTypeEnum("formula_type").notNull(),
    fixedQuantity: numeric("fixed_quantity", { precision: 10, scale: 4 }),
    quantityMultiplier: numeric("quantity_multiplier", { precision: 10, scale: 4 }).default("1").notNull(),
    widthAdjustmentMm: integer("width_adjustment_mm").default(0).notNull(),
    heightAdjustmentMm: integer("height_adjustment_mm").default(0).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    templateIdx: index("product_template_bom_template_idx").on(table.templateId),
  }),
);

export const orcamentoItems = pgTable(
  "orcamento_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orcamentoId: uuid("orcamento_id")
      .references(() => orcamentos.id, { onDelete: "cascade" })
      .notNull(),
    sectionNumber: integer("section_number").notNull(),
    itemNumber: integer("item_number").notNull(),
    source: lineItemSourceEnum("source").default("manual").notNull(),
    productTemplateId: uuid("product_template_id").references(() => productTemplates.id),
    linhaId: uuid("linha_id").references(() => linhas.id),
    local: varchar("local", { length: 255 }),
    descricao: text("descricao").notNull(),
    tratamentoSnapshot: varchar("tratamento_snapshot", { length: 255 }),
    vidroSnapshot: varchar("vidro_snapshot", { length: 255 }),
    quotedMeasureText: varchar("quoted_measure_text", { length: 50 }),
    quotedWidthMm: integer("quoted_width_mm"),
    quotedHeightMm: integer("quoted_height_mm"),
    dimensionStatus: dimensionStatusEnum("dimension_status").default("unofficial").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
    totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
    templateInput: jsonb("template_input"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orcamentoIdx: index("orcamento_items_orcamento_idx").on(table.orcamentoId),
    templateIdx: index("orcamento_items_template_idx").on(table.productTemplateId),
  }),
);

export const orcamentoItemBomRows = pgTable(
  "orcamento_item_bom_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orcamentoItemId: uuid("orcamento_item_id")
      .references(() => orcamentoItems.id, { onDelete: "cascade" })
      .notNull(),
    materialId: uuid("material_id")
      .references(() => materials.id)
      .notNull(),
    materialSpecId: uuid("material_spec_id").references(() => materialSpecs.id),
    quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
    notes: text("notes"),
  },
  (table) => ({
    itemIdx: index("orcamento_item_bom_rows_item_idx").on(table.orcamentoItemId),
  }),
);

export const orcamentoPaymentTerms = pgTable(
  "orcamento_payment_terms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orcamentoId: uuid("orcamento_id")
      .references(() => orcamentos.id, { onDelete: "cascade" })
      .notNull(),
    label: varchar("label", { length: 50 }),
    percentage: numeric("percentage", { precision: 5, scale: 2 }),
    dueDays: integer("due_days"),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orcamentoIdx: index("orcamento_payment_terms_orcamento_idx").on(table.orcamentoId),
  }),
);

export const serviceOrders = pgTable(
  "service_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    sourceOrcamentoId: uuid("source_orcamento_id").references(() => orcamentos.id),
    osNumber: integer("os_number").unique(),
    status: osStatusEnum("status").default("created").notNull(),
    dimensionStatus: dimensionStatusEnum("dimension_status").default("unofficial").notNull(),
    stampedAt: timestamp("stamped_at", { withTimezone: true }),
    stampedByUserId: uuid("stamped_by_user_id").references(() => users.id),
    reviewedByUserId: uuid("reviewed_by_user_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ceoExceptionApprovedByUserId: uuid("ceo_exception_approved_by_user_id").references(() => users.id),
    ceoExceptionNotes: text("ceo_exception_notes"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("service_orders_project_idx").on(table.projectId),
    statusIdx: index("service_orders_status_idx").on(table.status),
  }),
);

export const serviceOrderItems = pgTable(
  "service_order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceOrderId: uuid("service_order_id")
      .references(() => serviceOrders.id, { onDelete: "cascade" })
      .notNull(),
    sourceOrcamentoItemId: uuid("source_orcamento_item_id").references(() => orcamentoItems.id),
    sectionNumber: integer("section_number").notNull(),
    itemNumber: integer("item_number").notNull(),
    source: lineItemSourceEnum("source").default("manual").notNull(),
    productTemplateId: uuid("product_template_id").references(() => productTemplates.id),
    linhaId: uuid("linha_id").references(() => linhas.id),
    local: varchar("local", { length: 255 }),
    descricao: text("descricao").notNull(),
    tratamentoSnapshot: varchar("tratamento_snapshot", { length: 255 }),
    vidroSnapshot: varchar("vidro_snapshot", { length: 255 }),
    quotedMeasureText: varchar("quoted_measure_text", { length: 50 }),
    officialMeasureText: varchar("official_measure_text", { length: 50 }),
    quotedWidthMm: integer("quoted_width_mm"),
    quotedHeightMm: integer("quoted_height_mm"),
    officialWidthMm: integer("official_width_mm"),
    officialHeightMm: integer("official_height_mm"),
    dimensionStatus: dimensionStatusEnum("dimension_status").default("unofficial").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    isMaintenanceTask: boolean("is_maintenance_task").default(false).notNull(),
    templateInput: jsonb("template_input"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    serviceOrderIdx: index("service_order_items_so_idx").on(table.serviceOrderId),
    templateIdx: index("service_order_items_template_idx").on(table.productTemplateId),
  }),
);

export const serviceOrderItemBomRows = pgTable(
  "service_order_item_bom_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceOrderItemId: uuid("service_order_item_id")
      .references(() => serviceOrderItems.id, { onDelete: "cascade" })
      .notNull(),
    materialId: uuid("material_id")
      .references(() => materials.id)
      .notNull(),
    materialSpecId: uuid("material_spec_id").references(() => materialSpecs.id),
    quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
    notes: text("notes"),
  },
  (table) => ({
    itemIdx: index("service_order_item_bom_rows_item_idx").on(table.serviceOrderItemId),
  }),
);

export const measurementVisits = pgTable(
  "measurement_visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }),
    type: measurementVisitTypeEnum("type").notNull(),
    performedByUserId: uuid("performed_by_user_id").references(() => users.id),
    visitedAt: timestamp("visited_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("measurement_visits_project_idx").on(table.projectId),
    serviceOrderIdx: index("measurement_visits_so_idx").on(table.serviceOrderId),
  }),
);

export const measurementVisitItems = pgTable(
  "measurement_visit_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    measurementVisitId: uuid("measurement_visit_id")
      .references(() => measurementVisits.id, { onDelete: "cascade" })
      .notNull(),
    orcamentoItemId: uuid("orcamento_item_id").references(() => orcamentoItems.id),
    serviceOrderItemId: uuid("service_order_item_id").references(() => serviceOrderItems.id),
    quotedWidthMm: integer("quoted_width_mm"),
    quotedHeightMm: integer("quoted_height_mm"),
    measuredWidthMm: integer("measured_width_mm"),
    measuredHeightMm: integer("measured_height_mm"),
    dimensionStatus: dimensionStatusEnum("dimension_status").notNull(),
    notes: text("notes"),
  },
  (table) => ({
    visitIdx: index("measurement_visit_items_visit_idx").on(table.measurementVisitId),
  }),
);

export const installments = pgTable(
  "installments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    sourcePaymentTermId: uuid("source_payment_term_id").references(() => orcamentoPaymentTerms.id),
    label: varchar("label", { length: 50 }).notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    dueDate: date("due_date").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    status: installmentStatusEnum("status").default("aberto").notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    sortOrder: integer("sort_order").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("installments_project_idx").on(table.projectId),
    statusIdx: index("installments_status_idx").on(table.status),
  }),
);

export const supplierOrders = pgTable(
  "supplier_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id")
      .references(() => suppliers.id)
      .notNull(),
    externalPedidoNumber: varchar("external_pedido_number", { length: 100 }),
    status: supplierOrderStatusEnum("status").default("placed").notNull(),
    orderDate: date("order_date"),
    confirmedDate: date("confirmed_date"),
    expectedDeliveryDate: date("expected_delivery_date"),
    receivedDate: date("received_date"),
    totalValue: numeric("total_value", { precision: 12, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("supplier_orders_project_idx").on(table.projectId),
    serviceOrderIdx: index("supplier_orders_so_idx").on(table.serviceOrderId),
    supplierIdx: index("supplier_orders_supplier_idx").on(table.supplierId),
    statusIdx: index("supplier_orders_status_idx").on(table.status),
  }),
);

export const supplierOrderItems = pgTable(
  "supplier_order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierOrderId: uuid("supplier_order_id")
      .references(() => supplierOrders.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderItemId: uuid("service_order_item_id").references(() => serviceOrderItems.id),
    materialId: uuid("material_id").references(() => materials.id),
    materialSpecId: uuid("material_spec_id").references(() => materialSpecs.id),
    description: text("description").notNull(),
    specSnapshot: varchar("spec_snapshot", { length: 255 }),
    quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
    totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
    dimensionsText: varchar("dimensions_text", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    supplierOrderIdx: index("supplier_order_items_order_idx").on(table.supplierOrderId),
    serviceOrderItemIdx: index("supplier_order_items_so_item_idx").on(table.serviceOrderItemId),
  }),
);

export const supplierPayments = pgTable(
  "supplier_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierOrderId: uuid("supplier_order_id")
      .references(() => supplierOrders.id, { onDelete: "cascade" })
      .notNull(),
    type: supplierPaymentTypeEnum("type").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    paymentMethod: paymentMethodEnum("payment_method"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    supplierOrderIdx: index("supplier_payments_order_idx").on(table.supplierOrderId),
  }),
);

export const installationTasks = pgTable(
  "installation_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }),
    scheduledDate: date("scheduled_date").notNull(),
    installerEmployeeId: uuid("installer_employee_id").references(() => employees.id),
    helperEmployeeId: uuid("helper_employee_id").references(() => employees.id),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    status: installationTaskStatusEnum("status").default("scheduled").notNull(),
    description: text("description"),
    conclusionNotes: text("conclusion_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("installation_tasks_project_idx").on(table.projectId),
    serviceOrderIdx: index("installation_tasks_so_idx").on(table.serviceOrderId),
    scheduledDateIdx: index("installation_tasks_scheduled_date_idx").on(table.scheduledDate),
    statusIdx: index("installation_tasks_status_idx").on(table.status),
  }),
);

export const workflowTasks = pgTable(
  "workflow_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }),
    type: workflowTaskTypeEnum("type").notNull(),
    owningRole: userRoleEnum("owning_role").notNull(),
    assignedUserId: uuid("assigned_user_id").references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    dueDate: date("due_date"),
    status: workflowTaskStatusEnum("status").default("open").notNull(),
    notes: text("notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("workflow_tasks_project_idx").on(table.projectId),
    serviceOrderIdx: index("workflow_tasks_so_idx").on(table.serviceOrderId),
    owningRoleIdx: index("workflow_tasks_owning_role_idx").on(table.owningRole),
    assignedUserIdx: index("workflow_tasks_assigned_user_idx").on(table.assignedUserId),
    statusIdx: index("workflow_tasks_status_idx").on(table.status),
  }),
);

export const deviations = pgTable(
  "deviations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, { onDelete: "cascade" }),
    type: deviationTypeEnum("type").notNull(),
    assignedUserId: uuid("assigned_user_id").references(() => users.id),
    description: text("description").notNull(),
    resolution: text("resolution"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("deviations_project_idx").on(table.projectId),
    serviceOrderIdx: index("deviations_so_idx").on(table.serviceOrderId),
    typeIdx: index("deviations_type_idx").on(table.type),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    workflowTaskId: uuid("workflow_task_id").references(() => workflowTasks.id, { onDelete: "cascade" }),
    targetRole: userRoleEnum("target_role"),
    targetUserId: uuid("target_user_id").references(() => users.id),
    severity: notificationSeverityEnum("severity").notNull(),
    trigger: notificationTriggerEnum("trigger").notNull(),
    conditionKey: varchar("condition_key", { length: 255 }).notNull(),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("notifications_project_idx").on(table.projectId),
    workflowTaskIdx: index("notifications_workflow_task_idx").on(table.workflowTaskId),
    targetRoleIdx: index("notifications_target_role_idx").on(table.targetRole),
    targetUserIdx: index("notifications_target_user_idx").on(table.targetUserId),
    severityIdx: index("notifications_severity_idx").on(table.severity),
    conditionIdx: index("notifications_condition_key_idx").on(table.conditionKey),
  }),
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }),
    fileSize: integer("file_size"),
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("attachments_entity_idx").on(table.entityType, table.entityId),
  }),
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const customersRelations = relations(customers, ({ many }) => ({
  projects: many(projects),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  measurementVisits: many(measurementVisits),
  workflowTasks: many(workflowTasks),
  notifications: many(notifications),
  attachments: many(attachments),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  installerTasks: many(installationTasks, { relationName: "installerEmployee" }),
  helperTasks: many(installationTasks, { relationName: "helperEmployee" }),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  installationTasks: many(installationTasks),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, { fields: [projects.customerId], references: [customers.id] }),
  acceptedOrcamento: one(orcamentos, {
    fields: [projects.acceptedOrcamentoId],
    references: [orcamentos.id],
  }),
  orcamentos: many(orcamentos),
  serviceOrder: one(serviceOrders),
  installments: many(installments),
  measurementVisits: many(measurementVisits),
  supplierOrders: many(supplierOrders),
  installationTasks: many(installationTasks),
  workflowTasks: many(workflowTasks),
  deviations: many(deviations),
  notifications: many(notifications),
}));

export const orcamentosRelations = relations(orcamentos, ({ one, many }) => ({
  project: one(projects, { fields: [orcamentos.projectId], references: [projects.id] }),
  items: many(orcamentoItems),
  paymentTerms: many(orcamentoPaymentTerms),
}));

export const linhasRelations = relations(linhas, ({ many }) => ({
  materials: many(materials),
  productTemplates: many(productTemplates),
  orcamentoItems: many(orcamentoItems),
  serviceOrderItems: many(serviceOrderItems),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  linha: one(linhas, { fields: [materials.linhaId], references: [linhas.id] }),
  specs: many(materialSpecs),
  orcamentoBomRows: many(orcamentoItemBomRows),
  serviceOrderBomRows: many(serviceOrderItemBomRows),
  supplierOrderItems: many(supplierOrderItems),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  materialSpecs: many(materialSpecs),
  supplierOrders: many(supplierOrders),
}));

export const materialSpecsRelations = relations(materialSpecs, ({ one, many }) => ({
  material: one(materials, { fields: [materialSpecs.materialId], references: [materials.id] }),
  supplier: one(suppliers, { fields: [materialSpecs.supplierId], references: [suppliers.id] }),
  orcamentoBomRows: many(orcamentoItemBomRows),
  serviceOrderBomRows: many(serviceOrderItemBomRows),
  supplierOrderItems: many(supplierOrderItems),
}));

export const productTemplatesRelations = relations(productTemplates, ({ one, many }) => ({
  linha: one(linhas, { fields: [productTemplates.linhaId], references: [linhas.id] }),
  params: many(productTemplateParams),
  bomRows: many(productTemplateBom),
  orcamentoItems: many(orcamentoItems),
  serviceOrderItems: many(serviceOrderItems),
}));

export const productTemplateParamsRelations = relations(productTemplateParams, ({ one }) => ({
  template: one(productTemplates, {
    fields: [productTemplateParams.templateId],
    references: [productTemplates.id],
  }),
}));

export const productTemplateBomRelations = relations(productTemplateBom, ({ one }) => ({
  template: one(productTemplates, {
    fields: [productTemplateBom.templateId],
    references: [productTemplates.id],
  }),
  material: one(materials, { fields: [productTemplateBom.materialId], references: [materials.id] }),
  spec: one(materialSpecs, { fields: [productTemplateBom.specId], references: [materialSpecs.id] }),
}));

export const orcamentoItemsRelations = relations(orcamentoItems, ({ one, many }) => ({
  orcamento: one(orcamentos, { fields: [orcamentoItems.orcamentoId], references: [orcamentos.id] }),
  productTemplate: one(productTemplates, {
    fields: [orcamentoItems.productTemplateId],
    references: [productTemplates.id],
  }),
  linha: one(linhas, { fields: [orcamentoItems.linhaId], references: [linhas.id] }),
  bomRows: many(orcamentoItemBomRows),
  measurementVisitItems: many(measurementVisitItems),
  serviceOrderItems: many(serviceOrderItems),
}));

export const orcamentoItemBomRowsRelations = relations(orcamentoItemBomRows, ({ one }) => ({
  orcamentoItem: one(orcamentoItems, {
    fields: [orcamentoItemBomRows.orcamentoItemId],
    references: [orcamentoItems.id],
  }),
  material: one(materials, { fields: [orcamentoItemBomRows.materialId], references: [materials.id] }),
  materialSpec: one(materialSpecs, {
    fields: [orcamentoItemBomRows.materialSpecId],
    references: [materialSpecs.id],
  }),
}));

export const orcamentoPaymentTermsRelations = relations(orcamentoPaymentTerms, ({ one, many }) => ({
  orcamento: one(orcamentos, {
    fields: [orcamentoPaymentTerms.orcamentoId],
    references: [orcamentos.id],
  }),
  installments: many(installments),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  project: one(projects, { fields: [serviceOrders.projectId], references: [projects.id] }),
  sourceOrcamento: one(orcamentos, {
    fields: [serviceOrders.sourceOrcamentoId],
    references: [orcamentos.id],
  }),
  stampedByUser: one(users, {
    fields: [serviceOrders.stampedByUserId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [serviceOrders.reviewedByUserId],
    references: [users.id],
  }),
  ceoExceptionApprovedByUser: one(users, {
    fields: [serviceOrders.ceoExceptionApprovedByUserId],
    references: [users.id],
  }),
  items: many(serviceOrderItems),
  measurementVisits: many(measurementVisits),
  supplierOrders: many(supplierOrders),
  installationTasks: many(installationTasks),
  workflowTasks: many(workflowTasks),
  deviations: many(deviations),
}));

export const serviceOrderItemsRelations = relations(serviceOrderItems, ({ one, many }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [serviceOrderItems.serviceOrderId],
    references: [serviceOrders.id],
  }),
  sourceOrcamentoItem: one(orcamentoItems, {
    fields: [serviceOrderItems.sourceOrcamentoItemId],
    references: [orcamentoItems.id],
  }),
  productTemplate: one(productTemplates, {
    fields: [serviceOrderItems.productTemplateId],
    references: [productTemplates.id],
  }),
  linha: one(linhas, { fields: [serviceOrderItems.linhaId], references: [linhas.id] }),
  bomRows: many(serviceOrderItemBomRows),
  measurementVisitItems: many(measurementVisitItems),
  supplierOrderItems: many(supplierOrderItems),
}));

export const serviceOrderItemBomRowsRelations = relations(serviceOrderItemBomRows, ({ one }) => ({
  serviceOrderItem: one(serviceOrderItems, {
    fields: [serviceOrderItemBomRows.serviceOrderItemId],
    references: [serviceOrderItems.id],
  }),
  material: one(materials, { fields: [serviceOrderItemBomRows.materialId], references: [materials.id] }),
  materialSpec: one(materialSpecs, {
    fields: [serviceOrderItemBomRows.materialSpecId],
    references: [materialSpecs.id],
  }),
}));

export const measurementVisitsRelations = relations(measurementVisits, ({ one, many }) => ({
  project: one(projects, { fields: [measurementVisits.projectId], references: [projects.id] }),
  serviceOrder: one(serviceOrders, {
    fields: [measurementVisits.serviceOrderId],
    references: [serviceOrders.id],
  }),
  performedByUser: one(users, {
    fields: [measurementVisits.performedByUserId],
    references: [users.id],
  }),
  items: many(measurementVisitItems),
}));

export const measurementVisitItemsRelations = relations(measurementVisitItems, ({ one }) => ({
  measurementVisit: one(measurementVisits, {
    fields: [measurementVisitItems.measurementVisitId],
    references: [measurementVisits.id],
  }),
  orcamentoItem: one(orcamentoItems, {
    fields: [measurementVisitItems.orcamentoItemId],
    references: [orcamentoItems.id],
  }),
  serviceOrderItem: one(serviceOrderItems, {
    fields: [measurementVisitItems.serviceOrderItemId],
    references: [serviceOrderItems.id],
  }),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  project: one(projects, { fields: [installments.projectId], references: [projects.id] }),
  sourcePaymentTerm: one(orcamentoPaymentTerms, {
    fields: [installments.sourcePaymentTermId],
    references: [orcamentoPaymentTerms.id],
  }),
}));

export const supplierOrdersRelations = relations(supplierOrders, ({ one, many }) => ({
  project: one(projects, { fields: [supplierOrders.projectId], references: [projects.id] }),
  serviceOrder: one(serviceOrders, {
    fields: [supplierOrders.serviceOrderId],
    references: [serviceOrders.id],
  }),
  supplier: one(suppliers, { fields: [supplierOrders.supplierId], references: [suppliers.id] }),
  items: many(supplierOrderItems),
  payments: many(supplierPayments),
}));

export const supplierOrderItemsRelations = relations(supplierOrderItems, ({ one }) => ({
  supplierOrder: one(supplierOrders, {
    fields: [supplierOrderItems.supplierOrderId],
    references: [supplierOrders.id],
  }),
  serviceOrderItem: one(serviceOrderItems, {
    fields: [supplierOrderItems.serviceOrderItemId],
    references: [serviceOrderItems.id],
  }),
  material: one(materials, { fields: [supplierOrderItems.materialId], references: [materials.id] }),
  materialSpec: one(materialSpecs, {
    fields: [supplierOrderItems.materialSpecId],
    references: [materialSpecs.id],
  }),
}));

export const supplierPaymentsRelations = relations(supplierPayments, ({ one }) => ({
  supplierOrder: one(supplierOrders, {
    fields: [supplierPayments.supplierOrderId],
    references: [supplierOrders.id],
  }),
}));

export const installationTasksRelations = relations(installationTasks, ({ one }) => ({
  project: one(projects, { fields: [installationTasks.projectId], references: [projects.id] }),
  serviceOrder: one(serviceOrders, {
    fields: [installationTasks.serviceOrderId],
    references: [serviceOrders.id],
  }),
  installerEmployee: one(employees, {
    relationName: "installerEmployee",
    fields: [installationTasks.installerEmployeeId],
    references: [employees.id],
  }),
  helperEmployee: one(employees, {
    relationName: "helperEmployee",
    fields: [installationTasks.helperEmployeeId],
    references: [employees.id],
  }),
  vehicle: one(vehicles, { fields: [installationTasks.vehicleId], references: [vehicles.id] }),
}));

export const workflowTasksRelations = relations(workflowTasks, ({ one, many }) => ({
  project: one(projects, { fields: [workflowTasks.projectId], references: [projects.id] }),
  serviceOrder: one(serviceOrders, {
    fields: [workflowTasks.serviceOrderId],
    references: [serviceOrders.id],
  }),
  assignedUser: one(users, {
    fields: [workflowTasks.assignedUserId],
    references: [users.id],
  }),
  notifications: many(notifications),
}));

export const deviationsRelations = relations(deviations, ({ one }) => ({
  project: one(projects, { fields: [deviations.projectId], references: [projects.id] }),
  serviceOrder: one(serviceOrders, {
    fields: [deviations.serviceOrderId],
    references: [serviceOrders.id],
  }),
  assignedUser: one(users, {
    fields: [deviations.assignedUserId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  project: one(projects, { fields: [notifications.projectId], references: [projects.id] }),
  workflowTask: one(workflowTasks, {
    fields: [notifications.workflowTaskId],
    references: [workflowTasks.id],
  }),
  targetUser: one(users, {
    fields: [notifications.targetUserId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [attachments.uploadedByUserId],
    references: [users.id],
  }),
}));
