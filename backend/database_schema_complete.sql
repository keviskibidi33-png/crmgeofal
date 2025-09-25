-- =====================================================
-- CRM GEOFAL - BASE DE DATOS COMPLETA
-- Generado automáticamente el 25/9/2025, 5:59:23 p. m.
-- =====================================================

-- Configuración inicial
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- =====================================================
-- TABLA: USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  name character varying(100) NOT NULL,
  email character varying(100) NOT NULL,
  password_hash character varying(255) NOT NULL,
  role character varying(50) NOT NULL DEFAULT 'vendedor'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  apellido text,
  area text,
  notification_enabled boolean DEFAULT true,
  PRIMARY KEY (id),
  UNIQUE (email)
);

-- =====================================================
-- TABLA: COMPANIES
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id integer NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
  ruc character varying(20) NOT NULL,
  name character varying(150) NOT NULL,
  address text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  type character varying(20) DEFAULT 'empresa'::character varying,
  dni character varying(15),
  email character varying(100),
  phone character varying(30),
  contact_name character varying(100),
  city character varying(50),
  sector character varying(50),
  PRIMARY KEY (id),
  UNIQUE (ruc)
);

-- =====================================================
-- TABLA: CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name character varying(100) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Índice: idx_categories_name
CREATE INDEX idx_categories_name ON public.categories USING btree (name);

-- Índice: idx_categories_active
CREATE INDEX idx_categories_active ON public.categories USING btree (is_active);

-- =====================================================
-- TABLA: SUBCATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id integer NOT NULL DEFAULT nextval('subcategories_id_seq'::regclass),
  category_id integer NOT NULL,
  name character varying(100) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Índice: idx_subcategories_name
CREATE INDEX idx_subcategories_name ON public.subcategories USING btree (name);

-- Índice: idx_subcategories_category
CREATE INDEX idx_subcategories_category ON public.subcategories USING btree (category_id);

-- Índice: idx_subcategories_active
CREATE INDEX idx_subcategories_active ON public.subcategories USING btree (is_active);

-- =====================================================
-- TABLA: SERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
  id integer NOT NULL DEFAULT nextval('services_id_seq'::regclass),
  name character varying(100) NOT NULL,
  area character varying(50) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  code character varying(50),
  description text,
  norm_ntp character varying(50),
  norm_astm character varying(50),
  comments text,
  category_id integer,
  is_active boolean DEFAULT true,
  subcategory_id integer,
  updated_at timestamp without time zone DEFAULT now(),
  price numeric DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- Índice: idx_services_code
CREATE INDEX idx_services_code ON public.services USING btree (code);

-- Índice: idx_services_name
CREATE INDEX idx_services_name ON public.services USING btree (name);

-- Índice: idx_services_category
CREATE INDEX idx_services_category ON public.services USING btree (category_id);

-- Índice: idx_services_subcategory
CREATE INDEX idx_services_subcategory ON public.services USING btree (subcategory_id);

-- Índice: idx_services_active
CREATE INDEX idx_services_active ON public.services USING btree (is_active);

-- Índice: idx_services_price
CREATE INDEX idx_services_price ON public.services USING btree (price);

-- =====================================================
-- TABLA: SUBSERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS subservices (
  id integer NOT NULL DEFAULT nextval('subservices_id_seq'::regclass),
  service_id integer NOT NULL,
  name text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  codigo character varying(20) NOT NULL,
  descripcion text NOT NULL,
  norma text,
  precio numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE (codigo)
);

-- Índice: idx_subservices_codigo
CREATE INDEX idx_subservices_codigo ON public.subservices USING btree (codigo);

-- Índice: idx_subservices_descripcion
CREATE INDEX idx_subservices_descripcion ON public.subservices USING gin (to_tsvector('spanish'::regconfig, descripcion));

-- Índice: idx_subservices_service_id
CREATE INDEX idx_subservices_service_id ON public.subservices USING btree (service_id);

-- Índice: idx_subservices_active
CREATE INDEX idx_subservices_active ON public.subservices USING btree (is_active);

-- =====================================================
-- TABLA: PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  company_id integer NOT NULL,
  name character varying(150) NOT NULL,
  location character varying(150),
  vendedor_id integer,
  laboratorio_id integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status character varying(20) DEFAULT 'pendiente'::character varying,
  project_type character varying(50),
  requiere_laboratorio boolean DEFAULT false,
  requiere_ingenieria boolean DEFAULT false,
  contact_name character varying(255),
  contact_phone character varying(50),
  contact_email character varying(255),
  laboratorio_status character varying(50) DEFAULT 'no_requerido'::character varying,
  ingenieria_status character varying(50) DEFAULT 'no_requerido'::character varying,
  status_notes text,
  requiere_consultoria boolean DEFAULT false,
  requiere_capacitacion boolean DEFAULT false,
  requiere_auditoria boolean DEFAULT false,
  queries text,
  marked boolean DEFAULT false,
  priority character varying(20) DEFAULT 'normal'::character varying,
  updated_at timestamp without time zone DEFAULT now(),
  category_id integer,
  subcategory_id integer,
  category_name character varying(255),
  subcategory_name character varying(255),
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (vendedor_id) REFERENCES users(id),
  FOREIGN KEY (laboratorio_id) REFERENCES users(id)
);

-- Índice: idx_projects_company_id
CREATE INDEX idx_projects_company_id ON public.projects USING btree (company_id);

-- Índice: idx_projects_vendedor_id
CREATE INDEX idx_projects_vendedor_id ON public.projects USING btree (vendedor_id);

-- Índice: idx_projects_laboratorio_id
CREATE INDEX idx_projects_laboratorio_id ON public.projects USING btree (laboratorio_id);

-- =====================================================
-- TABLA: PROJECT_CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_categories (
  id integer NOT NULL DEFAULT nextval('project_categories_id_seq'::regclass),
  name character varying(255) NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (name)
);

-- =====================================================
-- TABLA: PROJECT_SUBCATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_subcategories (
  id integer NOT NULL DEFAULT nextval('project_subcategories_id_seq'::regclass),
  category_id integer,
  name character varying(255) NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (category_id),
  UNIQUE (category_id),
  UNIQUE (name),
  UNIQUE (name),
  FOREIGN KEY (category_id) REFERENCES project_categories(id)
);

-- =====================================================
-- TABLA: PROJECT_SERVICES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_services (
  id integer NOT NULL DEFAULT nextval('project_services_id_seq'::regclass),
  project_id integer NOT NULL,
  subservice_id integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  provided_by integer,
  provided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (subservice_id) REFERENCES subservices(id),
  FOREIGN KEY (provided_by) REFERENCES users(id)
);

-- =====================================================
-- TABLA: QUOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
  id integer NOT NULL DEFAULT nextval('quotes_id_seq'::regclass),
  project_id integer NOT NULL,
  document_url text,
  engineer_name character varying(100),
  notes text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  subtotal numeric DEFAULT 0,
  igv numeric DEFAULT 0,
  reference text,
  meta jsonb,
  variant_id integer,
  created_by integer,
  client_contact character varying(100),
  client_email character varying(100),
  client_phone character varying(30),
  issue_date date,
  total numeric,
  status character varying(30) DEFAULT 'borrador'::character varying,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  reference_type jsonb,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (variant_id) REFERENCES quote_variants(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Índice: idx_quotes_status
CREATE INDEX idx_quotes_status ON public.quotes USING btree (status);

-- Índice: idx_quotes_created_by
CREATE INDEX idx_quotes_created_by ON public.quotes USING btree (created_by);

-- Índice: idx_quotes_issue_date
CREATE INDEX idx_quotes_issue_date ON public.quotes USING btree (issue_date);

-- Índice: idx_quotes_updated_at
CREATE INDEX idx_quotes_updated_at ON public.quotes USING btree (updated_at);

-- =====================================================
-- TABLA: QUOTE_ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_items (
  id integer NOT NULL DEFAULT nextval('quote_items_id_seq'::regclass),
  quote_id integer NOT NULL,
  code character varying(50),
  description text,
  norm character varying(50),
  unit_price numeric,
  quantity integer,
  partial_price numeric,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- =====================================================
-- TABLA: QUOTE_VARIANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_variants (
  id integer NOT NULL DEFAULT nextval('quote_variants_id_seq'::regclass),
  code character varying(20) NOT NULL,
  title character varying(150) NOT NULL,
  description text,
  conditions jsonb,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  image_url text,
  PRIMARY KEY (id),
  UNIQUE (code)
);

-- =====================================================
-- TABLA: INVOICES
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
  project_id integer NOT NULL,
  quote_number character varying(50) NOT NULL,
  received_at date,
  payment_due date,
  payment_status character varying(20) NOT NULL DEFAULT 'pendiente'::character varying,
  amount numeric NOT NULL DEFAULT 0,
  created_by integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Índice: idx_invoices_project_id
CREATE INDEX idx_invoices_project_id ON public.invoices USING btree (project_id);

-- Índice: idx_invoices_payment_status
CREATE INDEX idx_invoices_payment_status ON public.invoices USING btree (payment_status);

-- =====================================================
-- TABLA: LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id integer NOT NULL DEFAULT nextval('leads_id_seq'::regclass),
  company_id integer,
  name character varying(150) NOT NULL,
  email character varying(100),
  phone character varying(30),
  status character varying(30) NOT NULL DEFAULT 'nuevo'::character varying,
  type character varying(30) NOT NULL DEFAULT 'nuevo'::character varying,
  assigned_to integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Índice: idx_leads_company_id
CREATE INDEX idx_leads_company_id ON public.leads USING btree (company_id);

-- Índice: idx_leads_status
CREATE INDEX idx_leads_status ON public.leads USING btree (status);

-- Índice: idx_leads_assigned_to
CREATE INDEX idx_leads_assigned_to ON public.leads USING btree (assigned_to);

-- =====================================================
-- TABLA: ACTIVITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id integer NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
  user_id integer NOT NULL,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  entity_type character varying(50),
  entity_id integer,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índice: idx_activities_user_id
CREATE INDEX idx_activities_user_id ON public.activities USING btree (user_id);

-- Índice: idx_activities_type
CREATE INDEX idx_activities_type ON public.activities USING btree (type);

-- Índice: idx_activities_entity
CREATE INDEX idx_activities_entity ON public.activities USING btree (entity_type, entity_id);

-- Índice: idx_activities_created_at
CREATE INDEX idx_activities_created_at ON public.activities USING btree (created_at);

-- Índice: idx_activities_user_created
CREATE INDEX idx_activities_user_created ON public.activities USING btree (user_id, created_at);

-- =====================================================
-- TABLA: NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id integer NOT NULL,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  data jsonb,
  priority character varying(20) DEFAULT 'normal'::character varying,
  read_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índice: idx_notifications_user_id
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

-- Índice: idx_notifications_type
CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);

-- Índice: idx_notifications_read_at
CREATE INDEX idx_notifications_read_at ON public.notifications USING btree (read_at);

-- Índice: idx_notifications_created_at
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);

-- Índice: idx_notifications_user_unread
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);

-- =====================================================
-- TABLA: TICKETS
-- =====================================================
CREATE TABLE IF NOT EXISTS tickets (
  id integer NOT NULL DEFAULT nextval('tickets_id_seq'::regclass),
  user_id integer NOT NULL,
  title character varying(200) NOT NULL,
  description text NOT NULL,
  priority character varying(20) NOT NULL DEFAULT 'media'::character varying,
  status character varying(20) NOT NULL DEFAULT 'abierto'::character varying,
  attachment_url text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índice: idx_tickets_status
CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);

-- Índice: idx_tickets_priority
CREATE INDEX idx_tickets_priority ON public.tickets USING btree (priority);

-- =====================================================
-- TABLA: TICKET_HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_history (
  id integer NOT NULL DEFAULT nextval('ticket_history_id_seq'::regclass),
  ticket_id integer NOT NULL,
  action character varying(100) NOT NULL,
  performed_by integer,
  performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text,
  PRIMARY KEY (id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- =====================================================
-- TABLA: PROJECT_HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS project_history (
  id integer NOT NULL DEFAULT nextval('project_history_id_seq'::regclass),
  project_id integer NOT NULL,
  action character varying(100) NOT NULL,
  performed_by integer,
  performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- =====================================================
-- TABLA: PROJECT_ATTACHMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_attachments (
  id integer NOT NULL DEFAULT nextval('project_attachments_id_seq'::regclass),
  project_id integer NOT NULL,
  uploaded_by integer,
  file_type character varying(100),
  description text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  category_id integer,
  subcategory_id integer,
  filename character varying(255),
  original_name character varying(255),
  file_path character varying(500),
  file_size integer,
  requiere_laboratorio boolean DEFAULT false,
  requiere_ingenieria boolean DEFAULT false,
  requiere_consultoria boolean DEFAULT false,
  requiere_capacitacion boolean DEFAULT false,
  requiere_auditoria boolean DEFAULT false,
  mime_type character varying(100),
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  file_url text,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Índice: idx_project_attachments_category
CREATE INDEX idx_project_attachments_category ON public.project_attachments USING btree (category_id);

-- Índice: idx_project_attachments_subcategory
CREATE INDEX idx_project_attachments_subcategory ON public.project_attachments USING btree (subcategory_id);

-- Índice: idx_project_attachments_updated_at
CREATE INDEX idx_project_attachments_updated_at ON public.project_attachments USING btree (updated_at);

-- =====================================================
-- TABLA: EVIDENCES
-- =====================================================
CREATE TABLE IF NOT EXISTS evidences (
  id integer NOT NULL DEFAULT nextval('evidences_id_seq'::regclass),
  project_id integer,
  invoice_id integer,
  type character varying(50) NOT NULL,
  file_url text NOT NULL,
  uploaded_by integer,
  uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- =====================================================
-- TABLA: EXPORT_HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS export_history (
  id integer NOT NULL DEFAULT nextval('export_history_id_seq'::regclass),
  user_id integer,
  type character varying(20) NOT NULL,
  resource character varying(50) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  client_id integer,
  project_id integer,
  commercial_id integer,
  laboratory_id integer,
  status character varying(20) DEFAULT 'nuevo'::character varying,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES companies(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (commercial_id) REFERENCES users(id),
  FOREIGN KEY (laboratory_id) REFERENCES users(id)
);

-- Índice: idx_export_history_type
CREATE INDEX idx_export_history_type ON public.export_history USING btree (type);

-- Índice: idx_export_history_created_at
CREATE INDEX idx_export_history_created_at ON public.export_history USING btree (created_at);

-- Índice: idx_export_history_client_id
CREATE INDEX idx_export_history_client_id ON public.export_history USING btree (client_id);

-- Índice: idx_export_history_project_id
CREATE INDEX idx_export_history_project_id ON public.export_history USING btree (project_id);

-- Índice: idx_export_history_status
CREATE INDEX idx_export_history_status ON public.export_history USING btree (status);

-- =====================================================
-- TABLA: AUDIT_LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id integer NOT NULL DEFAULT nextval('audit_log_id_seq'::regclass),
  user_id integer,
  action character varying(100) NOT NULL,
  entity character varying(50),
  entity_id integer,
  details text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- TABLA: AUDIT_CLEANUP_LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_cleanup_log (
  id integer NOT NULL DEFAULT nextval('audit_cleanup_log_id_seq'::regclass),
  cleanup_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  hours_threshold integer NOT NULL,
  deleted_count integer NOT NULL,
  total_before integer NOT NULL,
  total_after integer NOT NULL,
  executed_by integer,
  notes text,
  PRIMARY KEY (id),
  FOREIGN KEY (executed_by) REFERENCES users(id)
);

-- Índice: idx_audit_cleanup_date
CREATE INDEX idx_audit_cleanup_date ON public.audit_cleanup_log USING btree (cleanup_date);

-- =====================================================
-- TABLA: AUDIT_QUOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_quotes (
  id integer NOT NULL DEFAULT nextval('audit_quotes_id_seq'::regclass),
  user_id integer,
  action character varying(50) NOT NULL,
  entity character varying(30) NOT NULL,
  entity_id integer,
  details text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- TABLA: MONTHLY_GOALS
-- =====================================================
CREATE TABLE IF NOT EXISTS monthly_goals (
  id integer NOT NULL DEFAULT nextval('monthly_goals_id_seq'::regclass),
  year integer NOT NULL,
  month integer NOT NULL,
  created_by integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  updated_by integer,
  goal_quantity integer NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (year),
  UNIQUE (year),
  UNIQUE (month),
  UNIQUE (month),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Índice: idx_monthly_goals_year_month
CREATE INDEX idx_monthly_goals_year_month ON public.monthly_goals USING btree (year, month);

-- Índice: idx_monthly_goals_created_by
CREATE INDEX idx_monthly_goals_created_by ON public.monthly_goals USING btree (created_by);

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Usuarios de ejemplo
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(1, 'Admin Sistema', 'admin@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'admin', NOW(), NOW()),
(2, 'Vendedor Test', 'vendedor@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'seller', NOW(), NOW()),
(3, 'Laboratorio Test', 'laboratorio@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'laboratory', NOW(), NOW());

-- Empresas de ejemplo
INSERT INTO companies (id, type, name, ruc, dni, address, email, phone, contact_name, city, sector, created_at, updated_at) VALUES
(1, 'empresa', 'Empresa Constructora ABC S.A.C.', '20123456789', NULL, 'Av. Principal 123, Lima', 'contacto@abc.com', '987654321', 'Juan Pérez', 'Lima', 'Construcción', NOW(), NOW()),
(2, 'persona_natural', 'María González', NULL, '12345678', 'Jr. Las Flores 456, Arequipa', 'maria@email.com', '987654322', 'María González', 'Arequipa', 'Ingeniería', NOW(), NOW());

-- Servicios principales
INSERT INTO services (id, name, area, description, created_at, updated_at) VALUES
(1, 'ENSAYO ESTÁNDAR', 'laboratorio', 'Ensayos de suelos estándar', NOW(), NOW()),
(2, 'ENSAYOS ESPECIALES', 'laboratorio', 'Ensayos de suelos especiales', NOW(), NOW()),
(3, 'ENSAYO AGREGADO', 'laboratorio', 'Ensayos para agregados', NOW(), NOW()),
(4, 'ENSAYOS DE CAMPO', 'laboratorio', 'Ensayos realizados en campo', NOW(), NOW()),
(5, 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', 'laboratorio', 'Ensayos químicos para suelo y agua subterránea', NOW(), NOW()),
(6, 'ENSAYO QUÍMICO AGREGADO', 'laboratorio', 'Ensayos químicos para agregados', NOW(), NOW()),
(7, 'ENSAYO CONCRETO', 'laboratorio', 'Ensayos para concreto', NOW(), NOW()),
(8, 'ENSAYO ALBAÑILERÍA', 'laboratorio', 'Ensayos para albañilería', NOW(), NOW()),
(9, 'ENSAYO ROCA', 'laboratorio', 'Ensayos para roca', NOW(), NOW()),
(10, 'CEMENTO', 'laboratorio', 'Ensayos para cemento', NOW(), NOW()),
(11, 'ENSAYO PAVIMENTO', 'laboratorio', 'Ensayos para pavimentos', NOW(), NOW()),
(12, 'ENSAYO ASFALTO', 'laboratorio', 'Ensayos para asfalto', NOW(), NOW()),
(13, 'ENSAYO MEZCLA ASFÁLTICO', 'laboratorio', 'Ensayos para mezclas asfálticas', NOW(), NOW()),
(14, 'EVALUACIONES ESTRUCTURALES', 'laboratorio', 'Evaluaciones estructurales', NOW(), NOW()),
(15, 'IMPLEMENTACIÓN LABORATORIO EN OBRA', 'laboratorio', 'Implementación de laboratorio en obra', NOW(), NOW()),
(16, 'OTROS SERVICIOS', 'laboratorio', 'Otros servicios de laboratorio', NOW(), NOW()),
(17, 'INGENIERÍA', 'ingenieria', 'Servicios de ingeniería', NOW(), NOW());

-- =====================================================
-- FIN DEL ARCHIVO
-- =====================================================
