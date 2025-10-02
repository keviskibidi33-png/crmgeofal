-- =====================================================
-- CRM GEOFAL - BASE DE DATOS COMPLETA
-- Sistema de Gestión de Laboratorio y CRM
-- Generado: 2025-01-27
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
-- SECUENCIAS
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS companies_id_seq;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS subcategories_id_seq;
CREATE SEQUENCE IF NOT EXISTS services_id_seq;
CREATE SEQUENCE IF NOT EXISTS subservices_id_seq;
CREATE SEQUENCE IF NOT EXISTS projects_id_seq;
CREATE SEQUENCE IF NOT EXISTS quotes_id_seq;
CREATE SEQUENCE IF NOT EXISTS quote_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS quote_variants_id_seq;
CREATE SEQUENCE IF NOT EXISTS invoices_id_seq;
CREATE SEQUENCE IF NOT EXISTS leads_id_seq;
CREATE SEQUENCE IF NOT EXISTS activities_id_seq;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
CREATE SEQUENCE IF NOT EXISTS tickets_id_seq;
CREATE SEQUENCE IF NOT EXISTS ticket_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS project_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS project_attachments_id_seq;
CREATE SEQUENCE IF NOT EXISTS evidences_id_seq;
CREATE SEQUENCE IF NOT EXISTS export_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS audit_log_id_seq;
CREATE SEQUENCE IF NOT EXISTS audit_cleanup_log_id_seq;
CREATE SEQUENCE IF NOT EXISTS audit_quotes_id_seq;
CREATE SEQUENCE IF NOT EXISTS monthly_goals_id_seq;
CREATE SEQUENCE IF NOT EXISTS project_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS project_subcategories_id_seq;
CREATE SEQUENCE IF NOT EXISTS project_services_id_seq;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- =====================================================
-- TABLA: USERS (Usuarios del sistema)
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
-- TABLA: COMPANIES (Empresas/Clientes)
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
-- TABLA: CATEGORIES (Categorías de servicios)
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

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories USING btree (name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories USING btree (is_active);

-- =====================================================
-- TABLA: SUBCATEGORIES (Subcategorías)
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

-- Índices para subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_name ON public.subcategories USING btree (name);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON public.subcategories USING btree (is_active);

-- =====================================================
-- TABLA: SERVICES (Servicios principales)
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

-- Índices para services
CREATE INDEX IF NOT EXISTS idx_services_code ON public.services USING btree (code);
CREATE INDEX IF NOT EXISTS idx_services_name ON public.services USING btree (name);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON public.services USING btree (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON public.services USING btree (price);

-- =====================================================
-- TABLA: SUBSERVICES (Subservicios/Ensayos específicos)
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

-- Índices para subservices
CREATE INDEX IF NOT EXISTS idx_subservices_codigo ON public.subservices USING btree (codigo);
CREATE INDEX IF NOT EXISTS idx_subservices_descripcion ON public.subservices USING gin (to_tsvector('spanish'::regconfig, descripcion));
CREATE INDEX IF NOT EXISTS idx_subservices_service_id ON public.subservices USING btree (service_id);
CREATE INDEX IF NOT EXISTS idx_subservices_active ON public.subservices USING btree (is_active);

-- =====================================================
-- TABLA: PROJECTS (Proyectos)
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
  estado character varying DEFAULT 'borrador'::character varying,
  cotizacion_id integer,
  usuario_laboratorio_id integer,
  fecha_envio_laboratorio timestamp without time zone,
  fecha_completado_laboratorio timestamp without time zone,
  notas_laboratorio text,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (vendedor_id) REFERENCES users(id),
  FOREIGN KEY (laboratorio_id) REFERENCES users(id)
);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects USING btree (company_id);
CREATE INDEX IF NOT EXISTS idx_projects_vendedor_id ON public.projects USING btree (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_projects_laboratorio_id ON public.projects USING btree (laboratorio_id);

-- =====================================================
-- TABLA: PROJECT_CATEGORIES (Categorías de proyectos)
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
-- TABLA: PROJECT_SUBCATEGORIES (Subcategorías de proyectos)
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
  UNIQUE (name),
  FOREIGN KEY (category_id) REFERENCES project_categories(id)
);

-- =====================================================
-- TABLA: PROJECT_SERVICES (Servicios de proyectos)
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
-- TABLA: QUOTE_VARIANTS (Variantes de cotización)
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
-- TABLA: QUOTES (Cotizaciones)
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
  es_contrato boolean DEFAULT false,
  archivos_cotizacion jsonb,
  archivos_laboratorio jsonb,
  notas_vendedor text,
  notas_laboratorio text,
  quote_number character varying(50),
  payment_status character varying(50) DEFAULT 'Pendiente',
  payment_date date,
  payment_method character varying(100),
  payment_amount numeric(10, 2),
  cloned_from integer,
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (variant_id) REFERENCES quote_variants(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (cloned_from) REFERENCES quotes(id)
);

-- Índices para quotes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes USING btree (status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON public.quotes USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON public.quotes USING btree (issue_date);
CREATE INDEX IF NOT EXISTS idx_quotes_updated_at ON public.quotes USING btree (updated_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- =====================================================
-- TABLA: QUOTE_ITEMS (Items de cotización)
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
-- TABLA: QUOTE_VERSIONS (Versiones de cotizaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_versions (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data_snapshot JSONB NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_restoration BOOLEAN DEFAULT FALSE,
    UNIQUE(quote_id, version_number)
);

-- =====================================================
-- TABLA: QUOTE_APPROVALS (Aprobaciones de cotizaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_approvals (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    request_data JSONB,
    approval_data JSONB,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('sent', 'in_review', 'approved', 'rejected'))
);

-- =====================================================
-- TABLA: INVOICES (Facturas)
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

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices USING btree (payment_status);

-- =====================================================
-- TABLA: PAYMENT_PROOFS (Comprobantes de pago)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_proofs (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    description TEXT,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approval_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para payment_proofs
CREATE INDEX IF NOT EXISTS idx_payment_proofs_quote_id ON payment_proofs(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_uploaded_by ON payment_proofs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_approved_by ON payment_proofs(approved_by);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_date ON payment_proofs(payment_date);

-- =====================================================
-- TABLA: LEADS (Prospectos)
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

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads USING btree (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads USING btree (status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads USING btree (assigned_to);

-- =====================================================
-- TABLA: ACTIVITIES (Actividades del sistema)
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

-- Índices para activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities USING btree (type);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities USING btree (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON public.activities USING btree (user_id, created_at);

-- =====================================================
-- TABLA: NOTIFICATIONS (Notificaciones)
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

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications USING btree (type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications USING btree (read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);

-- =====================================================
-- TABLA: TICKETS (Tickets de soporte)
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

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets USING btree (status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets USING btree (priority);

-- =====================================================
-- TABLA: TICKET_HISTORY (Historial de tickets)
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
-- TABLA: PROJECT_HISTORY (Historial de proyectos)
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
-- TABLA: PROJECT_ATTACHMENTS (Adjuntos de proyectos)
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

-- Índices para project_attachments
CREATE INDEX IF NOT EXISTS idx_project_attachments_category ON public.project_attachments USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_subcategory ON public.project_attachments USING btree (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_updated_at ON public.project_attachments USING btree (updated_at);

-- =====================================================
-- TABLA: EVIDENCES (Evidencias)
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
-- TABLA: EXPORT_HISTORY (Historial de exportaciones)
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

-- Índices para export_history
CREATE INDEX IF NOT EXISTS idx_export_history_type ON public.export_history USING btree (type);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON public.export_history USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_export_history_client_id ON public.export_history USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_export_history_project_id ON public.export_history USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON public.export_history USING btree (status);

-- =====================================================
-- TABLA: AUDIT_LOG (Log de auditoría general)
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
-- TABLA: AUDIT_CLEANUP_LOG (Log de limpieza de auditoría)
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

-- Índice para audit_cleanup_log
CREATE INDEX IF NOT EXISTS idx_audit_cleanup_date ON public.audit_cleanup_log USING btree (cleanup_date);

-- =====================================================
-- TABLA: AUDIT_QUOTES (Auditoría de cotizaciones)
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
-- TABLA: MONTHLY_GOALS (Metas mensuales)
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
  UNIQUE (month),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Índices para monthly_goals
CREATE INDEX IF NOT EXISTS idx_monthly_goals_year_month ON public.monthly_goals USING btree (year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_created_by ON public.monthly_goals USING btree (created_by);

-- =====================================================
-- FUNCIONES DEL SISTEMA
-- =====================================================

-- Función para generar número de cotización automático
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    quote_num VARCHAR(50);
BEGIN
    -- Obtener año actual
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Obtener siguiente número de secuencia
    sequence_num := nextval('quote_number_seq');
    
    -- Formato: COT-YYYY-NNNN (ej: COT-2025-0001)
    quote_num := 'COT-' || year_part || '-' || LPAD(sequence_num::VARCHAR, 4, '0');
    
    -- Asignar número generado
    NEW.quote_number := quote_num;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar payment_proofs updated_at
CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para obtener la última limpieza de auditoría
CREATE OR REPLACE FUNCTION get_last_cleanup()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN (
    SELECT cleanup_date 
    FROM audit_cleanup_log 
    ORDER BY cleanup_date DESC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS DEL SISTEMA
-- =====================================================

-- Trigger para generar número de cotización automáticamente
DROP TRIGGER IF EXISTS trigger_generate_quote_number ON quotes;
CREATE TRIGGER trigger_generate_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
    EXECUTE FUNCTION generate_quote_number();

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_quote_approvals_updated_at ON quote_approvals;
CREATE TRIGGER update_quote_approvals_updated_at 
    BEFORE UPDATE ON quote_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_proofs_updated_at ON payment_proofs;
CREATE TRIGGER update_payment_proofs_updated_at
BEFORE UPDATE ON payment_proofs
FOR EACH ROW
EXECUTE FUNCTION update_payment_proofs_updated_at();

-- =====================================================
-- VISTAS DEL SISTEMA
-- =====================================================

-- Vista para métricas de embudo (solo para Jefe Comercial)
CREATE OR REPLACE VIEW funnel_metrics_view AS
SELECT 
    qa.id as approval_id,
    qa.quote_id,
    q.quote_number,
    q.total as total_amount,
    q.subtotal,
    q.igv,
    qa.approved_at,
    p.name as project_name,
    c.name as company_name,
    c.ruc as company_ruc,
    requester.name as requested_by_name,
    approver.name as approved_by_name,
    qi.subservice_id,
    ss.name as service_name,
    ss.codigo as service_code,
    ss.precio as service_price,
    qi.quantity,
    qi.unit_price,
    qi.partial_price as total_price
FROM quote_approvals qa
JOIN quotes q ON qa.quote_id = q.id
LEFT JOIN projects p ON q.project_id = p.id
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users requester ON qa.requested_by = requester.id
LEFT JOIN users approver ON qa.approved_by = approver.id
LEFT JOIN quote_items qi ON q.id = qi.quote_id
LEFT JOIN subservices ss ON qi.subservice_id = ss.id
WHERE qa.status = 'approved';

-- =====================================================
-- DATOS INICIALES DEL SISTEMA
-- =====================================================

-- Usuarios del sistema
INSERT INTO users (id, name, email, password_hash, role, created_at, apellido, area, notification_enabled) VALUES
(1, 'Admin Sistema', 'admin@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'admin', NOW(), 'Sistema', 'Administración', true),
(2, 'Vendedor Test', 'vendedor@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'vendedor', NOW(), 'Test', 'Comercial', true),
(3, 'Laboratorio Test', 'laboratorio@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'laboratorio', NOW(), 'Test', 'Laboratorio', true),
(4, 'Usuario Facturación', 'facturacion@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'facturacion', NOW(), 'Facturación', 'Facturación', true),
(5, 'Jefe Comercial', 'jefe.comercial@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'jefe_comercial', NOW(), 'Comercial', 'Comercial', true)
ON CONFLICT (email) DO NOTHING;

-- Empresas de ejemplo
INSERT INTO companies (id, type, name, ruc, dni, address, email, phone, contact_name, city, sector, created_at) VALUES
(1, 'empresa', 'Empresa Constructora ABC S.A.C.', '20123456789', NULL, 'Av. Principal 123, Lima', 'contacto@abc.com', '987654321', 'Juan Pérez', 'Lima', 'Construcción', NOW()),
(2, 'persona_natural', 'María González', NULL, '12345678', 'Jr. Las Flores 456, Arequipa', 'maria@email.com', '987654322', 'María González', 'Arequipa', 'Ingeniería', NOW())
ON CONFLICT (ruc) DO NOTHING;

-- Servicios principales del laboratorio
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
(17, 'INGENIERÍA', 'ingenieria', 'Servicios de ingeniería', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios del sistema CRM con diferentes roles y permisos';
COMMENT ON TABLE companies IS 'Empresas y clientes del sistema';
COMMENT ON TABLE projects IS 'Proyectos de laboratorio e ingeniería';
COMMENT ON TABLE quotes IS 'Cotizaciones del sistema con numeración automática';
COMMENT ON TABLE quote_approvals IS 'Sistema de aprobaciones con flujo diferenciado por roles';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones multicanal (email, websocket, database)';
COMMENT ON TABLE activities IS 'Registro de actividades recientes del sistema CRM';
COMMENT ON TABLE monthly_goals IS 'Metas mensuales de ventas configuradas por el jefe comercial';
COMMENT ON TABLE audit_log IS 'Log de auditoría general del sistema';
COMMENT ON TABLE payment_proofs IS 'Comprobantes de pago con sistema de aprobación';
COMMENT ON VIEW funnel_metrics_view IS 'Vista optimizada para métricas de embudo del Jefe Comercial';

-- =====================================================
-- FIN DEL ARCHIVO
-- =====================================================
