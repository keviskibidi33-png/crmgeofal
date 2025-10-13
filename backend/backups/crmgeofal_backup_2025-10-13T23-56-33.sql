-- CRM GEOFAL Database Backup
-- Generated: 2025-10-13T23:56:33.355Z
-- Database: crmgeofal

-- ==============================================
-- TABLE STRUCTURES
-- ==============================================

-- Table: activities
CREATE TABLE IF NOT EXISTS activities (
  id integer NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
  user_id integer NOT NULL,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  entity_type character varying(50),
  entity_id integer,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: audit_cleanup_log
CREATE TABLE IF NOT EXISTS audit_cleanup_log (
  id integer NOT NULL DEFAULT nextval('audit_cleanup_log_id_seq'::regclass),
  cleanup_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  hours_threshold integer NOT NULL,
  deleted_count integer NOT NULL,
  total_before integer NOT NULL,
  total_after integer NOT NULL,
  executed_by integer,
  notes text
);

-- Table: audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id integer NOT NULL DEFAULT nextval('audit_log_id_seq'::regclass),
  user_id integer,
  action character varying(100) NOT NULL,
  entity character varying(50),
  entity_id integer,
  details text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: audit_quotes
CREATE TABLE IF NOT EXISTS audit_quotes (
  id integer NOT NULL DEFAULT nextval('audit_quotes_id_seq'::regclass),
  user_id integer,
  action character varying(50) NOT NULL,
  entity character varying(30) NOT NULL,
  entity_id integer,
  details text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  name character varying(100) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: client_comments
CREATE TABLE IF NOT EXISTS client_comments (
  id integer NOT NULL DEFAULT nextval('client_comments_id_seq'::regclass),
  company_id integer NOT NULL,
  user_id integer NOT NULL,
  comment text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_system boolean DEFAULT false,
  is_read boolean DEFAULT false
);

-- Table: companies
CREATE TABLE IF NOT EXISTS companies (
  id integer NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
  ruc character varying(20),
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
  status character varying(50) DEFAULT 'prospeccion'::character varying,
  managed_by integer,
  updated_at timestamp without time zone DEFAULT now(),
  priority character varying(20) DEFAULT 'normal'::character varying,
  actividad text,
  servicios text
);

-- Table: evidences
CREATE TABLE IF NOT EXISTS evidences (
  id integer NOT NULL DEFAULT nextval('evidences_id_seq'::regclass),
  project_id integer,
  invoice_id integer,
  type character varying(50) NOT NULL,
  file_url text NOT NULL,
  uploaded_by integer,
  uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: export_history
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
  status character varying(20) DEFAULT 'nuevo'::character varying
);

-- Table: exports
CREATE TABLE IF NOT EXISTS exports (
  id integer NOT NULL DEFAULT nextval('exports_id_seq'::regclass),
  export_type character varying(50) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_path character varying(500) NOT NULL,
  file_size bigint DEFAULT 0,
  status character varying(20) DEFAULT 'processing'::character varying,
  created_by integer,
  table_name character varying(100),
  parameters jsonb,
  record_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: funnel_metrics
CREATE TABLE IF NOT EXISTS funnel_metrics (
  id integer NOT NULL DEFAULT nextval('funnel_metrics_id_seq'::regclass),
  quote_id integer,
  quote_code character varying(50),
  category_main character varying(20) NOT NULL,
  service_name character varying(100) NOT NULL,
  item_name character varying(200) NOT NULL,
  item_total numeric NOT NULL,
  total_amount numeric NOT NULL,
  real_amount_paid numeric,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: funnel_metrics_view
CREATE TABLE IF NOT EXISTS funnel_metrics_view (
  approval_id integer,
  quote_id integer,
  quote_number character varying(100),
  total_amount numeric,
  subtotal numeric,
  igv numeric,
  approved_at timestamp without time zone,
  project_name character varying(150),
  company_name character varying(150),
  company_ruc character varying(20),
  requested_by_name character varying(100),
  approved_by_name character varying(100),
  subservice_id integer,
  service_name text,
  service_code character varying(20),
  service_price numeric,
  quantity integer,
  unit_price numeric,
  total_price numeric
);

-- Table: intelligent_quotes_metrics
CREATE TABLE IF NOT EXISTS intelligent_quotes_metrics (
  id integer,
  created_at timestamp without time zone,
  status character varying(30),
  total_amount numeric,
  categoria character varying(100),
  categoria_color character varying(7),
  subservicio character varying(200),
  base_price numeric,
  revenue numeric
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS invoices (
  id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
  project_id integer NOT NULL,
  quote_number character varying(50) NOT NULL,
  received_at date,
  payment_due date,
  payment_status character varying(20) NOT NULL DEFAULT 'pendiente'::character varying,
  amount numeric NOT NULL DEFAULT 0,
  created_by integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
  id integer NOT NULL DEFAULT nextval('leads_id_seq'::regclass),
  company_id integer,
  name character varying(150) NOT NULL,
  email character varying(100),
  phone character varying(30),
  status character varying(30) NOT NULL DEFAULT 'nuevo'::character varying,
  type character varying(30) NOT NULL DEFAULT 'nuevo'::character varying,
  assigned_to integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: monthly_goals
CREATE TABLE IF NOT EXISTS monthly_goals (
  id integer NOT NULL DEFAULT nextval('monthly_goals_id_seq'::regclass),
  year integer NOT NULL,
  month integer NOT NULL,
  created_by integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  updated_by integer,
  goal_quantity integer NOT NULL
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  recipient_id integer NOT NULL,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  data jsonb,
  priority character varying(20) DEFAULT 'normal'::character varying,
  read_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  sender_id integer,
  related_entity_type character varying(50),
  related_entity_id integer,
  channels jsonb DEFAULT '["database"]'::jsonb,
  status character varying(20) DEFAULT 'pending'::character varying,
  email_sent boolean DEFAULT false,
  email_sent_at timestamp without time zone,
  websocket_sent boolean DEFAULT false,
  websocket_sent_at timestamp without time zone
);

-- Table: payment_proofs
CREATE TABLE IF NOT EXISTS payment_proofs (
  id integer NOT NULL DEFAULT nextval('payment_proofs_id_seq'::regclass),
  quote_id integer NOT NULL,
  uploaded_by integer NOT NULL,
  approved_by integer,
  file_path character varying(500) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_type character varying(100) NOT NULL,
  file_size integer NOT NULL,
  description text,
  amount_paid numeric NOT NULL,
  payment_date date NOT NULL,
  payment_method character varying(100) NOT NULL,
  status character varying(50) NOT NULL DEFAULT 'pending'::character varying,
  approval_notes text,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  quote_file_path character varying(500),
  quote_file_name character varying(255),
  archived boolean DEFAULT false,
  archived_at timestamp without time zone,
  archived_by integer
);

-- Table: project_attachments
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
  file_url text
);

-- Table: project_categories
CREATE TABLE IF NOT EXISTS project_categories (
  id integer NOT NULL DEFAULT nextval('project_categories_id_seq'::regclass),
  name character varying(255) NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: project_evidence
CREATE TABLE IF NOT EXISTS project_evidence (
  id integer NOT NULL DEFAULT nextval('project_evidence_id_seq'::regclass),
  project_id integer,
  notes text,
  files jsonb,
  uploaded_by integer,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: project_files
CREATE TABLE IF NOT EXISTS project_files (
  id integer NOT NULL DEFAULT nextval('project_files_id_seq'::regclass),
  project_id integer,
  quote_id integer,
  tipo_archivo character varying(50),
  nombre_archivo character varying(255),
  ruta_archivo character varying(500),
  tamaño_archivo bigint,
  tipo_mime character varying(100),
  usuario_id integer,
  fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  version integer DEFAULT 1,
  es_activo boolean DEFAULT true
);

-- Table: project_history
CREATE TABLE IF NOT EXISTS project_history (
  id integer NOT NULL DEFAULT nextval('project_history_id_seq'::regclass),
  project_id integer NOT NULL,
  action character varying(100) NOT NULL,
  performed_by integer,
  performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text
);

-- Table: project_invoices
CREATE TABLE IF NOT EXISTS project_invoices (
  id integer NOT NULL DEFAULT nextval('project_invoices_id_seq'::regclass),
  project_id integer,
  invoice_number character varying(255) NOT NULL,
  invoice_date date NOT NULL,
  invoice_amount numeric NOT NULL,
  notes text,
  invoice_file jsonb,
  created_by integer,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: project_services
CREATE TABLE IF NOT EXISTS project_services (
  id integer NOT NULL DEFAULT nextval('project_services_id_seq'::regclass),
  project_id integer NOT NULL,
  subservice_id integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  provided_by integer,
  provided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: project_states
CREATE TABLE IF NOT EXISTS project_states (
  id integer NOT NULL DEFAULT nextval('project_states_id_seq'::regclass),
  project_id integer,
  estado_anterior character varying(50),
  estado_nuevo character varying(50),
  usuario_id integer,
  fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notas text
);

-- Table: project_subcategories
CREATE TABLE IF NOT EXISTS project_subcategories (
  id integer NOT NULL DEFAULT nextval('project_subcategories_id_seq'::regclass),
  category_id integer,
  name character varying(255) NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: projects
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
  estado character varying(50) DEFAULT 'borrador'::character varying,
  cotizacion_id integer,
  usuario_laboratorio_id integer,
  fecha_envio_laboratorio timestamp without time zone,
  fecha_completado_laboratorio timestamp without time zone,
  notas_laboratorio text,
  queries_history jsonb DEFAULT '[]'::jsonb
);

-- Table: quote_approvals
CREATE TABLE IF NOT EXISTS quote_approvals (
  id integer NOT NULL DEFAULT nextval('quote_approvals_id_seq'::regclass),
  quote_id integer NOT NULL,
  requested_by integer NOT NULL,
  approved_by integer,
  status character varying(20) NOT NULL DEFAULT 'sent'::character varying,
  request_data jsonb,
  approval_data jsonb,
  rejection_reason text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp without time zone,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: quote_categories
CREATE TABLE IF NOT EXISTS quote_categories (
  id integer NOT NULL DEFAULT nextval('quote_categories_id_seq'::regclass),
  name character varying(100) NOT NULL,
  description text,
  color character varying(7) DEFAULT '#4ECDC4'::character varying,
  icon character varying(50) DEFAULT 'category'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: quote_evidences
CREATE TABLE IF NOT EXISTS quote_evidences (
  id integer NOT NULL DEFAULT nextval('quote_evidences_id_seq'::regclass),
  quote_id integer NOT NULL,
  evidence_type USER-DEFINED NOT NULL,
  file_name character varying(255) NOT NULL,
  file_path character varying(500) NOT NULL,
  file_type character varying(100) NOT NULL,
  file_size integer,
  uploaded_by integer,
  uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text
);

-- Table: quote_items
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
  subservice_id integer,
  total_price numeric,
  name character varying(200),
  total numeric DEFAULT 0.00
);

-- Table: quote_sequences
CREATE TABLE IF NOT EXISTS quote_sequences (
  date_part character varying(6) NOT NULL,
  sequence integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: quote_subservices
CREATE TABLE IF NOT EXISTS quote_subservices (
  id integer NOT NULL DEFAULT nextval('quote_subservices_id_seq'::regclass),
  category_id integer,
  name character varying(200) NOT NULL,
  description text,
  base_price numeric DEFAULT 0.00,
  unit character varying(20) DEFAULT 'unidad'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: quote_variants
CREATE TABLE IF NOT EXISTS quote_variants (
  id integer NOT NULL DEFAULT nextval('quote_variants_id_seq'::regclass),
  code character varying(20) NOT NULL,
  title character varying(150) NOT NULL,
  description text,
  conditions jsonb,
  active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  image_url text
);

-- Table: quote_versions
CREATE TABLE IF NOT EXISTS quote_versions (
  id integer NOT NULL DEFAULT nextval('quote_versions_id_seq'::regclass),
  quote_id integer NOT NULL,
  version_number integer NOT NULL,
  data_snapshot jsonb NOT NULL,
  created_by integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_restoration boolean DEFAULT false
);

-- Table: quotes
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
  status character varying(30) DEFAULT 'nuevo'::character varying,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  reference_type jsonb,
  es_contrato boolean DEFAULT false,
  archivos_cotizacion jsonb,
  archivos_laboratorio jsonb,
  notas_vendedor text,
  notas_laboratorio text,
  cloned_from integer,
  quote_number character varying(100),
  payment_terms character varying(100),
  acceptance boolean DEFAULT false,
  total_amount numeric,
  payment_status character varying(50) DEFAULT 'Pendiente'::character varying,
  payment_date date,
  payment_method character varying(100),
  payment_amount numeric,
  category_id integer,
  subservice_id integer,
  is_intelligent boolean DEFAULT false,
  category_main character varying(20) DEFAULT 'laboratorio'::character varying,
  quote_code character varying(50),
  status_payment character varying(50) DEFAULT 'pendiente'::character varying,
  client_company character varying(255),
  client_ruc character varying(20),
  project_location character varying(255),
  project_name character varying(255),
  request_date date
);

-- Table: services
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
  price numeric DEFAULT 0
);

-- Table: shipment_status
CREATE TABLE IF NOT EXISTS shipment_status (
  id integer NOT NULL DEFAULT nextval('shipment_status_id_seq'::regclass),
  shipment_id integer,
  status character varying(50) NOT NULL,
  notes text,
  files jsonb,
  changed_by integer,
  changed_at timestamp without time zone DEFAULT now()
);

-- Table: shipments
CREATE TABLE IF NOT EXISTS shipments (
  id integer NOT NULL DEFAULT nextval('shipments_id_seq'::regclass),
  project_id integer,
  status character varying(50) DEFAULT 'enviado'::character varying,
  sent_by integer,
  received_by integer,
  notes text,
  files jsonb,
  sent_at timestamp without time zone DEFAULT now(),
  received_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id integer NOT NULL DEFAULT nextval('subcategories_id_seq'::regclass),
  category_id integer NOT NULL,
  name character varying(100) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: subservices
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
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: templates
CREATE TABLE IF NOT EXISTS templates (
  id integer NOT NULL DEFAULT nextval('templates_id_seq'::regclass),
  name character varying(255) NOT NULL,
  client_id integer,
  description text,
  services jsonb,
  created_by integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: ticket_comments
CREATE TABLE IF NOT EXISTS ticket_comments (
  id integer NOT NULL DEFAULT nextval('ticket_comments_id_seq'::regclass),
  ticket_id integer NOT NULL,
  user_id integer NOT NULL,
  comment text NOT NULL,
  is_system boolean DEFAULT false,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: ticket_history
CREATE TABLE IF NOT EXISTS ticket_history (
  id integer NOT NULL DEFAULT nextval('ticket_history_id_seq'::regclass),
  ticket_id integer NOT NULL,
  action character varying(100) NOT NULL,
  performed_by integer,
  performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text
);

-- Table: ticket_notifications
CREATE TABLE IF NOT EXISTS ticket_notifications (
  id integer NOT NULL DEFAULT nextval('ticket_notifications_id_seq'::regclass),
  ticket_id integer NOT NULL,
  user_id integer NOT NULL,
  type character varying(50) NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: tickets
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
  module character varying(50),
  category character varying(50),
  type character varying(50),
  assigned_to integer,
  estimated_time character varying(100),
  tags text,
  additional_notes text,
  actual_time integer,
  notes text,
  attachment_name character varying(255),
  closed_at timestamp without time zone,
  created_by integer
);

-- Table: uploads
CREATE TABLE IF NOT EXISTS uploads (
  id integer NOT NULL DEFAULT nextval('uploads_id_seq'::regclass),
  original_name character varying(255) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_path character varying(500) NOT NULL,
  file_size bigint DEFAULT 0,
  file_type character varying(50),
  table_name character varying(100),
  record_id integer,
  uploaded_by integer,
  status character varying(20) DEFAULT 'active'::character varying,
  download_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
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
  active boolean DEFAULT true,
  phone character varying(20)
);

-- ==============================================
-- TABLE DATA
-- ==============================================

-- No data for table: activities

-- Data for table: audit_cleanup_log
INSERT INTO audit_cleanup_log (id, cleanup_date, hours_threshold, deleted_count, total_before, total_after, executed_by, notes) VALUES
  (1, '2025-09-25T21:08:03.582Z', 24, 0, 0, 0, NULL, 'Sistema inicializado - Sin limpiezas previas'),
  (2, '2025-09-25T21:09:03.365Z', 24, 0, 12, 12, NULL, 'Limpieza de prueba ejecutada'),
  (3, '2025-09-25T21:09:58.286Z', 24, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (4, '2025-09-25T21:09:59.143Z', 168, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (5, '2025-09-25T21:09:59.698Z', 720, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (6, '2025-09-25T21:10:01.257Z', 24, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (7, '2025-09-25T21:14:47.870Z', 24, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (8, '2025-09-25T21:14:48.622Z', 168, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (9, '2025-09-25T21:14:50.051Z', 720, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (10, '2025-09-25T21:26:47.828Z', 24, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados'),
  (11, '2025-09-25T22:56:17.936Z', 24, 0, 12, 12, 6, 'Limpieza automática ejecutada - 0 registros eliminados');

-- No data for table: audit_log

-- No data for table: audit_quotes

-- Data for table: categories
INSERT INTO categories (id, name, created_at, description, is_active, updated_at) VALUES
  (2, 'LABORATORIO', '2025-09-25T13:33:09.253Z', 'Servicios de laboratorio de materiales', true, '2025-09-25T13:33:09.253Z');

-- No data for table: client_comments

-- No data for table: companies

-- No data for table: evidences

-- No data for table: export_history

-- No data for table: exports

-- No data for table: funnel_metrics

-- No data for table: funnel_metrics_view

-- No data for table: intelligent_quotes_metrics

-- No data for table: invoices

-- No data for table: leads

-- No data for table: monthly_goals

-- Data for table: notifications
INSERT INTO notifications (id, recipient_id, type, title, message, data, priority, read_at, created_at, updated_at, sender_id, related_entity_type, related_entity_id, channels, status, email_sent, email_sent_at, websocket_sent, websocket_sent_at) VALUES
  (2, 1007, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T20:19:47.758Z', '2025-09-29T20:19:47.758Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (4, 1011, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T20:19:49.426Z', '2025-09-29T20:19:49.426Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (6, 1007, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T20:52:31.195Z', '2025-09-29T20:52:31.195Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (8, 1011, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T20:52:33.244Z', '2025-09-29T20:52:33.244Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (12, 7, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.329Z', '2025-09-29T21:32:20.329Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (13, 13, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.330Z', '2025-09-29T21:32:20.330Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (14, 19, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.331Z', '2025-09-29T21:32:20.331Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (15, 25, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.331Z', '2025-09-29T21:32:20.331Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (16, 31, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.332Z', '2025-09-29T21:32:20.332Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (17, 37, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.332Z', '2025-09-29T21:32:20.332Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (18, 43, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.333Z', '2025-09-29T21:32:20.333Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (19, 49, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.334Z', '2025-09-29T21:32:20.334Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (20, 55, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.334Z', '2025-09-29T21:32:20.334Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (21, 61, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.335Z', '2025-09-29T21:32:20.335Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (22, 67, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.335Z', '2025-09-29T21:32:20.335Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (10, 1008, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', '2025-09-29T21:51:03.203Z', '2025-09-29T21:32:20.325Z', '2025-09-29T21:32:20.325Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (9, 1008, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no funciona el pago', [object Object], 'high', '2025-09-29T21:51:05.573Z', '2025-09-29T20:53:53.029Z', '2025-09-29T20:53:53.029Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (23, 73, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.336Z', '2025-09-29T21:32:20.336Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (24, 79, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.337Z', '2025-09-29T21:32:20.337Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (25, 85, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.337Z', '2025-09-29T21:32:20.337Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (26, 91, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.338Z', '2025-09-29T21:32:20.338Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (27, 97, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.338Z', '2025-09-29T21:32:20.338Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (28, 103, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.338Z', '2025-09-29T21:32:20.338Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (29, 109, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.339Z', '2025-09-29T21:32:20.339Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (30, 115, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.339Z', '2025-09-29T21:32:20.339Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (31, 121, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.339Z', '2025-09-29T21:32:20.339Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (32, 127, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.340Z', '2025-09-29T21:32:20.340Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (33, 133, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.340Z', '2025-09-29T21:32:20.340Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (34, 139, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.341Z', '2025-09-29T21:32:20.341Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (35, 145, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.342Z', '2025-09-29T21:32:20.342Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (36, 151, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.343Z', '2025-09-29T21:32:20.343Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (37, 157, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.343Z', '2025-09-29T21:32:20.343Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (38, 163, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.344Z', '2025-09-29T21:32:20.344Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (39, 169, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.344Z', '2025-09-29T21:32:20.344Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (40, 175, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.345Z', '2025-09-29T21:32:20.345Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (41, 181, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.345Z', '2025-09-29T21:32:20.345Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (42, 187, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.346Z', '2025-09-29T21:32:20.346Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (43, 193, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.346Z', '2025-09-29T21:32:20.346Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (44, 199, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.347Z', '2025-09-29T21:32:20.347Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (45, 205, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.347Z', '2025-09-29T21:32:20.347Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (46, 211, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.349Z', '2025-09-29T21:32:20.349Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (47, 217, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.350Z', '2025-09-29T21:32:20.350Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (48, 223, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.350Z', '2025-09-29T21:32:20.350Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (49, 229, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.351Z', '2025-09-29T21:32:20.351Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (50, 235, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.351Z', '2025-09-29T21:32:20.351Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (51, 241, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.352Z', '2025-09-29T21:32:20.352Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (52, 247, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.352Z', '2025-09-29T21:32:20.352Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (53, 253, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.353Z', '2025-09-29T21:32:20.353Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (54, 259, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.353Z', '2025-09-29T21:32:20.353Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (55, 265, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.353Z', '2025-09-29T21:32:20.353Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (56, 271, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.354Z', '2025-09-29T21:32:20.354Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (57, 277, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.355Z', '2025-09-29T21:32:20.355Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (58, 283, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.355Z', '2025-09-29T21:32:20.355Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (59, 289, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.356Z', '2025-09-29T21:32:20.356Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (60, 295, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.356Z', '2025-09-29T21:32:20.356Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (61, 301, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.357Z', '2025-09-29T21:32:20.357Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (62, 307, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.357Z', '2025-09-29T21:32:20.357Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (63, 313, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.357Z', '2025-09-29T21:32:20.357Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (64, 319, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.358Z', '2025-09-29T21:32:20.358Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (65, 325, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.358Z', '2025-09-29T21:32:20.358Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (66, 331, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.359Z', '2025-09-29T21:32:20.359Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (67, 337, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.359Z', '2025-09-29T21:32:20.359Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (68, 343, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.360Z', '2025-09-29T21:32:20.360Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (69, 349, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.360Z', '2025-09-29T21:32:20.360Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (70, 355, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.360Z', '2025-09-29T21:32:20.360Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (71, 361, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.361Z', '2025-09-29T21:32:20.361Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (72, 367, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.361Z', '2025-09-29T21:32:20.361Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (73, 373, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.362Z', '2025-09-29T21:32:20.362Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (74, 379, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.363Z', '2025-09-29T21:32:20.363Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (75, 385, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.363Z', '2025-09-29T21:32:20.363Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (76, 391, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.364Z', '2025-09-29T21:32:20.364Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (77, 397, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.364Z', '2025-09-29T21:32:20.364Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (78, 403, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.365Z', '2025-09-29T21:32:20.365Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (79, 409, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.365Z', '2025-09-29T21:32:20.365Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (80, 415, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.366Z', '2025-09-29T21:32:20.366Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (81, 421, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.366Z', '2025-09-29T21:32:20.366Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (82, 427, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.367Z', '2025-09-29T21:32:20.367Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (83, 433, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.367Z', '2025-09-29T21:32:20.367Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (84, 439, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.367Z', '2025-09-29T21:32:20.367Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (85, 445, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.368Z', '2025-09-29T21:32:20.368Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (86, 451, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.368Z', '2025-09-29T21:32:20.368Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (87, 457, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.369Z', '2025-09-29T21:32:20.369Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (88, 463, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.369Z', '2025-09-29T21:32:20.369Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (89, 469, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.370Z', '2025-09-29T21:32:20.370Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (90, 475, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.371Z', '2025-09-29T21:32:20.371Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (91, 481, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.371Z', '2025-09-29T21:32:20.371Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (92, 487, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.371Z', '2025-09-29T21:32:20.371Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (93, 493, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.372Z', '2025-09-29T21:32:20.372Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (94, 499, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.372Z', '2025-09-29T21:32:20.372Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (95, 505, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.372Z', '2025-09-29T21:32:20.372Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (96, 511, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.373Z', '2025-09-29T21:32:20.373Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (97, 517, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.373Z', '2025-09-29T21:32:20.373Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (98, 523, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.373Z', '2025-09-29T21:32:20.373Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (99, 529, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.374Z', '2025-09-29T21:32:20.374Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (100, 535, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.374Z', '2025-09-29T21:32:20.374Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (101, 541, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.375Z', '2025-09-29T21:32:20.375Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (102, 547, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.375Z', '2025-09-29T21:32:20.375Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (103, 553, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.376Z', '2025-09-29T21:32:20.376Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (104, 559, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.376Z', '2025-09-29T21:32:20.376Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (105, 565, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.377Z', '2025-09-29T21:32:20.377Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (106, 571, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.377Z', '2025-09-29T21:32:20.377Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (107, 577, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.378Z', '2025-09-29T21:32:20.378Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (108, 583, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.378Z', '2025-09-29T21:32:20.378Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (109, 589, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.378Z', '2025-09-29T21:32:20.378Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (110, 595, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.379Z', '2025-09-29T21:32:20.379Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (111, 601, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.379Z', '2025-09-29T21:32:20.379Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (112, 607, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.379Z', '2025-09-29T21:32:20.379Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (113, 613, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.379Z', '2025-09-29T21:32:20.379Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (114, 619, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.380Z', '2025-09-29T21:32:20.380Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (115, 625, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.380Z', '2025-09-29T21:32:20.380Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (116, 631, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.380Z', '2025-09-29T21:32:20.380Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (117, 637, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.381Z', '2025-09-29T21:32:20.381Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (118, 643, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.381Z', '2025-09-29T21:32:20.381Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (119, 649, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.382Z', '2025-09-29T21:32:20.382Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (120, 655, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.382Z', '2025-09-29T21:32:20.382Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (121, 661, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.383Z', '2025-09-29T21:32:20.383Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (122, 667, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.383Z', '2025-09-29T21:32:20.383Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (123, 673, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.384Z', '2025-09-29T21:32:20.384Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (124, 679, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.384Z', '2025-09-29T21:32:20.384Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (125, 685, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.384Z', '2025-09-29T21:32:20.384Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (126, 691, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.385Z', '2025-09-29T21:32:20.385Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (127, 697, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.385Z', '2025-09-29T21:32:20.385Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (128, 703, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.385Z', '2025-09-29T21:32:20.385Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (129, 709, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.386Z', '2025-09-29T21:32:20.386Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (130, 715, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.386Z', '2025-09-29T21:32:20.386Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (131, 721, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.386Z', '2025-09-29T21:32:20.386Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (132, 727, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.386Z', '2025-09-29T21:32:20.386Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (133, 733, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.387Z', '2025-09-29T21:32:20.387Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (134, 739, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.387Z', '2025-09-29T21:32:20.387Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (135, 745, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.388Z', '2025-09-29T21:32:20.388Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (136, 751, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.388Z', '2025-09-29T21:32:20.388Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (137, 757, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.388Z', '2025-09-29T21:32:20.388Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (138, 763, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.389Z', '2025-09-29T21:32:20.389Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (139, 769, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.390Z', '2025-09-29T21:32:20.390Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (140, 775, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.390Z', '2025-09-29T21:32:20.390Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (141, 781, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.391Z', '2025-09-29T21:32:20.391Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (142, 787, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.391Z', '2025-09-29T21:32:20.391Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (143, 793, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.392Z', '2025-09-29T21:32:20.392Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (144, 799, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.392Z', '2025-09-29T21:32:20.392Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (145, 805, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.392Z', '2025-09-29T21:32:20.392Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (146, 811, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.393Z', '2025-09-29T21:32:20.393Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (147, 817, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.393Z', '2025-09-29T21:32:20.393Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (148, 823, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.393Z', '2025-09-29T21:32:20.393Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (149, 829, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.394Z', '2025-09-29T21:32:20.394Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (150, 835, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.394Z', '2025-09-29T21:32:20.394Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (151, 841, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.394Z', '2025-09-29T21:32:20.394Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (152, 847, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.394Z', '2025-09-29T21:32:20.394Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (153, 853, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.395Z', '2025-09-29T21:32:20.395Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (154, 859, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.395Z', '2025-09-29T21:32:20.395Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (155, 865, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.395Z', '2025-09-29T21:32:20.395Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (156, 871, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.396Z', '2025-09-29T21:32:20.396Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (157, 877, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.396Z', '2025-09-29T21:32:20.396Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (158, 883, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.397Z', '2025-09-29T21:32:20.397Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (159, 889, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.397Z', '2025-09-29T21:32:20.397Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (160, 895, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.398Z', '2025-09-29T21:32:20.398Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (161, 901, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.398Z', '2025-09-29T21:32:20.398Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (162, 907, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.399Z', '2025-09-29T21:32:20.399Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (163, 913, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.399Z', '2025-09-29T21:32:20.399Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (164, 919, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.400Z', '2025-09-29T21:32:20.400Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (165, 925, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.400Z', '2025-09-29T21:32:20.400Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (166, 931, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.400Z', '2025-09-29T21:32:20.400Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (167, 937, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.401Z', '2025-09-29T21:32:20.401Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (168, 943, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.402Z', '2025-09-29T21:32:20.402Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (169, 949, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.402Z', '2025-09-29T21:32:20.402Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (170, 955, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.403Z', '2025-09-29T21:32:20.403Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (171, 961, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.404Z', '2025-09-29T21:32:20.404Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (172, 967, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.405Z', '2025-09-29T21:32:20.405Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (173, 973, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.405Z', '2025-09-29T21:32:20.405Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (174, 979, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.406Z', '2025-09-29T21:32:20.406Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (175, 985, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.406Z', '2025-09-29T21:32:20.406Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (176, 991, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.406Z', '2025-09-29T21:32:20.406Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (178, 1003, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.407Z', '2025-09-29T21:32:20.407Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (179, 1007, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T21:32:20.407Z', '2025-09-29T21:32:20.407Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (183, 7, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.411Z', '2025-09-29T21:32:20.411Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (184, 13, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.412Z', '2025-09-29T21:32:20.412Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (185, 19, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.412Z', '2025-09-29T21:32:20.412Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (186, 25, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.413Z', '2025-09-29T21:32:20.413Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (187, 31, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.413Z', '2025-09-29T21:32:20.413Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (188, 37, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.414Z', '2025-09-29T21:32:20.414Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (189, 43, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.414Z', '2025-09-29T21:32:20.414Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (190, 49, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.414Z', '2025-09-29T21:32:20.414Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (191, 55, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.415Z', '2025-09-29T21:32:20.415Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (192, 61, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.415Z', '2025-09-29T21:32:20.415Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (193, 67, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.416Z', '2025-09-29T21:32:20.416Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (194, 73, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.416Z', '2025-09-29T21:32:20.416Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (195, 79, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.417Z', '2025-09-29T21:32:20.417Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (196, 85, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.418Z', '2025-09-29T21:32:20.418Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (181, 1008, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', '2025-09-29T21:50:47.876Z', '2025-09-29T21:32:20.409Z', '2025-09-29T21:32:20.409Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (197, 91, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.418Z', '2025-09-29T21:32:20.418Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (198, 97, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.419Z', '2025-09-29T21:32:20.419Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (199, 103, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.419Z', '2025-09-29T21:32:20.419Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (200, 109, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.419Z', '2025-09-29T21:32:20.419Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (201, 115, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.420Z', '2025-09-29T21:32:20.420Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (202, 121, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.420Z', '2025-09-29T21:32:20.420Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (203, 127, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.420Z', '2025-09-29T21:32:20.420Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (204, 133, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.421Z', '2025-09-29T21:32:20.421Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (205, 139, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.421Z', '2025-09-29T21:32:20.421Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (206, 145, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.421Z', '2025-09-29T21:32:20.421Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (207, 151, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.421Z', '2025-09-29T21:32:20.421Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (208, 157, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.422Z', '2025-09-29T21:32:20.422Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (209, 163, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.422Z', '2025-09-29T21:32:20.422Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (210, 169, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.422Z', '2025-09-29T21:32:20.422Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (211, 175, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.423Z', '2025-09-29T21:32:20.423Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (212, 181, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.423Z', '2025-09-29T21:32:20.423Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (213, 187, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.423Z', '2025-09-29T21:32:20.423Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (214, 193, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.424Z', '2025-09-29T21:32:20.424Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (215, 199, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.425Z', '2025-09-29T21:32:20.425Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (216, 205, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.426Z', '2025-09-29T21:32:20.426Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (217, 211, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.426Z', '2025-09-29T21:32:20.426Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (218, 217, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.427Z', '2025-09-29T21:32:20.427Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (219, 223, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.427Z', '2025-09-29T21:32:20.427Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (220, 229, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.428Z', '2025-09-29T21:32:20.428Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (221, 235, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.428Z', '2025-09-29T21:32:20.428Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (222, 241, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.428Z', '2025-09-29T21:32:20.428Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (223, 247, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.429Z', '2025-09-29T21:32:20.429Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (224, 253, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.429Z', '2025-09-29T21:32:20.429Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (225, 259, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.429Z', '2025-09-29T21:32:20.429Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (226, 265, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.430Z', '2025-09-29T21:32:20.430Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (227, 271, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.430Z', '2025-09-29T21:32:20.430Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (228, 277, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.431Z', '2025-09-29T21:32:20.431Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (229, 283, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.431Z', '2025-09-29T21:32:20.431Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (230, 289, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.432Z', '2025-09-29T21:32:20.432Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (231, 295, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.432Z', '2025-09-29T21:32:20.432Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (232, 301, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.433Z', '2025-09-29T21:32:20.433Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (233, 307, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.433Z', '2025-09-29T21:32:20.433Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (234, 313, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.433Z', '2025-09-29T21:32:20.433Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (235, 319, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.434Z', '2025-09-29T21:32:20.434Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (236, 325, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.434Z', '2025-09-29T21:32:20.434Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (237, 331, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.434Z', '2025-09-29T21:32:20.434Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (238, 337, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.435Z', '2025-09-29T21:32:20.435Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (239, 343, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.435Z', '2025-09-29T21:32:20.435Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (240, 349, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.435Z', '2025-09-29T21:32:20.435Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (241, 355, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.436Z', '2025-09-29T21:32:20.436Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (242, 361, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.436Z', '2025-09-29T21:32:20.436Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (243, 367, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.436Z', '2025-09-29T21:32:20.436Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (244, 373, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.437Z', '2025-09-29T21:32:20.437Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (245, 379, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.437Z', '2025-09-29T21:32:20.437Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (246, 385, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.438Z', '2025-09-29T21:32:20.438Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (247, 391, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.438Z', '2025-09-29T21:32:20.438Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (248, 397, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.439Z', '2025-09-29T21:32:20.439Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (249, 403, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.439Z', '2025-09-29T21:32:20.439Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (250, 409, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.440Z', '2025-09-29T21:32:20.440Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (251, 415, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.440Z', '2025-09-29T21:32:20.440Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (252, 421, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.441Z', '2025-09-29T21:32:20.441Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (253, 427, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.441Z', '2025-09-29T21:32:20.441Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (254, 433, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.441Z', '2025-09-29T21:32:20.441Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (255, 439, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.442Z', '2025-09-29T21:32:20.442Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (256, 445, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.442Z', '2025-09-29T21:32:20.442Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (257, 451, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.442Z', '2025-09-29T21:32:20.442Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (258, 457, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.443Z', '2025-09-29T21:32:20.443Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (259, 463, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.443Z', '2025-09-29T21:32:20.443Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (260, 469, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.443Z', '2025-09-29T21:32:20.443Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (261, 475, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.444Z', '2025-09-29T21:32:20.444Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (262, 481, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.444Z', '2025-09-29T21:32:20.444Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (263, 487, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.445Z', '2025-09-29T21:32:20.445Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (264, 493, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.445Z', '2025-09-29T21:32:20.445Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (265, 499, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.446Z', '2025-09-29T21:32:20.446Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (266, 505, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.446Z', '2025-09-29T21:32:20.446Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (267, 511, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.447Z', '2025-09-29T21:32:20.447Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (268, 517, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.447Z', '2025-09-29T21:32:20.447Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (269, 523, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.447Z', '2025-09-29T21:32:20.447Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (270, 529, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.448Z', '2025-09-29T21:32:20.448Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (271, 535, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.448Z', '2025-09-29T21:32:20.448Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (272, 541, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.449Z', '2025-09-29T21:32:20.449Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (273, 547, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.449Z', '2025-09-29T21:32:20.449Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (274, 553, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.449Z', '2025-09-29T21:32:20.449Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (275, 559, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.450Z', '2025-09-29T21:32:20.450Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (276, 565, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.450Z', '2025-09-29T21:32:20.450Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (277, 571, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.450Z', '2025-09-29T21:32:20.450Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (278, 577, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.450Z', '2025-09-29T21:32:20.450Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (279, 583, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.451Z', '2025-09-29T21:32:20.451Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (280, 589, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.451Z', '2025-09-29T21:32:20.451Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (281, 595, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.452Z', '2025-09-29T21:32:20.452Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (282, 601, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.453Z', '2025-09-29T21:32:20.453Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (283, 607, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.453Z', '2025-09-29T21:32:20.453Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (284, 613, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.454Z', '2025-09-29T21:32:20.454Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (285, 619, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.454Z', '2025-09-29T21:32:20.454Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (286, 625, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.455Z', '2025-09-29T21:32:20.455Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (287, 631, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.455Z', '2025-09-29T21:32:20.455Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (288, 637, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.455Z', '2025-09-29T21:32:20.455Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (289, 643, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.456Z', '2025-09-29T21:32:20.456Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (290, 649, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.456Z', '2025-09-29T21:32:20.456Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (291, 655, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.457Z', '2025-09-29T21:32:20.457Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (292, 661, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.457Z', '2025-09-29T21:32:20.457Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (293, 667, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.457Z', '2025-09-29T21:32:20.457Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (294, 673, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.458Z', '2025-09-29T21:32:20.458Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (295, 679, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.458Z', '2025-09-29T21:32:20.458Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (296, 685, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.459Z', '2025-09-29T21:32:20.459Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (297, 691, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.459Z', '2025-09-29T21:32:20.459Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (298, 697, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.460Z', '2025-09-29T21:32:20.460Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (299, 703, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.460Z', '2025-09-29T21:32:20.460Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (300, 709, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.461Z', '2025-09-29T21:32:20.461Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (301, 715, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.461Z', '2025-09-29T21:32:20.461Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (302, 721, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.461Z', '2025-09-29T21:32:20.461Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (303, 727, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.462Z', '2025-09-29T21:32:20.462Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (304, 733, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.462Z', '2025-09-29T21:32:20.462Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (305, 739, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.462Z', '2025-09-29T21:32:20.462Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (306, 745, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.463Z', '2025-09-29T21:32:20.463Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (307, 751, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.463Z', '2025-09-29T21:32:20.463Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (308, 757, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.463Z', '2025-09-29T21:32:20.463Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (309, 763, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.463Z', '2025-09-29T21:32:20.463Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (310, 769, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.464Z', '2025-09-29T21:32:20.464Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (311, 775, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.464Z', '2025-09-29T21:32:20.464Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (312, 781, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.464Z', '2025-09-29T21:32:20.464Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (313, 787, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.464Z', '2025-09-29T21:32:20.464Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (314, 793, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.465Z', '2025-09-29T21:32:20.465Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (315, 799, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.465Z', '2025-09-29T21:32:20.465Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (316, 805, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.466Z', '2025-09-29T21:32:20.466Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (317, 811, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.466Z', '2025-09-29T21:32:20.466Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (318, 817, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.467Z', '2025-09-29T21:32:20.467Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (319, 823, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.467Z', '2025-09-29T21:32:20.467Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (320, 829, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.468Z', '2025-09-29T21:32:20.468Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (321, 835, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.468Z', '2025-09-29T21:32:20.468Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (322, 841, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.468Z', '2025-09-29T21:32:20.468Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (323, 847, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.469Z', '2025-09-29T21:32:20.469Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (324, 853, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.469Z', '2025-09-29T21:32:20.469Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (325, 859, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.469Z', '2025-09-29T21:32:20.469Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (326, 865, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.470Z', '2025-09-29T21:32:20.470Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (327, 871, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.470Z', '2025-09-29T21:32:20.470Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (328, 877, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.470Z', '2025-09-29T21:32:20.470Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (329, 883, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.471Z', '2025-09-29T21:32:20.471Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (330, 889, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.471Z', '2025-09-29T21:32:20.471Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (331, 895, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.472Z', '2025-09-29T21:32:20.472Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (332, 901, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.472Z', '2025-09-29T21:32:20.472Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (333, 907, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.473Z', '2025-09-29T21:32:20.473Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (334, 913, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.473Z', '2025-09-29T21:32:20.473Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (335, 919, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.474Z', '2025-09-29T21:32:20.474Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (336, 925, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.474Z', '2025-09-29T21:32:20.474Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (337, 931, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.475Z', '2025-09-29T21:32:20.475Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (338, 937, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.475Z', '2025-09-29T21:32:20.475Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (339, 943, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.476Z', '2025-09-29T21:32:20.476Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (340, 949, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.476Z', '2025-09-29T21:32:20.476Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (341, 955, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.476Z', '2025-09-29T21:32:20.476Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (342, 961, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.477Z', '2025-09-29T21:32:20.477Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (343, 967, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.477Z', '2025-09-29T21:32:20.477Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (344, 973, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.478Z', '2025-09-29T21:32:20.478Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (345, 979, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.479Z', '2025-09-29T21:32:20.479Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (346, 985, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.479Z', '2025-09-29T21:32:20.479Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (347, 991, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.480Z', '2025-09-29T21:32:20.480Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (349, 1003, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.481Z', '2025-09-29T21:32:20.481Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (350, 1007, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: Documento no válido', [object Object], 'high', NULL, '2025-09-29T21:32:20.481Z', '2025-09-29T21:32:20.481Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (354, 7, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.873Z', '2025-09-29T21:32:49.873Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (355, 13, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.874Z', '2025-09-29T21:32:49.874Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (356, 19, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.874Z', '2025-09-29T21:32:49.874Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (357, 25, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.874Z', '2025-09-29T21:32:49.874Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (358, 31, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.875Z', '2025-09-29T21:32:49.875Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (359, 37, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.875Z', '2025-09-29T21:32:49.875Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (360, 43, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.876Z', '2025-09-29T21:32:49.876Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (361, 49, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.876Z', '2025-09-29T21:32:49.876Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (362, 55, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.877Z', '2025-09-29T21:32:49.877Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (363, 61, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.878Z', '2025-09-29T21:32:49.878Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (364, 67, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.878Z', '2025-09-29T21:32:49.878Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (365, 73, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.879Z', '2025-09-29T21:32:49.879Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (366, 79, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.880Z', '2025-09-29T21:32:49.880Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (367, 85, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.881Z', '2025-09-29T21:32:49.881Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (368, 91, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.881Z', '2025-09-29T21:32:49.881Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (369, 97, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.882Z', '2025-09-29T21:32:49.882Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (352, 1008, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', '2025-09-29T21:50:38.261Z', '2025-09-29T21:32:49.869Z', '2025-09-29T21:32:49.869Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (370, 103, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.882Z', '2025-09-29T21:32:49.882Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (371, 109, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.883Z', '2025-09-29T21:32:49.883Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (372, 115, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.884Z', '2025-09-29T21:32:49.884Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (373, 121, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.885Z', '2025-09-29T21:32:49.885Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (374, 127, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.885Z', '2025-09-29T21:32:49.885Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (375, 133, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.886Z', '2025-09-29T21:32:49.886Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (376, 139, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.887Z', '2025-09-29T21:32:49.887Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (377, 145, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.887Z', '2025-09-29T21:32:49.887Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (378, 151, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.888Z', '2025-09-29T21:32:49.888Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (379, 157, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.888Z', '2025-09-29T21:32:49.888Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (380, 163, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.889Z', '2025-09-29T21:32:49.889Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (381, 169, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.889Z', '2025-09-29T21:32:49.889Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (382, 175, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.890Z', '2025-09-29T21:32:49.890Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (383, 181, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.890Z', '2025-09-29T21:32:49.890Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (384, 187, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.890Z', '2025-09-29T21:32:49.890Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (385, 193, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.891Z', '2025-09-29T21:32:49.891Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (386, 199, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.891Z', '2025-09-29T21:32:49.891Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (387, 205, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.892Z', '2025-09-29T21:32:49.892Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (388, 211, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.892Z', '2025-09-29T21:32:49.892Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (389, 217, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.893Z', '2025-09-29T21:32:49.893Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (390, 223, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.893Z', '2025-09-29T21:32:49.893Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (391, 229, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.894Z', '2025-09-29T21:32:49.894Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (392, 235, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.894Z', '2025-09-29T21:32:49.894Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (393, 241, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.895Z', '2025-09-29T21:32:49.895Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (394, 247, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.895Z', '2025-09-29T21:32:49.895Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (395, 253, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.895Z', '2025-09-29T21:32:49.895Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (396, 259, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.896Z', '2025-09-29T21:32:49.896Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (397, 265, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.896Z', '2025-09-29T21:32:49.896Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (398, 271, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.897Z', '2025-09-29T21:32:49.897Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (399, 277, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.897Z', '2025-09-29T21:32:49.897Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (400, 283, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.898Z', '2025-09-29T21:32:49.898Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (401, 289, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.898Z', '2025-09-29T21:32:49.898Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (402, 295, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.899Z', '2025-09-29T21:32:49.899Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (403, 301, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.899Z', '2025-09-29T21:32:49.899Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (404, 307, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.900Z', '2025-09-29T21:32:49.900Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (405, 313, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.900Z', '2025-09-29T21:32:49.900Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (406, 319, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.901Z', '2025-09-29T21:32:49.901Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (407, 325, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.901Z', '2025-09-29T21:32:49.901Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (408, 331, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.901Z', '2025-09-29T21:32:49.901Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (409, 337, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.903Z', '2025-09-29T21:32:49.903Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (410, 343, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.904Z', '2025-09-29T21:32:49.904Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (411, 349, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.904Z', '2025-09-29T21:32:49.904Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (412, 355, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.905Z', '2025-09-29T21:32:49.905Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (413, 361, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.905Z', '2025-09-29T21:32:49.905Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (414, 367, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.906Z', '2025-09-29T21:32:49.906Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (415, 373, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.906Z', '2025-09-29T21:32:49.906Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (416, 379, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.907Z', '2025-09-29T21:32:49.907Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (417, 385, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.907Z', '2025-09-29T21:32:49.907Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (418, 391, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.907Z', '2025-09-29T21:32:49.907Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (419, 397, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.908Z', '2025-09-29T21:32:49.908Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (420, 403, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.909Z', '2025-09-29T21:32:49.909Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (421, 409, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.909Z', '2025-09-29T21:32:49.909Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (422, 415, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.909Z', '2025-09-29T21:32:49.909Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (423, 421, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.910Z', '2025-09-29T21:32:49.910Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (424, 427, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.910Z', '2025-09-29T21:32:49.910Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (425, 433, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.910Z', '2025-09-29T21:32:49.910Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (426, 439, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.911Z', '2025-09-29T21:32:49.911Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (427, 445, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.911Z', '2025-09-29T21:32:49.911Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (428, 451, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.911Z', '2025-09-29T21:32:49.911Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (429, 457, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.912Z', '2025-09-29T21:32:49.912Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (430, 463, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.912Z', '2025-09-29T21:32:49.912Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (431, 469, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.913Z', '2025-09-29T21:32:49.913Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (432, 475, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.914Z', '2025-09-29T21:32:49.914Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (433, 481, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.914Z', '2025-09-29T21:32:49.914Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (434, 487, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.915Z', '2025-09-29T21:32:49.915Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (435, 493, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.915Z', '2025-09-29T21:32:49.915Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (436, 499, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.915Z', '2025-09-29T21:32:49.915Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (437, 505, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.915Z', '2025-09-29T21:32:49.915Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (438, 511, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.916Z', '2025-09-29T21:32:49.916Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (439, 517, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.916Z', '2025-09-29T21:32:49.916Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (440, 523, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.916Z', '2025-09-29T21:32:49.916Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (441, 529, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.917Z', '2025-09-29T21:32:49.917Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (442, 535, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.917Z', '2025-09-29T21:32:49.917Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (443, 541, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.917Z', '2025-09-29T21:32:49.917Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (444, 547, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.918Z', '2025-09-29T21:32:49.918Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (445, 553, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.918Z', '2025-09-29T21:32:49.918Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (446, 559, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.918Z', '2025-09-29T21:32:49.918Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (447, 565, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.919Z', '2025-09-29T21:32:49.919Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (448, 571, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.919Z', '2025-09-29T21:32:49.919Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (449, 577, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.920Z', '2025-09-29T21:32:49.920Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (450, 583, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.920Z', '2025-09-29T21:32:49.920Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (451, 589, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.921Z', '2025-09-29T21:32:49.921Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (452, 595, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.921Z', '2025-09-29T21:32:49.921Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (453, 601, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.922Z', '2025-09-29T21:32:49.922Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (454, 607, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.922Z', '2025-09-29T21:32:49.922Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (455, 613, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.922Z', '2025-09-29T21:32:49.922Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (456, 619, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.923Z', '2025-09-29T21:32:49.923Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (457, 625, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.923Z', '2025-09-29T21:32:49.923Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (458, 631, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.923Z', '2025-09-29T21:32:49.923Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (459, 637, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.924Z', '2025-09-29T21:32:49.924Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (460, 643, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.924Z', '2025-09-29T21:32:49.924Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (461, 649, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.925Z', '2025-09-29T21:32:49.925Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (462, 655, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.925Z', '2025-09-29T21:32:49.925Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (463, 661, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.926Z', '2025-09-29T21:32:49.926Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (464, 667, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.927Z', '2025-09-29T21:32:49.927Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (465, 673, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.928Z', '2025-09-29T21:32:49.928Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (466, 679, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.928Z', '2025-09-29T21:32:49.928Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (467, 685, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.929Z', '2025-09-29T21:32:49.929Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (468, 691, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.929Z', '2025-09-29T21:32:49.929Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (469, 697, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.929Z', '2025-09-29T21:32:49.929Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (470, 703, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.930Z', '2025-09-29T21:32:49.930Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (471, 709, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.930Z', '2025-09-29T21:32:49.930Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (472, 715, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.931Z', '2025-09-29T21:32:49.931Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (473, 721, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.931Z', '2025-09-29T21:32:49.931Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (474, 727, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.932Z', '2025-09-29T21:32:49.932Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (475, 733, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.932Z', '2025-09-29T21:32:49.932Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (476, 739, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.932Z', '2025-09-29T21:32:49.932Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (477, 745, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.933Z', '2025-09-29T21:32:49.933Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (478, 751, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.934Z', '2025-09-29T21:32:49.934Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (479, 757, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.934Z', '2025-09-29T21:32:49.934Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (480, 763, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.935Z', '2025-09-29T21:32:49.935Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (481, 769, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.935Z', '2025-09-29T21:32:49.935Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (482, 775, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.936Z', '2025-09-29T21:32:49.936Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (483, 781, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.936Z', '2025-09-29T21:32:49.936Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (484, 787, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.937Z', '2025-09-29T21:32:49.937Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (485, 793, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.937Z', '2025-09-29T21:32:49.937Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (486, 799, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.937Z', '2025-09-29T21:32:49.937Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (487, 805, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.938Z', '2025-09-29T21:32:49.938Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (488, 811, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.938Z', '2025-09-29T21:32:49.938Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (489, 817, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.939Z', '2025-09-29T21:32:49.939Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (490, 823, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.939Z', '2025-09-29T21:32:49.939Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (491, 829, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.939Z', '2025-09-29T21:32:49.939Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (492, 835, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.940Z', '2025-09-29T21:32:49.940Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (493, 841, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.941Z', '2025-09-29T21:32:49.941Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (494, 847, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.941Z', '2025-09-29T21:32:49.941Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (495, 853, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.942Z', '2025-09-29T21:32:49.942Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (496, 859, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.942Z', '2025-09-29T21:32:49.942Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (497, 865, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.942Z', '2025-09-29T21:32:49.942Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (498, 871, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.943Z', '2025-09-29T21:32:49.943Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (499, 877, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.943Z', '2025-09-29T21:32:49.943Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (500, 883, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.943Z', '2025-09-29T21:32:49.943Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (501, 889, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.944Z', '2025-09-29T21:32:49.944Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (502, 895, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.944Z', '2025-09-29T21:32:49.944Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (503, 901, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.944Z', '2025-09-29T21:32:49.944Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (504, 907, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.945Z', '2025-09-29T21:32:49.945Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (505, 913, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.945Z', '2025-09-29T21:32:49.945Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (506, 919, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.945Z', '2025-09-29T21:32:49.945Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (507, 925, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.946Z', '2025-09-29T21:32:49.946Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (508, 931, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.946Z', '2025-09-29T21:32:49.946Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (509, 937, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.948Z', '2025-09-29T21:32:49.948Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (510, 943, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.948Z', '2025-09-29T21:32:49.948Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (511, 949, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.949Z', '2025-09-29T21:32:49.949Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (512, 955, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.949Z', '2025-09-29T21:32:49.949Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (513, 961, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.950Z', '2025-09-29T21:32:49.950Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (514, 967, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.950Z', '2025-09-29T21:32:49.950Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (515, 973, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.950Z', '2025-09-29T21:32:49.950Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (516, 979, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.951Z', '2025-09-29T21:32:49.951Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (517, 985, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.951Z', '2025-09-29T21:32:49.951Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (518, 991, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.951Z', '2025-09-29T21:32:49.951Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (520, 1003, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.952Z', '2025-09-29T21:32:49.952Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (521, 1007, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no apto', [object Object], 'high', NULL, '2025-09-29T21:32:49.953Z', '2025-09-29T21:32:49.953Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (524, 1007, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T21:56:09.179Z', '2025-09-29T21:56:09.179Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (526, 1011, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T21:56:12.246Z', '2025-09-29T21:56:12.246Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (529, 7, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.803Z', '2025-09-29T22:06:31.803Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (530, 13, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.806Z', '2025-09-29T22:06:31.806Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (527, 1008, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', '2025-09-29T22:06:41.372Z', '2025-09-29T22:06:31.794Z', '2025-09-29T22:06:31.794Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (531, 19, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.808Z', '2025-09-29T22:06:31.808Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (532, 25, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.809Z', '2025-09-29T22:06:31.809Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (533, 31, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.811Z', '2025-09-29T22:06:31.811Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (534, 37, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.812Z', '2025-09-29T22:06:31.812Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (535, 43, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.813Z', '2025-09-29T22:06:31.813Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (536, 49, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.815Z', '2025-09-29T22:06:31.815Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (537, 55, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.817Z', '2025-09-29T22:06:31.817Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (538, 61, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.818Z', '2025-09-29T22:06:31.818Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (539, 67, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.819Z', '2025-09-29T22:06:31.819Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (540, 73, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.820Z', '2025-09-29T22:06:31.820Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (541, 79, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.822Z', '2025-09-29T22:06:31.822Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (542, 85, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.823Z', '2025-09-29T22:06:31.823Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (543, 91, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.824Z', '2025-09-29T22:06:31.824Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (544, 97, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.826Z', '2025-09-29T22:06:31.826Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (545, 103, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.827Z', '2025-09-29T22:06:31.827Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (546, 109, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.829Z', '2025-09-29T22:06:31.829Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (547, 115, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.830Z', '2025-09-29T22:06:31.830Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (548, 121, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.831Z', '2025-09-29T22:06:31.831Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (549, 127, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.832Z', '2025-09-29T22:06:31.832Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (550, 133, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.834Z', '2025-09-29T22:06:31.834Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (551, 139, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.835Z', '2025-09-29T22:06:31.835Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (552, 145, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.836Z', '2025-09-29T22:06:31.836Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (553, 151, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.838Z', '2025-09-29T22:06:31.838Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (554, 157, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.839Z', '2025-09-29T22:06:31.839Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (555, 163, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.841Z', '2025-09-29T22:06:31.841Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (556, 169, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.842Z', '2025-09-29T22:06:31.842Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (557, 175, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.843Z', '2025-09-29T22:06:31.843Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (558, 181, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.844Z', '2025-09-29T22:06:31.844Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (559, 187, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.846Z', '2025-09-29T22:06:31.846Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (560, 193, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.847Z', '2025-09-29T22:06:31.847Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (561, 199, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.848Z', '2025-09-29T22:06:31.848Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (562, 205, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.849Z', '2025-09-29T22:06:31.849Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (563, 211, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.851Z', '2025-09-29T22:06:31.851Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (564, 217, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.854Z', '2025-09-29T22:06:31.854Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (565, 223, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.856Z', '2025-09-29T22:06:31.856Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (566, 229, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.858Z', '2025-09-29T22:06:31.858Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (567, 235, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.859Z', '2025-09-29T22:06:31.859Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (568, 241, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.860Z', '2025-09-29T22:06:31.860Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (569, 247, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.862Z', '2025-09-29T22:06:31.862Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (570, 253, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.863Z', '2025-09-29T22:06:31.863Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (571, 259, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.865Z', '2025-09-29T22:06:31.865Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (572, 265, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.866Z', '2025-09-29T22:06:31.866Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (573, 271, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.867Z', '2025-09-29T22:06:31.867Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (574, 277, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.869Z', '2025-09-29T22:06:31.869Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (575, 283, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.870Z', '2025-09-29T22:06:31.870Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (576, 289, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.872Z', '2025-09-29T22:06:31.872Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (577, 295, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.873Z', '2025-09-29T22:06:31.873Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (578, 301, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.874Z', '2025-09-29T22:06:31.874Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (579, 307, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.876Z', '2025-09-29T22:06:31.876Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (580, 313, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.877Z', '2025-09-29T22:06:31.877Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (581, 319, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.878Z', '2025-09-29T22:06:31.878Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (582, 325, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.879Z', '2025-09-29T22:06:31.879Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (583, 331, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.880Z', '2025-09-29T22:06:31.880Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (584, 337, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.881Z', '2025-09-29T22:06:31.881Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (585, 343, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.882Z', '2025-09-29T22:06:31.882Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (586, 349, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.884Z', '2025-09-29T22:06:31.884Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (587, 355, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.885Z', '2025-09-29T22:06:31.885Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (588, 361, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.886Z', '2025-09-29T22:06:31.886Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (589, 367, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.888Z', '2025-09-29T22:06:31.888Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (590, 373, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.889Z', '2025-09-29T22:06:31.889Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (591, 379, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.890Z', '2025-09-29T22:06:31.890Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (592, 385, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.891Z', '2025-09-29T22:06:31.891Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (593, 391, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.892Z', '2025-09-29T22:06:31.892Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (594, 397, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.893Z', '2025-09-29T22:06:31.893Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (595, 403, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.895Z', '2025-09-29T22:06:31.895Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (596, 409, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.896Z', '2025-09-29T22:06:31.896Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (597, 415, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.897Z', '2025-09-29T22:06:31.897Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (598, 421, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.899Z', '2025-09-29T22:06:31.899Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (599, 427, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.900Z', '2025-09-29T22:06:31.900Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (600, 433, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.901Z', '2025-09-29T22:06:31.901Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (601, 439, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.902Z', '2025-09-29T22:06:31.902Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (602, 445, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.903Z', '2025-09-29T22:06:31.903Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (603, 451, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.905Z', '2025-09-29T22:06:31.905Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (604, 457, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.906Z', '2025-09-29T22:06:31.906Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (605, 463, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.907Z', '2025-09-29T22:06:31.907Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (606, 469, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.908Z', '2025-09-29T22:06:31.908Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (607, 475, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.909Z', '2025-09-29T22:06:31.909Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (608, 481, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.911Z', '2025-09-29T22:06:31.911Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (609, 487, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.912Z', '2025-09-29T22:06:31.912Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (610, 493, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.913Z', '2025-09-29T22:06:31.913Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (611, 499, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.915Z', '2025-09-29T22:06:31.915Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (612, 505, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.916Z', '2025-09-29T22:06:31.916Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (613, 511, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.917Z', '2025-09-29T22:06:31.917Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (614, 517, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.918Z', '2025-09-29T22:06:31.918Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (615, 523, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.919Z', '2025-09-29T22:06:31.919Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (616, 529, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.920Z', '2025-09-29T22:06:31.920Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (617, 535, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.921Z', '2025-09-29T22:06:31.921Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (618, 541, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.923Z', '2025-09-29T22:06:31.923Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (619, 547, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.924Z', '2025-09-29T22:06:31.924Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (620, 553, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.925Z', '2025-09-29T22:06:31.925Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (621, 559, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.926Z', '2025-09-29T22:06:31.926Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (622, 565, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.927Z', '2025-09-29T22:06:31.927Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (623, 571, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.929Z', '2025-09-29T22:06:31.929Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (624, 577, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.930Z', '2025-09-29T22:06:31.930Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (625, 583, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.931Z', '2025-09-29T22:06:31.931Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (626, 589, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.933Z', '2025-09-29T22:06:31.933Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (627, 595, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.934Z', '2025-09-29T22:06:31.934Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (628, 601, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.935Z', '2025-09-29T22:06:31.935Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (629, 607, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.936Z', '2025-09-29T22:06:31.936Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (630, 613, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.937Z', '2025-09-29T22:06:31.937Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (631, 619, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.938Z', '2025-09-29T22:06:31.938Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (632, 625, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.940Z', '2025-09-29T22:06:31.940Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (633, 631, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.941Z', '2025-09-29T22:06:31.941Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (634, 637, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.942Z', '2025-09-29T22:06:31.942Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (635, 643, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.943Z', '2025-09-29T22:06:31.943Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (636, 649, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.944Z', '2025-09-29T22:06:31.944Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (637, 655, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.945Z', '2025-09-29T22:06:31.945Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (638, 661, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.946Z', '2025-09-29T22:06:31.946Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (639, 667, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.947Z', '2025-09-29T22:06:31.947Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (640, 673, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.949Z', '2025-09-29T22:06:31.949Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (641, 679, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.950Z', '2025-09-29T22:06:31.950Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (642, 685, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.950Z', '2025-09-29T22:06:31.950Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (643, 691, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.952Z', '2025-09-29T22:06:31.952Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (644, 697, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.953Z', '2025-09-29T22:06:31.953Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (645, 703, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.954Z', '2025-09-29T22:06:31.954Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (646, 709, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.956Z', '2025-09-29T22:06:31.956Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (647, 715, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.957Z', '2025-09-29T22:06:31.957Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (648, 721, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.958Z', '2025-09-29T22:06:31.958Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (649, 727, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.959Z', '2025-09-29T22:06:31.959Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (650, 733, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.960Z', '2025-09-29T22:06:31.960Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (651, 739, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.961Z', '2025-09-29T22:06:31.961Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (652, 745, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.962Z', '2025-09-29T22:06:31.962Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (653, 751, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.963Z', '2025-09-29T22:06:31.963Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (654, 757, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.964Z', '2025-09-29T22:06:31.964Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (655, 763, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.965Z', '2025-09-29T22:06:31.965Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (656, 769, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.966Z', '2025-09-29T22:06:31.966Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (657, 775, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.967Z', '2025-09-29T22:06:31.967Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (658, 781, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.968Z', '2025-09-29T22:06:31.968Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (659, 787, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.970Z', '2025-09-29T22:06:31.970Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (660, 793, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.971Z', '2025-09-29T22:06:31.971Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (661, 799, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.973Z', '2025-09-29T22:06:31.973Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (662, 805, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.974Z', '2025-09-29T22:06:31.974Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (663, 811, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.975Z', '2025-09-29T22:06:31.975Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (664, 817, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.976Z', '2025-09-29T22:06:31.976Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (665, 823, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.977Z', '2025-09-29T22:06:31.977Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (666, 829, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.978Z', '2025-09-29T22:06:31.978Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (667, 835, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.980Z', '2025-09-29T22:06:31.980Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (668, 841, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.981Z', '2025-09-29T22:06:31.981Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (669, 847, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.982Z', '2025-09-29T22:06:31.982Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (670, 853, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.983Z', '2025-09-29T22:06:31.983Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (671, 859, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.984Z', '2025-09-29T22:06:31.984Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (672, 865, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.986Z', '2025-09-29T22:06:31.986Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (673, 871, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.987Z', '2025-09-29T22:06:31.987Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (674, 877, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.988Z', '2025-09-29T22:06:31.988Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (675, 883, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.990Z', '2025-09-29T22:06:31.990Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (676, 889, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.991Z', '2025-09-29T22:06:31.991Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (677, 895, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.993Z', '2025-09-29T22:06:31.993Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (678, 901, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.994Z', '2025-09-29T22:06:31.994Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (679, 907, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.995Z', '2025-09-29T22:06:31.995Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (680, 913, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.996Z', '2025-09-29T22:06:31.996Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (681, 919, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.997Z', '2025-09-29T22:06:31.997Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (682, 925, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.998Z', '2025-09-29T22:06:31.998Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (683, 931, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:31.999Z', '2025-09-29T22:06:31.999Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (684, 937, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.000Z', '2025-09-29T22:06:32.000Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (685, 943, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.001Z', '2025-09-29T22:06:32.001Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (686, 949, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.002Z', '2025-09-29T22:06:32.002Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (687, 955, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.003Z', '2025-09-29T22:06:32.003Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (688, 961, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.004Z', '2025-09-29T22:06:32.004Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (689, 967, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.005Z', '2025-09-29T22:06:32.005Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (690, 973, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.006Z', '2025-09-29T22:06:32.006Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (691, 979, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.007Z', '2025-09-29T22:06:32.007Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (692, 985, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.009Z', '2025-09-29T22:06:32.009Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (693, 991, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.010Z', '2025-09-29T22:06:32.010Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (695, 1003, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.011Z', '2025-09-29T22:06:32.011Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (696, 1007, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: archivos mal adjuntados', [object Object], 'high', NULL, '2025-09-29T22:06:32.012Z', '2025-09-29T22:06:32.012Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (699, 1007, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T22:09:07.838Z', '2025-09-29T22:09:07.838Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (701, 1011, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T22:09:10.911Z', '2025-09-29T22:09:10.911Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (703, 1007, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T22:11:32.087Z', '2025-09-29T22:11:32.087Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (705, 1011, 'payment_proof_uploaded', 'Nuevo Comprobante de Pago', 'Comprobante de pago para cotización COT-2025-0001 requiere revisión', [object Object], 'high', NULL, '2025-09-29T22:11:34.278Z', '2025-09-29T22:11:34.278Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (706, 1008, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.974Z', '2025-09-29T22:11:54.974Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (708, 7, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.980Z', '2025-09-29T22:11:54.980Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (709, 13, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.982Z', '2025-09-29T22:11:54.982Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (710, 19, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.983Z', '2025-09-29T22:11:54.983Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (711, 25, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.984Z', '2025-09-29T22:11:54.984Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (712, 31, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.985Z', '2025-09-29T22:11:54.985Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (713, 37, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.986Z', '2025-09-29T22:11:54.986Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (714, 43, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.988Z', '2025-09-29T22:11:54.988Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (715, 49, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.989Z', '2025-09-29T22:11:54.989Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (716, 55, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.990Z', '2025-09-29T22:11:54.990Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (717, 61, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.992Z', '2025-09-29T22:11:54.992Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (718, 67, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.993Z', '2025-09-29T22:11:54.993Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (719, 73, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.994Z', '2025-09-29T22:11:54.994Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (720, 79, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.995Z', '2025-09-29T22:11:54.995Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (721, 85, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.996Z', '2025-09-29T22:11:54.996Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (722, 91, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.997Z', '2025-09-29T22:11:54.997Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (723, 97, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:54.999Z', '2025-09-29T22:11:54.999Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (724, 103, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.002Z', '2025-09-29T22:11:55.002Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (725, 109, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.003Z', '2025-09-29T22:11:55.003Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (726, 115, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.004Z', '2025-09-29T22:11:55.004Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (727, 121, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.005Z', '2025-09-29T22:11:55.005Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (728, 127, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.006Z', '2025-09-29T22:11:55.006Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (729, 133, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.007Z', '2025-09-29T22:11:55.007Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (730, 139, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.008Z', '2025-09-29T22:11:55.008Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (731, 145, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.009Z', '2025-09-29T22:11:55.009Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (732, 151, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.010Z', '2025-09-29T22:11:55.010Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (733, 157, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.011Z', '2025-09-29T22:11:55.011Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (734, 163, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.012Z', '2025-09-29T22:11:55.012Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (735, 169, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.013Z', '2025-09-29T22:11:55.013Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (736, 175, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.014Z', '2025-09-29T22:11:55.014Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (737, 181, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.015Z', '2025-09-29T22:11:55.015Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (738, 187, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.016Z', '2025-09-29T22:11:55.016Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (739, 193, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.017Z', '2025-09-29T22:11:55.017Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (740, 199, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.018Z', '2025-09-29T22:11:55.018Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (741, 205, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.020Z', '2025-09-29T22:11:55.020Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (742, 211, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.021Z', '2025-09-29T22:11:55.021Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (743, 217, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.022Z', '2025-09-29T22:11:55.022Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (744, 223, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.023Z', '2025-09-29T22:11:55.023Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (745, 229, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.024Z', '2025-09-29T22:11:55.024Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (746, 235, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.025Z', '2025-09-29T22:11:55.025Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (747, 241, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.026Z', '2025-09-29T22:11:55.026Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (748, 247, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.027Z', '2025-09-29T22:11:55.027Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (749, 253, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.028Z', '2025-09-29T22:11:55.028Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (750, 259, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.029Z', '2025-09-29T22:11:55.029Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (751, 265, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.030Z', '2025-09-29T22:11:55.030Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (752, 271, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.031Z', '2025-09-29T22:11:55.031Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (753, 277, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.032Z', '2025-09-29T22:11:55.032Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (754, 283, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.034Z', '2025-09-29T22:11:55.034Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (755, 289, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.034Z', '2025-09-29T22:11:55.034Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (756, 295, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.035Z', '2025-09-29T22:11:55.035Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (757, 301, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.036Z', '2025-09-29T22:11:55.036Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (758, 307, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.037Z', '2025-09-29T22:11:55.037Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (759, 313, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.038Z', '2025-09-29T22:11:55.038Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (760, 319, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.039Z', '2025-09-29T22:11:55.039Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (761, 325, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.040Z', '2025-09-29T22:11:55.040Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (762, 331, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.041Z', '2025-09-29T22:11:55.041Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (763, 337, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.042Z', '2025-09-29T22:11:55.042Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (764, 343, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.043Z', '2025-09-29T22:11:55.043Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (765, 349, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.044Z', '2025-09-29T22:11:55.044Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (766, 355, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.045Z', '2025-09-29T22:11:55.045Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (767, 361, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.046Z', '2025-09-29T22:11:55.046Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (768, 367, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.047Z', '2025-09-29T22:11:55.047Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (769, 373, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.048Z', '2025-09-29T22:11:55.048Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (770, 379, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.049Z', '2025-09-29T22:11:55.049Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (771, 385, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.050Z', '2025-09-29T22:11:55.050Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (772, 391, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.052Z', '2025-09-29T22:11:55.052Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (773, 397, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.053Z', '2025-09-29T22:11:55.053Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (774, 403, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.054Z', '2025-09-29T22:11:55.054Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (775, 409, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.055Z', '2025-09-29T22:11:55.055Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (776, 415, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.056Z', '2025-09-29T22:11:55.056Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (777, 421, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.057Z', '2025-09-29T22:11:55.057Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (778, 427, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.059Z', '2025-09-29T22:11:55.059Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (779, 433, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.060Z', '2025-09-29T22:11:55.060Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (780, 439, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.061Z', '2025-09-29T22:11:55.061Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (781, 445, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.062Z', '2025-09-29T22:11:55.062Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (782, 451, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.064Z', '2025-09-29T22:11:55.064Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (783, 457, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.065Z', '2025-09-29T22:11:55.065Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (784, 463, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.066Z', '2025-09-29T22:11:55.066Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (785, 469, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.067Z', '2025-09-29T22:11:55.067Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (786, 475, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.068Z', '2025-09-29T22:11:55.068Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (787, 481, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.069Z', '2025-09-29T22:11:55.069Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (788, 487, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.070Z', '2025-09-29T22:11:55.070Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (789, 493, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.071Z', '2025-09-29T22:11:55.071Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (790, 499, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.072Z', '2025-09-29T22:11:55.072Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (791, 505, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.073Z', '2025-09-29T22:11:55.073Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (792, 511, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.074Z', '2025-09-29T22:11:55.074Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (793, 517, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.075Z', '2025-09-29T22:11:55.075Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (794, 523, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.076Z', '2025-09-29T22:11:55.076Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (795, 529, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.077Z', '2025-09-29T22:11:55.077Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (796, 535, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.078Z', '2025-09-29T22:11:55.078Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (797, 541, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.079Z', '2025-09-29T22:11:55.079Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (798, 547, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.080Z', '2025-09-29T22:11:55.080Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (799, 553, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.081Z', '2025-09-29T22:11:55.081Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (800, 559, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.082Z', '2025-09-29T22:11:55.082Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (801, 565, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.083Z', '2025-09-29T22:11:55.083Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (802, 571, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.085Z', '2025-09-29T22:11:55.085Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (803, 577, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.086Z', '2025-09-29T22:11:55.086Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (804, 583, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.087Z', '2025-09-29T22:11:55.087Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (805, 589, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.088Z', '2025-09-29T22:11:55.088Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (806, 595, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.088Z', '2025-09-29T22:11:55.088Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (807, 601, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.089Z', '2025-09-29T22:11:55.089Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (808, 607, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.090Z', '2025-09-29T22:11:55.090Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (809, 613, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.091Z', '2025-09-29T22:11:55.091Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (810, 619, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.092Z', '2025-09-29T22:11:55.092Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (811, 625, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.093Z', '2025-09-29T22:11:55.093Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (812, 631, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.094Z', '2025-09-29T22:11:55.094Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (813, 637, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.094Z', '2025-09-29T22:11:55.094Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (814, 643, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.095Z', '2025-09-29T22:11:55.095Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (815, 649, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.096Z', '2025-09-29T22:11:55.096Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (816, 655, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.097Z', '2025-09-29T22:11:55.097Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (817, 661, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.098Z', '2025-09-29T22:11:55.098Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (818, 667, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.099Z', '2025-09-29T22:11:55.099Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (819, 673, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.100Z', '2025-09-29T22:11:55.100Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (820, 679, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.101Z', '2025-09-29T22:11:55.101Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (821, 685, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.102Z', '2025-09-29T22:11:55.102Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (822, 691, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.103Z', '2025-09-29T22:11:55.103Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (823, 697, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.105Z', '2025-09-29T22:11:55.105Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (824, 703, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.106Z', '2025-09-29T22:11:55.106Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (825, 709, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.107Z', '2025-09-29T22:11:55.107Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (826, 715, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.109Z', '2025-09-29T22:11:55.109Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (827, 721, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.110Z', '2025-09-29T22:11:55.110Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (828, 727, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.111Z', '2025-09-29T22:11:55.111Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (829, 733, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.112Z', '2025-09-29T22:11:55.112Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (830, 739, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.113Z', '2025-09-29T22:11:55.113Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (831, 745, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.115Z', '2025-09-29T22:11:55.115Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (832, 751, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.116Z', '2025-09-29T22:11:55.116Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (833, 757, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.117Z', '2025-09-29T22:11:55.117Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (834, 763, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.118Z', '2025-09-29T22:11:55.118Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (835, 769, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.120Z', '2025-09-29T22:11:55.120Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (836, 775, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.121Z', '2025-09-29T22:11:55.121Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (837, 781, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.122Z', '2025-09-29T22:11:55.122Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (838, 787, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.123Z', '2025-09-29T22:11:55.123Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (839, 793, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.125Z', '2025-09-29T22:11:55.125Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (840, 799, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.126Z', '2025-09-29T22:11:55.126Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (841, 805, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.128Z', '2025-09-29T22:11:55.128Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (842, 811, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.128Z', '2025-09-29T22:11:55.128Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (843, 817, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.129Z', '2025-09-29T22:11:55.129Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (844, 823, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.131Z', '2025-09-29T22:11:55.131Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (845, 829, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.132Z', '2025-09-29T22:11:55.132Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (846, 835, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.133Z', '2025-09-29T22:11:55.133Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (847, 841, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.134Z', '2025-09-29T22:11:55.134Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (848, 847, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.135Z', '2025-09-29T22:11:55.135Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (849, 853, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.137Z', '2025-09-29T22:11:55.137Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (850, 859, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.138Z', '2025-09-29T22:11:55.138Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (851, 865, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.139Z', '2025-09-29T22:11:55.139Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (852, 871, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.141Z', '2025-09-29T22:11:55.141Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (853, 877, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.143Z', '2025-09-29T22:11:55.143Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (854, 883, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.144Z', '2025-09-29T22:11:55.144Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (855, 889, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.144Z', '2025-09-29T22:11:55.144Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (856, 895, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.145Z', '2025-09-29T22:11:55.145Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (857, 901, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.146Z', '2025-09-29T22:11:55.146Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (858, 907, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.147Z', '2025-09-29T22:11:55.147Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (859, 913, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.148Z', '2025-09-29T22:11:55.148Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (860, 919, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.149Z', '2025-09-29T22:11:55.149Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (861, 925, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.150Z', '2025-09-29T22:11:55.150Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (862, 931, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.152Z', '2025-09-29T22:11:55.152Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (863, 937, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.153Z', '2025-09-29T22:11:55.153Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (864, 943, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.153Z', '2025-09-29T22:11:55.153Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (865, 949, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.155Z', '2025-09-29T22:11:55.155Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (866, 955, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.156Z', '2025-09-29T22:11:55.156Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (867, 961, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.157Z', '2025-09-29T22:11:55.157Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (868, 967, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.157Z', '2025-09-29T22:11:55.157Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (869, 973, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.158Z', '2025-09-29T22:11:55.158Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (870, 979, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.159Z', '2025-09-29T22:11:55.159Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (871, 985, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.161Z', '2025-09-29T22:11:55.161Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (872, 991, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.161Z', '2025-09-29T22:11:55.161Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (874, 1003, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.164Z', '2025-09-29T22:11:55.164Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (875, 1007, 'payment_proof_rejected', 'Comprobante de Pago Rechazado', 'Comprobante de pago para cotización COT-2025-0001 ha sido rechazado. Motivo: no es apto', [object Object], 'high', NULL, '2025-09-29T22:11:55.165Z', '2025-09-29T22:11:55.165Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (877, 1008, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Tu comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.250Z', '2025-09-29T22:21:13.250Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (879, 7, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.256Z', '2025-09-29T22:21:13.256Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (880, 13, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.257Z', '2025-09-29T22:21:13.257Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (881, 19, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.259Z', '2025-09-29T22:21:13.259Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (882, 25, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.260Z', '2025-09-29T22:21:13.260Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (883, 31, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.262Z', '2025-09-29T22:21:13.262Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (884, 37, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.263Z', '2025-09-29T22:21:13.263Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (885, 43, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.264Z', '2025-09-29T22:21:13.264Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (886, 49, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.265Z', '2025-09-29T22:21:13.265Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (887, 55, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.267Z', '2025-09-29T22:21:13.267Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (888, 61, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.268Z', '2025-09-29T22:21:13.268Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (889, 67, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.270Z', '2025-09-29T22:21:13.270Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (890, 73, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.271Z', '2025-09-29T22:21:13.271Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (891, 79, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.272Z', '2025-09-29T22:21:13.272Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (892, 85, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.273Z', '2025-09-29T22:21:13.273Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (893, 91, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.275Z', '2025-09-29T22:21:13.275Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (894, 97, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.276Z', '2025-09-29T22:21:13.276Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (895, 103, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.277Z', '2025-09-29T22:21:13.277Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (896, 109, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.278Z', '2025-09-29T22:21:13.278Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (897, 115, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.280Z', '2025-09-29T22:21:13.280Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (898, 121, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.283Z', '2025-09-29T22:21:13.283Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (899, 127, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.284Z', '2025-09-29T22:21:13.284Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (900, 133, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.285Z', '2025-09-29T22:21:13.285Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (901, 139, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.286Z', '2025-09-29T22:21:13.286Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (902, 145, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.288Z', '2025-09-29T22:21:13.288Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (903, 151, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.289Z', '2025-09-29T22:21:13.289Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (904, 157, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.291Z', '2025-09-29T22:21:13.291Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (905, 163, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.292Z', '2025-09-29T22:21:13.292Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (906, 169, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.293Z', '2025-09-29T22:21:13.293Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (907, 175, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.295Z', '2025-09-29T22:21:13.295Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (908, 181, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.296Z', '2025-09-29T22:21:13.296Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (909, 187, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.297Z', '2025-09-29T22:21:13.297Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (910, 193, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.298Z', '2025-09-29T22:21:13.298Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (911, 199, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.299Z', '2025-09-29T22:21:13.299Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (912, 205, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.300Z', '2025-09-29T22:21:13.300Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (913, 211, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.301Z', '2025-09-29T22:21:13.301Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (914, 217, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.302Z', '2025-09-29T22:21:13.302Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (915, 223, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.303Z', '2025-09-29T22:21:13.303Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (916, 229, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.305Z', '2025-09-29T22:21:13.305Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (917, 235, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.306Z', '2025-09-29T22:21:13.306Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (918, 241, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.307Z', '2025-09-29T22:21:13.307Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (919, 247, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.308Z', '2025-09-29T22:21:13.308Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (920, 253, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.310Z', '2025-09-29T22:21:13.310Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (921, 259, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.311Z', '2025-09-29T22:21:13.311Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (922, 265, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.312Z', '2025-09-29T22:21:13.312Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (923, 271, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.313Z', '2025-09-29T22:21:13.313Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (924, 277, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.314Z', '2025-09-29T22:21:13.314Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (925, 283, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.315Z', '2025-09-29T22:21:13.315Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (926, 289, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.316Z', '2025-09-29T22:21:13.316Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (927, 295, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.316Z', '2025-09-29T22:21:13.316Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (928, 301, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.317Z', '2025-09-29T22:21:13.317Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (929, 307, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.318Z', '2025-09-29T22:21:13.318Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (930, 313, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.319Z', '2025-09-29T22:21:13.319Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (931, 319, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.319Z', '2025-09-29T22:21:13.319Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (932, 325, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.320Z', '2025-09-29T22:21:13.320Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (933, 331, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.320Z', '2025-09-29T22:21:13.320Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (934, 337, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.321Z', '2025-09-29T22:21:13.321Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (935, 343, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.321Z', '2025-09-29T22:21:13.321Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (936, 349, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.323Z', '2025-09-29T22:21:13.323Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (937, 355, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.324Z', '2025-09-29T22:21:13.324Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (938, 361, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.325Z', '2025-09-29T22:21:13.325Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (939, 367, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.326Z', '2025-09-29T22:21:13.326Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (940, 373, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.327Z', '2025-09-29T22:21:13.327Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (941, 379, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.328Z', '2025-09-29T22:21:13.328Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (942, 385, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.328Z', '2025-09-29T22:21:13.328Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (943, 391, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.329Z', '2025-09-29T22:21:13.329Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (944, 397, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.330Z', '2025-09-29T22:21:13.330Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (945, 403, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.331Z', '2025-09-29T22:21:13.331Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (946, 409, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.332Z', '2025-09-29T22:21:13.332Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (947, 415, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.332Z', '2025-09-29T22:21:13.332Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (948, 421, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.333Z', '2025-09-29T22:21:13.333Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (949, 427, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.334Z', '2025-09-29T22:21:13.334Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (950, 433, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.335Z', '2025-09-29T22:21:13.335Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (951, 439, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.336Z', '2025-09-29T22:21:13.336Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (952, 445, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.337Z', '2025-09-29T22:21:13.337Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (953, 451, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.338Z', '2025-09-29T22:21:13.338Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (954, 457, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.339Z', '2025-09-29T22:21:13.339Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (955, 463, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.340Z', '2025-09-29T22:21:13.340Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (956, 469, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.341Z', '2025-09-29T22:21:13.341Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (957, 475, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.342Z', '2025-09-29T22:21:13.342Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (958, 481, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.343Z', '2025-09-29T22:21:13.343Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (959, 487, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.344Z', '2025-09-29T22:21:13.344Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (960, 493, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.346Z', '2025-09-29T22:21:13.346Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (961, 499, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.347Z', '2025-09-29T22:21:13.347Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (962, 505, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.348Z', '2025-09-29T22:21:13.348Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (963, 511, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.349Z', '2025-09-29T22:21:13.349Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (964, 517, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.351Z', '2025-09-29T22:21:13.351Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (965, 523, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.352Z', '2025-09-29T22:21:13.352Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (966, 529, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.353Z', '2025-09-29T22:21:13.353Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (967, 535, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.354Z', '2025-09-29T22:21:13.354Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (968, 541, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.355Z', '2025-09-29T22:21:13.355Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (969, 547, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.356Z', '2025-09-29T22:21:13.356Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (970, 553, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.357Z', '2025-09-29T22:21:13.357Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (971, 559, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.358Z', '2025-09-29T22:21:13.358Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (972, 565, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.359Z', '2025-09-29T22:21:13.359Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (973, 571, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.360Z', '2025-09-29T22:21:13.360Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (974, 577, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.362Z', '2025-09-29T22:21:13.362Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (975, 583, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.363Z', '2025-09-29T22:21:13.363Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (976, 589, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.364Z', '2025-09-29T22:21:13.364Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (977, 595, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.366Z', '2025-09-29T22:21:13.366Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (978, 601, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.367Z', '2025-09-29T22:21:13.367Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (979, 607, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.368Z', '2025-09-29T22:21:13.368Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (980, 613, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.369Z', '2025-09-29T22:21:13.369Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (981, 619, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.371Z', '2025-09-29T22:21:13.371Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (982, 625, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.372Z', '2025-09-29T22:21:13.372Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (983, 631, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.373Z', '2025-09-29T22:21:13.373Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (984, 637, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.375Z', '2025-09-29T22:21:13.375Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (985, 643, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.376Z', '2025-09-29T22:21:13.376Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (986, 649, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.378Z', '2025-09-29T22:21:13.378Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (987, 655, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.379Z', '2025-09-29T22:21:13.379Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (988, 661, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.380Z', '2025-09-29T22:21:13.380Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (989, 667, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.381Z', '2025-09-29T22:21:13.381Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (990, 673, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.383Z', '2025-09-29T22:21:13.383Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (991, 679, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.384Z', '2025-09-29T22:21:13.384Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (992, 685, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.386Z', '2025-09-29T22:21:13.386Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (993, 691, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.387Z', '2025-09-29T22:21:13.387Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (994, 697, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.388Z', '2025-09-29T22:21:13.388Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (995, 703, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.389Z', '2025-09-29T22:21:13.389Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (996, 709, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.391Z', '2025-09-29T22:21:13.391Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (997, 715, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.392Z', '2025-09-29T22:21:13.392Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (998, 721, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.393Z', '2025-09-29T22:21:13.393Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (999, 727, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.394Z', '2025-09-29T22:21:13.394Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1000, 733, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.395Z', '2025-09-29T22:21:13.395Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1001, 739, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.396Z', '2025-09-29T22:21:13.396Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1002, 745, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.397Z', '2025-09-29T22:21:13.397Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1003, 751, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.399Z', '2025-09-29T22:21:13.399Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1004, 757, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.400Z', '2025-09-29T22:21:13.400Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1005, 763, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.401Z', '2025-09-29T22:21:13.401Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1006, 769, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.402Z', '2025-09-29T22:21:13.402Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1007, 775, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.403Z', '2025-09-29T22:21:13.403Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1008, 781, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.404Z', '2025-09-29T22:21:13.404Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1009, 787, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.406Z', '2025-09-29T22:21:13.406Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1010, 793, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.407Z', '2025-09-29T22:21:13.407Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1011, 799, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.408Z', '2025-09-29T22:21:13.408Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1012, 805, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.409Z', '2025-09-29T22:21:13.409Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1013, 811, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.411Z', '2025-09-29T22:21:13.411Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1014, 817, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.412Z', '2025-09-29T22:21:13.412Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1015, 823, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.413Z', '2025-09-29T22:21:13.413Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1016, 829, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.414Z', '2025-09-29T22:21:13.414Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1017, 835, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.415Z', '2025-09-29T22:21:13.415Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1018, 841, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.416Z', '2025-09-29T22:21:13.416Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1019, 847, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.418Z', '2025-09-29T22:21:13.418Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1020, 853, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.419Z', '2025-09-29T22:21:13.419Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1021, 859, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.421Z', '2025-09-29T22:21:13.421Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1022, 865, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.422Z', '2025-09-29T22:21:13.422Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1023, 871, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.423Z', '2025-09-29T22:21:13.423Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1024, 877, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.424Z', '2025-09-29T22:21:13.424Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1025, 883, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.425Z', '2025-09-29T22:21:13.425Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1026, 889, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.428Z', '2025-09-29T22:21:13.428Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1027, 895, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.429Z', '2025-09-29T22:21:13.429Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1028, 901, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.430Z', '2025-09-29T22:21:13.430Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1029, 907, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.431Z', '2025-09-29T22:21:13.431Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1030, 913, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.432Z', '2025-09-29T22:21:13.432Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1031, 919, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.433Z', '2025-09-29T22:21:13.433Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1032, 925, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.435Z', '2025-09-29T22:21:13.435Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1033, 931, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.435Z', '2025-09-29T22:21:13.435Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1034, 937, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.437Z', '2025-09-29T22:21:13.437Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1035, 943, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.438Z', '2025-09-29T22:21:13.438Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1036, 949, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.439Z', '2025-09-29T22:21:13.439Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1037, 955, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.440Z', '2025-09-29T22:21:13.440Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1038, 961, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.442Z', '2025-09-29T22:21:13.442Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1039, 967, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.443Z', '2025-09-29T22:21:13.443Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1040, 973, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.444Z', '2025-09-29T22:21:13.444Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1041, 979, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.445Z', '2025-09-29T22:21:13.445Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1042, 985, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.446Z', '2025-09-29T22:21:13.446Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1043, 991, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.448Z', '2025-09-29T22:21:13.448Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1045, 1003, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.450Z', '2025-09-29T22:21:13.450Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1046, 1007, 'payment_proof_approved', 'Comprobante de Pago Aprobado', 'Comprobante de pago para cotización COT-2025-0001 ha sido aprobado', [object Object], 'normal', NULL, '2025-09-29T22:21:13.451Z', '2025-09-29T22:21:13.451Z', NULL, NULL, NULL, database, 'pending', false, NULL, false, NULL),
  (1049, 1005, 'project_assignment', '🎯 Proyecto Asignado - mineria las bambas', 'Se te ha asignado el proyecto "mineria las bambas" como usuario de laboratorio responsable.

📅 Fecha y hora: 10/10/2025, 10:12:12 a. m.
🏢 Empresa: Minera Las Bambas
📍 Ubicación: las malvinas
📞 Contacto: Carlos Mendoza', [object Object], 'high', NULL, '2025-10-10T15:12:12.205Z', '2025-10-10T15:12:12.205Z', 6, 'project', 768, database, 'pending', false, NULL, false, NULL),
  (1048, 1613, 'project_assignment', '🎯 Proyecto Asignado - mineria las bambas', 'Se te ha asignado el proyecto "mineria las bambas" como vendedor comercial responsable.

📅 Fecha y hora: 10/10/2025, 10:12:10 a. m.
🏢 Empresa: Minera Las Bambas
📍 Ubicación: las malvinas
📞 Contacto: Carlos Mendoza', [object Object], 'high', '2025-10-10T15:12:57.239Z', '2025-10-10T15:12:10.840Z', '2025-10-10T15:12:10.840Z', 6, 'project', 768, database, 'pending', false, NULL, false, NULL),
  (1050, 5331, 'project_assignment', '🎯 Proyecto Asignado - si', 'Se te ha asignado el proyecto "si" como vendedor comercial responsable.

📅 Fecha y hora: 11/10/2025, 12:41:26 p. m.
🏢 Empresa: Innovatech Solutions S.A.C.
📍 Ubicación: Av. Javier Prado Este 123, Of. 404, San Isidro, Lima
📞 Contacto: Ana Torres', [object Object], 'high', '2025-10-11T17:51:37.892Z', '2025-10-11T17:41:26.416Z', '2025-10-11T17:41:26.416Z', 5331, 'project', 767, database, 'pending', false, NULL, false, NULL);

-- No data for table: payment_proofs

-- Data for table: project_attachments
INSERT INTO project_attachments (id, project_id, uploaded_by, file_type, description, created_at, category_id, subcategory_id, filename, original_name, file_path, file_size, requiere_laboratorio, requiere_ingenieria, requiere_consultoria, requiere_capacitacion, requiere_auditoria, mime_type, updated_at, file_url) VALUES
  (3, 85, 6, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Archivo subido: Control área Comercial - Geofal 2025 (1).xlsx', '2025-09-22T21:51:22.881Z', NULL, NULL, 'file-1758577882846-158444960.xlsx', 'Control Ã¡rea Comercial - Geofal 2025 (1).xlsx', 'C:\Users\Lenovo\Documents\CRMGeoFal\backend\uploads\2025\09\file-1758577882846-158444960.xlsx', 248130, true, true, true, true, false, NULL, '2025-09-23T14:24:29.366Z', NULL),
  (7, 99, 6, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '', '2025-09-23T17:23:03.530Z', 1, 7, 'file-1758648183457-900437821.xlsx', 'DocumentosQR.xlsx', 'C:\Users\Lenovo\Documents\CRMGeoFal\backend\uploads\2025\09\file-1758648183457-900437821.xlsx', 388871, true, false, true, false, true, NULL, '2025-09-23T18:04:22.698Z', NULL),
  (8, 100, 6, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Archivo subido: DocumentosQR.xlsx', '2025-09-23T21:06:47.337Z', NULL, NULL, 'file-1758661607168-297004154.xlsx', 'DocumentosQR.xlsx', 'C:\Users\Lenovo\Documents\CRMGeoFal\backend\uploads\2025\09\file-1758661607168-297004154.xlsx', 388871, false, false, false, false, false, NULL, '2025-09-23T21:06:47.337Z', NULL),
  (9, 100, 6, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Archivo subido: DocumentosQR.xlsx', '2025-09-25T13:33:40.744Z', NULL, NULL, 'file-1758807220714-193920562.xlsx', 'DocumentosQR.xlsx', 'C:\Users\Lenovo\Documents\CRMGeoFal\backend\uploads\2025\09\file-1758807220714-193920562.xlsx', 388871, false, false, false, false, false, NULL, '2025-09-25T13:33:40.744Z', NULL),
  (549, 768, 1613, 'application/pdf', 'Archivo subido: cotizacion-borrador-272.pdf', '2025-10-10T15:25:42.192Z', NULL, NULL, 'file-1760109942173-110854811.pdf', 'cotizacion-borrador-272.pdf', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\2025\10\file-1760109942173-110854811.pdf', 180844, false, false, false, false, false, NULL, '2025-10-10T15:25:42.192Z', NULL),
  (550, 768, 6, 'application/pdf', 'Archivo subido: cotizacion-borrador-271.pdf', '2025-10-10T17:19:37.562Z', NULL, NULL, 'file-1760116777544-189997633.pdf', 'cotizacion-borrador-271.pdf', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\2025\10\file-1760116777544-189997633.pdf', 181929, false, false, false, false, false, NULL, '2025-10-10T17:19:37.562Z', NULL);

-- Data for table: project_categories
INSERT INTO project_categories (id, name, description, created_at, updated_at) VALUES
  (1, 'Certificación de Materiales', 'Proyectos de certificación de materiales de construcción', '2025-09-22T20:26:10.043Z', '2025-09-22T20:26:10.043Z'),
  (2, 'Estudio de Impacto Ambiental', 'Estudios de impacto ambiental para proyectos', '2025-09-22T20:26:10.045Z', '2025-09-22T20:26:10.045Z'),
  (3, 'Consultoría Técnica', 'Servicios de consultoría técnica especializada', '2025-09-22T20:26:10.046Z', '2025-09-22T20:26:10.046Z'),
  (4, 'Capacitación', 'Programas de capacitación y formación', '2025-09-22T20:26:10.047Z', '2025-09-22T20:26:10.047Z'),
  (5, 'Auditoría', 'Servicios de auditoría y evaluación', '2025-09-22T20:26:10.047Z', '2025-09-22T20:26:10.047Z'),
  (11, 'roblox', NULL, '2025-09-23T14:12:33.275Z', '2025-09-23T14:12:33.275Z');

-- No data for table: project_evidence

-- No data for table: project_files

-- Data for table: project_history
INSERT INTO project_history (id, project_id, action, performed_by, performed_at, notes) VALUES
  (1, 86, 'cancelled', 7, '2025-09-11T18:06:47.931Z', 'Estado cambiado a "En progreso"'),
  (2, 86, 'cancelled', 7, '2025-10-07T18:06:47.939Z', 'Proyecto completado exitosamente'),
  (3, 86, 'updated', 6, '2025-09-25T18:06:47.940Z', 'Proyecto cancelado por cambios en requerimientos'),
  (4, 86, 'updated', 7, '2025-09-21T18:06:47.940Z', 'Información del proyecto actualizada'),
  (5, 86, 'status_changed', 6, '2025-09-25T18:06:47.941Z', 'Estado cambiado a "En progreso"'),
  (6, 86, 'completed', 7, '2025-09-08T18:06:47.941Z', 'Proyecto asignado al equipo'),
  (7, 86, 'created', 7, '2025-09-26T18:06:47.942Z', 'Información del proyecto actualizada'),
  (8, 7, 'updated', 8, '2025-09-13T18:06:47.943Z', 'Estado cambiado a "En progreso"'),
  (9, 7, 'cancelled', 6, '2025-09-12T18:06:47.943Z', 'Información del proyecto actualizada'),
  (10, 7, 'cancelled', 7, '2025-09-16T18:06:47.943Z', 'Proyecto asignado al equipo'),
  (11, 7, 'assigned', 8, '2025-09-25T18:06:47.944Z', 'Proyecto creado inicialmente'),
  (12, 7, 'assigned', 8, '2025-10-02T18:06:47.944Z', 'Proyecto asignado al equipo'),
  (13, 7, 'assigned', 6, '2025-09-17T18:06:47.944Z', 'Proyecto cancelado por cambios en requerimientos'),
  (14, 603, 'updated', 6, '2025-09-13T18:06:47.945Z', 'Proyecto creado inicialmente'),
  (15, 603, 'updated', 7, '2025-10-03T18:06:47.945Z', 'Información del proyecto actualizada'),
  (16, 603, 'created', 6, '2025-09-18T18:06:47.945Z', 'Estado cambiado a "En progreso"'),
  (17, 603, 'completed', 8, '2025-09-28T18:06:47.946Z', 'Proyecto asignado al equipo'),
  (18, 603, 'updated', 6, '2025-10-04T18:06:47.946Z', 'Proyecto cancelado por cambios en requerimientos'),
  (19, 603, 'created', 6, '2025-10-07T18:06:47.946Z', 'Proyecto creado inicialmente'),
  (20, 603, 'created', 8, '2025-09-23T18:06:47.946Z', 'Proyecto cancelado por cambios en requerimientos'),
  (21, 8, 'updated', 6, '2025-09-22T18:06:47.946Z', 'Proyecto cancelado por cambios en requerimientos'),
  (22, 8, 'status_changed', 8, '2025-09-16T18:06:47.947Z', 'Proyecto asignado al equipo'),
  (23, 8, 'updated', 6, '2025-09-16T18:06:47.947Z', 'Información del proyecto actualizada'),
  (24, 8, 'created', 7, '2025-09-21T18:06:47.947Z', 'Proyecto completado exitosamente'),
  (25, 8, 'completed', 6, '2025-10-01T18:06:47.947Z', 'Información del proyecto actualizada'),
  (26, 30, 'updated', 8, '2025-10-04T18:06:47.948Z', 'Proyecto creado inicialmente'),
  (27, 30, 'status_changed', 8, '2025-09-11T18:06:47.948Z', 'Proyecto cancelado por cambios en requerimientos'),
  (28, 30, 'assigned', 8, '2025-10-07T18:06:47.948Z', 'Proyecto completado exitosamente'),
  (29, 30, 'assigned', 8, '2025-09-29T18:06:47.948Z', 'Proyecto creado inicialmente');

-- No data for table: project_invoices

-- No data for table: project_services

-- No data for table: project_states

-- Data for table: project_subcategories
INSERT INTO project_subcategories (id, category_id, name, description, created_at, updated_at) VALUES
  (1, 1, 'Concreto', 'Certificación de concreto y agregados', '2025-09-22T20:26:10.049Z', '2025-09-22T20:26:10.049Z'),
  (2, 1, 'Acero', 'Certificación de acero estructural', '2025-09-22T20:26:10.051Z', '2025-09-22T20:26:10.051Z'),
  (3, 1, 'Maderas', 'Certificación de maderas y derivados', '2025-09-22T20:26:10.052Z', '2025-09-22T20:26:10.052Z'),
  (4, 2, 'EIA', 'Estudio de Impacto Ambiental completo', '2025-09-22T20:26:10.053Z', '2025-09-22T20:26:10.053Z'),
  (5, 2, 'PMA', 'Plan de Manejo Ambiental', '2025-09-22T20:26:10.057Z', '2025-09-22T20:26:10.057Z'),
  (6, 3, 'Estructural', 'Consultoría en ingeniería estructural', '2025-09-22T20:26:10.062Z', '2025-09-22T20:26:10.062Z'),
  (7, 3, 'Geotécnica', 'Consultoría en ingeniería geotécnica', '2025-09-22T20:26:10.064Z', '2025-09-22T20:26:10.064Z');

-- No data for table: projects

-- No data for table: quote_approvals

-- Data for table: quote_categories
INSERT INTO quote_categories (id, name, description, color, icon, is_active, created_at, updated_at) VALUES
  (1, 'Laboratorio', 'Servicios de análisis, ensayos y pruebas de laboratorio', '#FF6B6B', 'laboratorio', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (2, 'Ingeniería', 'Servicios de diseño, consultoría y proyectos de ingeniería', '#4ECDC4', 'ingenieria', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z');

-- Data for table: quote_evidences
INSERT INTO quote_evidences (id, quote_id, evidence_type, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at, notes) VALUES
  (2, 271, 'primer_contacto', 'cotizacion-borrador-271.pdf', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\evidences\271\cotizacion_borrador_271-1760103672175-51951505.pdf', 'application/pdf', 181929, 6, '2025-10-10T13:41:12.183Z', '"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of s'),
  (3, 271, 'aceptacion', 'SEGUIMIENTO DE CLIENTES 2025.xlsx', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\evidences\271\SEGUIMIENTO_DE_CLIENTES_2025-1760103941350-591913989.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 134755, 6, '2025-10-10T13:45:41.357Z', '"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of s'),
  (4, 271, 'finalizacion', 'coso.jpg', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\evidences\271\coso-1760103990616-2214384.jpg', 'image/jpeg', 59747, 6, '2025-10-10T13:46:30.622Z', 'sa"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

1914 translation by H. Rackham
"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of s'),
  (8, 272, 'primer_contacto', '202af97e-b421-4d41-86f4-b96586c2dd8c.pdf', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\evidences\272\202af97e_b421_4d41_86f4_b96586c2dd8c-1760204649379-693689481.pdf', 'application/pdf', 93979, 5331, '2025-10-11T17:44:09.391Z', 'dds'),
  (9, 272, 'aceptacion', 'coso (1).jpg', 'C:\Users\Lenovo\Documents\crmgeofal\backend\uploads\evidences\272\coso__1_-1760204671534-331529114.jpg', 'image/jpeg', 59747, 5331, '2025-10-11T17:44:31.540Z', 'dd');

-- No data for table: quote_items

-- No data for table: quote_sequences

-- Data for table: quote_subservices
INSERT INTO quote_subservices (id, category_id, name, description, base_price, unit, is_active, created_at, updated_at) VALUES
  (1, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (2, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (3, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (4, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (5, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (6, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (7, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (8, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (9, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (10, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (11, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (12, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (13, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (14, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (15, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (16, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (17, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (18, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (19, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (20, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (21, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (22, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (23, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (24, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (25, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (26, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (27, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (28, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (29, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (30, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (31, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (32, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:31:42.639Z', '2025-10-02T17:31:42.639Z'),
  (33, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (34, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (35, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (36, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (37, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (38, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (39, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (40, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (41, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (42, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (43, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (44, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (45, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (46, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (47, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (48, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (49, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (50, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (51, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (52, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (53, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (54, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (55, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (56, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (57, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (58, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (59, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (60, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (61, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (62, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (63, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (64, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:32:14.739Z', '2025-10-02T17:32:14.739Z'),
  (65, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (66, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (67, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (68, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (69, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (70, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (71, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (72, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (73, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (74, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (75, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (76, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (77, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (78, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (79, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (80, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (81, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (82, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (83, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (84, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (85, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (86, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (87, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (88, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (89, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (90, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (91, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (92, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (93, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (94, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (95, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (96, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:32:18.835Z', '2025-10-02T17:32:18.835Z'),
  (97, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (98, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (99, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (100, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (101, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (102, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (103, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (104, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (105, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (106, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (107, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (108, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (109, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (110, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (111, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (112, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (113, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (114, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (115, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (116, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (117, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (118, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (119, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (120, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (121, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (122, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (123, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (124, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (125, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (126, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (127, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (128, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:32:22.297Z', '2025-10-02T17:32:22.297Z'),
  (129, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (130, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (131, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (132, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (133, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (134, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (135, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (136, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (137, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (138, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (139, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (140, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (141, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (142, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (143, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (144, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (145, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (146, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (147, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (148, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (149, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (150, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (151, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (152, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (153, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (154, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (155, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (156, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (157, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (158, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (159, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (160, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:36:27.079Z', '2025-10-02T17:36:27.079Z'),
  (161, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (162, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (163, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (164, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (165, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (166, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (167, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (168, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (169, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (170, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (171, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (172, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (173, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (174, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (175, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (176, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (177, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (178, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (179, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (180, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (181, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (182, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (183, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (184, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (185, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (186, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (187, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (188, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (189, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (190, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (191, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (192, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:36:30.524Z', '2025-10-02T17:36:30.524Z'),
  (193, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (194, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (195, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (196, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (197, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (198, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (199, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (200, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (201, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (202, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (203, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (204, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (205, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (206, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (207, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (208, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (209, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (210, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (211, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (212, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (213, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (214, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (215, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (216, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (217, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (218, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (219, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (220, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (221, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (222, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (223, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (224, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:36:34.874Z', '2025-10-02T17:36:34.874Z'),
  (225, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (226, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (227, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (228, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (229, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (230, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (231, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (232, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (233, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (234, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (235, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (236, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (237, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (238, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (239, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (240, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (241, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (242, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (243, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (244, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (245, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (246, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (247, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (248, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (249, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (250, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (251, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (252, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (253, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (254, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (255, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (256, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:39:03.487Z', '2025-10-02T17:39:03.487Z'),
  (257, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (258, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (259, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (260, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (261, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (262, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (263, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (264, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (265, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (266, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (267, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (268, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (269, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (270, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (271, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (272, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (273, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (274, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (275, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (276, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (277, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (278, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (279, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (280, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (281, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (282, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (283, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (284, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (285, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (286, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (287, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (288, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:39:05.870Z', '2025-10-02T17:39:05.870Z'),
  (289, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (290, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (291, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (292, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (293, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (294, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (295, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (296, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (297, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (298, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (299, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (300, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (301, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (302, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (303, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (304, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (305, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (306, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (307, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (308, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (309, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (310, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (311, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (312, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (313, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (314, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (315, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (316, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (317, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (318, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (319, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (320, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:44:21.033Z', '2025-10-02T17:44:21.033Z'),
  (321, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (322, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (323, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (324, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (325, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (326, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (327, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (328, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (329, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (330, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (331, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (332, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (333, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (334, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (335, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (336, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (337, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (338, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (339, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (340, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (341, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (342, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (343, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (344, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (345, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (346, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (347, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (348, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (349, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (350, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (351, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (352, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:44:35.649Z', '2025-10-02T17:44:35.649Z'),
  (353, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (354, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (355, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (356, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (357, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (358, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (359, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (360, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (361, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (362, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (363, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (364, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (365, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (366, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (367, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (368, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (369, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (370, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (371, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (372, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (373, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (374, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (375, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (376, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (377, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (378, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (379, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (380, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (381, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (382, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (383, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (384, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:44:44.346Z', '2025-10-02T17:44:44.346Z'),
  (385, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (386, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (387, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (388, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (389, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (390, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (391, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (392, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (393, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (394, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (395, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (396, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (397, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (398, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (399, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (400, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (401, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (402, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (403, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (404, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (405, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (406, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (407, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (408, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (409, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (410, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (411, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (412, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (413, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (414, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (415, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (416, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:45:11.884Z', '2025-10-02T17:45:11.884Z'),
  (417, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (418, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (419, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (420, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (421, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (422, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (423, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (424, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (425, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (426, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (427, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (428, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (429, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (430, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (431, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (432, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (433, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (434, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (435, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (436, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (437, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (438, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (439, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (440, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (441, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (442, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (443, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (444, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (445, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (446, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (447, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (448, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:48:27.542Z', '2025-10-02T17:48:27.542Z'),
  (449, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (450, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (451, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (452, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (453, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (454, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (455, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (456, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (457, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (458, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (459, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (460, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (461, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (462, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (463, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (464, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (465, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (466, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (467, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (468, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (469, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (470, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (471, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (472, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (473, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (474, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (475, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (476, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (477, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (478, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (479, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (480, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:48:33.087Z', '2025-10-02T17:48:33.087Z'),
  (481, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (482, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (483, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (484, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (485, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (486, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (487, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (488, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (489, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (490, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (491, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (492, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (493, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (494, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (495, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (496, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (497, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (498, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (499, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (500, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (501, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (502, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (503, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (504, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (505, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (506, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (507, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (508, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (509, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (510, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (511, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (512, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:54:07.817Z', '2025-10-02T17:54:07.817Z'),
  (513, 1, 'Granulometría de Suelos', 'Análisis de distribución de tamaños de partículas', '150.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (514, 1, 'Límites de Atterberg', 'Determinación de límite líquido, plástico y de contracción', '200.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (515, 1, 'Densidad de Suelos', 'Ensayo de densidad máxima y óptima', '180.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (516, 1, 'Resistencia al Corte', 'Ensayo triaxial y corte directo', '300.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (517, 1, 'Permeabilidad', 'Determinación de coeficiente de permeabilidad', '250.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (518, 1, 'Granulometría de Agregados', 'Análisis de distribución de tamaños', '120.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (519, 1, 'Absorción de Agregados', 'Determinación de absorción de agua', '100.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (520, 1, 'Densidad de Agregados', 'Ensayo de densidad aparente y real', '110.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (521, 1, 'Resistencia a la Abrasión', 'Ensayo Los Ángeles', '200.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (522, 1, 'Desgaste Los Ángeles', 'Ensayo de desgaste por abrasión', '180.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (523, 1, 'Resistencia a la Compresión', 'Ensayo de probetas de concreto', '80.00', 'probeta', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (524, 1, 'Slump Test', 'Ensayo de consistencia del concreto', '50.00', 'ensayo', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (525, 1, 'Densidad del Concreto', 'Determinación de densidad', '60.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (526, 1, 'Contenido de Aire', 'Determinación de aire incorporado', '70.00', 'ensayo', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (527, 1, 'Temperatura del Concreto', 'Control de temperatura en obra', '40.00', 'medición', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (528, 1, 'Penetración', 'Ensayo de penetración del asfalto', '120.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (529, 1, 'Punto de Ablandamiento', 'Ensayo de punto de ablandamiento', '100.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (530, 1, 'Ductilidad', 'Ensayo de ductilidad del asfalto', '150.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (531, 1, 'Viscosidad', 'Determinación de viscosidad', '180.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (532, 1, 'Peso Específico', 'Determinación de peso específico', '90.00', 'muestra', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (533, 2, 'Análisis Sísmico', 'Análisis sísmico de estructuras', '5000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (534, 2, 'Diseño de Cimentaciones', 'Diseño de cimentaciones superficiales y profundas', '8000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (535, 2, 'Análisis de Estabilidad', 'Análisis de estabilidad de taludes', '6000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (536, 2, 'Refuerzo Estructural', 'Diseño de refuerzo estructural', '4000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (537, 2, 'Evaluación de Estructuras', 'Evaluación técnica de estructuras existentes', '3000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (538, 2, 'Inspección Técnica', 'Inspección técnica de obras', '2000.00', 'día', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (539, 2, 'Asesoría en Construcción', 'Asesoría técnica durante construcción', '1500.00', 'día', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (540, 2, 'Control de Calidad', 'Control de calidad en obra', '1000.00', 'día', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (541, 2, 'Estudios de Factibilidad', 'Estudios de factibilidad técnica', '10000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (542, 2, 'Diseño de Infraestructura', 'Diseño de infraestructura civil', '15000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (543, 2, 'Análisis de Riesgos', 'Análisis de riesgos geotécnicos', '7000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z'),
  (544, 2, 'Planificación de Obras', 'Planificación y programación de obras', '5000.00', 'proyecto', true, '2025-10-02T17:55:32.475Z', '2025-10-02T17:55:32.475Z');

-- No data for table: quote_variants

-- No data for table: quote_versions

-- No data for table: quotes

-- Data for table: services
INSERT INTO services (id, name, area, created_at, code, description, norm_ntp, norm_astm, comments, category_id, is_active, subcategory_id, updated_at, price) VALUES
  (2, 'Ingeniería', 'ingenieria', '2025-09-25T15:26:19.426Z', NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T15:26:19.426Z', '0.00'),
  (5, 'ENSAYO ESTÁNDAR', 'laboratorio', '2025-09-25T22:24:30.837Z', 'EST', 'Ensayos estándar de laboratorio', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.837Z', '0.00'),
  (6, 'ENSAYOS ESPECIALES', 'laboratorio', '2025-09-25T22:24:30.839Z', 'ESP', 'Ensayos especiales de laboratorio', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.839Z', '0.00'),
  (7, 'ENSAYO AGREGADO', 'laboratorio', '2025-09-25T22:24:30.840Z', 'AGR', 'Ensayos de agregados', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.840Z', '0.00'),
  (8, 'ENSAYOS DE CAMPO', 'laboratorio', '2025-09-25T22:24:30.841Z', 'CAM', 'Ensayos de campo', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.841Z', '0.00'),
  (9, 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', 'laboratorio', '2025-09-25T22:24:30.841Z', 'QUI', 'Ensayos químicos de suelo y agua subterránea', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.841Z', '0.00'),
  (10, 'ENSAYO QUÍMICO AGREGADO', 'laboratorio', '2025-09-25T22:24:30.842Z', 'QAG', 'Ensayos químicos de agregados', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.842Z', '0.00'),
  (11, 'ENSAYO CONCRETO', 'laboratorio', '2025-09-25T22:24:30.843Z', 'CON', 'Ensayos de concreto', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.843Z', '0.00'),
  (12, 'ENSAYO ALBAÑILERÍA', 'laboratorio', '2025-09-25T22:24:30.844Z', 'ALB', 'Ensayos de albañilería', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.844Z', '0.00'),
  (13, 'ENSAYO ROCA', 'laboratorio', '2025-09-25T22:24:30.845Z', 'ROC', 'Ensayos de roca', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.845Z', '0.00'),
  (14, 'CEMENTO', 'laboratorio', '2025-09-25T22:24:30.846Z', 'CEM', 'Ensayos de cemento', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.846Z', '0.00'),
  (15, 'ENSAYO PAVIMENTO', 'laboratorio', '2025-09-25T22:24:30.847Z', 'PAV', 'Ensayos de pavimento', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.847Z', '0.00'),
  (16, 'ENSAYO ASFALTO', 'laboratorio', '2025-09-25T22:24:30.847Z', 'ASF', 'Ensayos de asfalto', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.847Z', '0.00'),
  (17, 'ENSAYO MEZCLA ASFÁLTICO', 'laboratorio', '2025-09-25T22:24:30.848Z', 'MAF', 'Ensayos de mezcla asfáltica', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.848Z', '0.00'),
  (18, 'EVALUACIONES ESTRUCTURALES', 'laboratorio', '2025-09-25T22:24:30.848Z', 'EST', 'Evaluaciones estructurales', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.848Z', '0.00'),
  (19, 'IMPLEMENTACIÓN LABORATORIO EN OBRA', 'laboratorio', '2025-09-25T22:24:30.849Z', 'IMP', 'Implementación de laboratorio en obra', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.849Z', '0.00'),
  (20, 'OTROS SERVICIOS', 'laboratorio', '2025-09-25T22:24:30.849Z', 'OTH', 'Otros servicios de laboratorio', NULL, NULL, NULL, NULL, true, NULL, '2025-09-25T22:24:30.849Z', '0.00');

-- No data for table: shipment_status

-- No data for table: shipments

-- Data for table: subcategories
INSERT INTO subcategories (id, category_id, name, created_at, description, is_active, updated_at) VALUES
  (2, 2, 'ENSAYOS DE CAMPO', '2025-09-25T13:33:09.262Z', 'Servicios de ensayos de campo', true, '2025-09-25T13:33:09.262Z'),
  (3, 2, 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', '2025-09-25T13:33:09.265Z', 'Servicios de ensayo químico suelo y agua subterráneo', true, '2025-09-25T13:33:09.265Z'),
  (4, 2, 'ENSAYO QUÍMICO AGREGADO', '2025-09-25T13:33:09.266Z', 'Servicios de ensayo químico agregado', true, '2025-09-25T13:33:09.266Z'),
  (5, 2, 'ENSAYOS EN SUELOS', '2025-09-25T13:33:09.268Z', 'Servicios de ensayos en suelos', true, '2025-09-25T13:33:09.268Z'),
  (6, 2, 'ENSAYOS EN CONCRETO', '2025-09-25T13:33:09.269Z', 'Servicios de ensayos en concreto', true, '2025-09-25T13:33:09.269Z'),
  (7, 2, 'ENSAYOS EN AGREGADO', '2025-09-25T13:33:09.270Z', 'Servicios de ensayos en agregado', true, '2025-09-25T13:33:09.270Z'),
  (8, 2, 'ENSAYOS EN LADRILLOS', '2025-09-25T13:33:09.271Z', 'Servicios de ensayos en ladrillos', true, '2025-09-25T13:33:09.271Z'),
  (9, 2, 'ENSAYOS EN MORTERO', '2025-09-25T13:33:09.272Z', 'Servicios de ensayos en mortero', true, '2025-09-25T13:33:09.272Z'),
  (10, 2, 'ENSAYOS EN VIGAS', '2025-09-25T13:33:09.273Z', 'Servicios de ensayos en vigas', true, '2025-09-25T13:33:09.273Z'),
  (11, 2, 'ENSAYOS EN PROBETAS', '2025-09-25T13:33:09.274Z', 'Servicios de ensayos en probetas', true, '2025-09-25T13:33:09.274Z'),
  (12, 2, 'ENSAYOS EN DENSIDAD', '2025-09-25T13:33:09.275Z', 'Servicios de ensayos en densidad', true, '2025-09-25T13:33:09.275Z'),
  (13, 2, 'ENSAYOS EN RESISTENCIA', '2025-09-25T13:33:09.276Z', 'Servicios de ensayos en resistencia', true, '2025-09-25T13:33:09.276Z'),
  (14, 2, 'ENSAYOS EN CEMENTO', '2025-09-25T13:33:09.277Z', 'Servicios de ensayos en cemento', true, '2025-09-25T13:33:09.277Z'),
  (15, 2, 'ENSAYOS EN PAVIMENTO', '2025-09-25T13:33:09.278Z', 'Servicios de ensayos en pavimento', true, '2025-09-25T13:33:09.278Z'),
  (16, 2, 'ENSAYOS EN ASFALTO', '2025-09-25T13:33:09.279Z', 'Servicios de ensayos en asfalto', true, '2025-09-25T13:33:09.279Z'),
  (17, 2, 'ENSAYOS EN MEZCLA ASFÁLTICO', '2025-09-25T13:33:09.280Z', 'Servicios de ensayos en mezcla asfáltico', true, '2025-09-25T13:33:09.280Z'),
  (18, 2, 'EVALUACIONES ESTRUCTURALES', '2025-09-25T13:33:09.281Z', 'Servicios de evaluaciones estructurales', true, '2025-09-25T13:33:09.281Z');

-- Data for table: subservices
INSERT INTO subservices (id, service_id, name, created_at, codigo, descripcion, norma, precio, is_active, updated_at) VALUES
  (1320, 5, 'Contenido de humedad con Speedy.', '2025-09-26T20:01:37.140Z', 'SU04', 'Contenido de humedad con Speedy.', 'NTP 339.25', '30.00', true, '2025-09-26T20:01:37.140Z'),
  (1321, 5, 'Ensayo de Penetración Estándar (SPT).', '2025-09-26T20:01:37.145Z', 'SU16', 'Ensayo de Penetración Estándar (SPT).', 'NTP 339.133', '0.00', true, '2025-09-26T20:01:37.145Z'),
  (1322, 5, 'Capacidad de carga del Suelo (Placa de Carga).', '2025-09-26T20:01:37.147Z', 'SU18', 'Capacidad de carga del Suelo (Placa de Carga).', 'ASTM D-1194', '2000.00', true, '2025-09-26T20:01:37.147Z'),
  (1323, 5, 'Próctor modificado (*).', '2025-09-26T20:01:37.148Z', 'SU19', 'Próctor modificado (*).', 'ASTM D1557-12 (Reapproved 2021)', '150.00', true, '2025-09-26T20:01:37.148Z'),
  (1324, 5, 'Contenido de humedad en suelos (*).', '2025-09-26T20:01:37.150Z', 'SU20', 'Contenido de humedad en suelos (*).', 'ASTM D2216-19', '30.00', true, '2025-09-26T20:01:37.150Z'),
  (1325, 5, 'Contenido de humedad en Roca.', '2025-09-26T20:01:37.152Z', 'SU20A', 'Contenido de humedad en Roca.', 'ASTM D2216-19', '30.00', true, '2025-09-26T20:01:37.152Z'),
  (1326, 5, 'Equivalente de arena (*).', '2025-09-26T20:01:37.153Z', 'SU21', 'Equivalente de arena (*).', 'ASTM D2419-22', '150.00', true, '2025-09-26T20:01:37.153Z'),
  (1327, 5, 'Clasificación suelo SUCS - AASHTO (*).', '2025-09-26T20:01:37.154Z', 'SU22', 'Clasificación suelo SUCS - AASHTO (*).', 'ASTM D2487-17 (Reapproved 2025) / ASTM D3282-24', '20.00', true, '2025-09-26T20:01:37.154Z'),
  (1328, 5, 'Límite líquido y Límite Plástico del Suelo (*).', '2025-09-26T20:01:37.155Z', 'SU23', 'Límite líquido y Límite Plástico del Suelo (*).', 'ASTM D4318-17*', '90.00', true, '2025-09-26T20:01:37.155Z'),
  (1329, 5, 'Análisis granulométrico por tamizado en Suelo (*).', '2025-09-26T20:01:37.156Z', 'SU24', 'Análisis granulométrico por tamizado en Suelo (*).', 'ASTM D6913/D6913M-17', '100.00', true, '2025-09-26T20:01:37.156Z'),
  (1330, 5, 'Método de prueba estándar para la medición de sólidos en agua.', '2025-09-26T20:01:37.157Z', 'SU27', 'Método de prueba estándar para la medición de sólidos en agua.', 'ASTM C1603', '120.00', true, '2025-09-26T20:01:37.157Z'),
  (1331, 5, 'Ensayo de Compactación Próctor Estándar.', '2025-09-26T20:01:37.159Z', 'SU30', 'Ensayo de Compactación Próctor Estándar.', 'ASTM D698', '150.00', true, '2025-09-26T20:01:37.159Z'),
  (1332, 5, 'Corrección de Peso Unitario para Partícula de gran tamaño.', '2025-09-26T20:01:37.159Z', 'SU31', 'Corrección de Peso Unitario para Partícula de gran tamaño.', 'ASTM D4718-87', '20.00', true, '2025-09-26T20:01:37.159Z'),
  (1333, 5, 'Gravedad específica de los sólidos del suelo.', '2025-09-26T20:01:37.162Z', 'SU32', 'Gravedad específica de los sólidos del suelo.', 'ASTM D854-14', '120.00', true, '2025-09-26T20:01:37.162Z'),
  (1334, 5, 'Densidad y peso unitario de muestra suelo.', '2025-09-26T20:01:37.162Z', 'SU34', 'Densidad y peso unitario de muestra suelo.', 'ASTM D 7263', '70.00', true, '2025-09-26T20:01:37.162Z'),
  (1335, 5, 'Densidad del peso unitario máximo del suelo.', '2025-09-26T20:01:37.164Z', 'SU35', 'Densidad del peso unitario máximo del suelo.', 'NTP 339.137', '350.00', true, '2025-09-26T20:01:37.164Z'),
  (1336, 5, 'Densidad del peso unitario mínimo del suelo.', '2025-09-26T20:01:37.165Z', 'SU36', 'Densidad del peso unitario mínimo del suelo.', 'NTP 339.138', '150.00', true, '2025-09-26T20:01:37.165Z'),
  (1337, 5, 'Determinación de sólidos totales suspendidos.', '2025-09-26T20:01:37.166Z', 'SU38', 'Determinación de sólidos totales suspendidos.', 'NTP 214.039', '150.00', true, '2025-09-26T20:01:37.166Z'),
  (1338, 5, 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', '2025-09-26T20:01:37.167Z', 'SU39', 'Análisis granulométrico por hidrómetro (incl. Granulometría por tamizado).', 'NTP 339.128 1999 (revisada el 2019)', '350.00', true, '2025-09-26T20:01:37.167Z'),
  (1339, 5, 'Conductividad térmica / Resistividad térmica.', '2025-09-26T20:01:37.168Z', 'SU40', 'Conductividad térmica / Resistividad térmica.', 'ASTM D5334-14', '1500.00', true, '2025-09-26T20:01:37.168Z'),
  (1364, 6, 'Compresión no confinada.', '2025-09-26T20:06:19.853Z', 'SU33', 'Compresión no confinada.', 'NTP 339.167', '250.00', true, '2025-09-26T20:06:19.853Z'),
  (1365, 6, 'California Bearing Ratio (CBR) (*).', '2025-09-26T20:06:19.858Z', 'SU37', 'California Bearing Ratio (CBR) (*).', 'ASTM D1883-21', '300.00', true, '2025-09-26T20:06:19.858Z'),
  (1366, 6, 'Corte Directo.', '2025-09-26T20:06:19.859Z', 'SU05', 'Corte Directo.', 'NTP 339.171', '350.00', true, '2025-09-26T20:06:19.859Z'),
  (1367, 6, 'Conductividad eléctrica.', '2025-09-26T20:06:19.859Z', 'EE01', 'Conductividad eléctrica.', '-', '250.00', true, '2025-09-26T20:06:19.859Z'),
  (1368, 6, 'Resistividad eléctrica.', '2025-09-26T20:06:19.860Z', 'EE02', 'Resistividad eléctrica.', 'Electrodo', '550.00', true, '2025-09-26T20:06:19.860Z'),
  (1369, 6, 'Compresión inconfinada en suelos cohesivos.', '2025-09-26T20:06:19.861Z', 'EE03', 'Compresión inconfinada en suelos cohesivos.', 'ASTM D2166', '190.00', true, '2025-09-26T20:06:19.861Z'),
  (1370, 6, 'Compresión triaxial no consolidado no drenado UU.', '2025-09-26T20:06:19.862Z', 'EE04', 'Compresión triaxial no consolidado no drenado UU.', 'ASTM D2850', '1500.00', true, '2025-09-26T20:06:19.862Z'),
  (1371, 6, 'Compresión triaxial consolidado no drenado CU.', '2025-09-26T20:06:19.863Z', 'EE05', 'Compresión triaxial consolidado no drenado CU.', 'ASTM D4767', '2000.00', true, '2025-09-26T20:06:19.863Z'),
  (1372, 6, 'Compresión triaxial consolidado drenado CD.', '2025-09-26T20:06:19.864Z', 'EE06', 'Compresión triaxial consolidado drenado CD.', 'ASTM D7181', '0.00', true, '2025-09-26T20:06:19.864Z'),
  (1373, 6, 'Colapso.', '2025-09-26T20:06:19.866Z', 'EE07', 'Colapso.', 'ASTM D5333', '370.00', true, '2025-09-26T20:06:19.866Z'),
  (1374, 6, 'Consolidación unidimensional.', '2025-09-26T20:06:19.866Z', 'EE08', 'Consolidación unidimensional.', 'ASTM D2435', '800.00', true, '2025-09-26T20:06:19.866Z'),
  (1375, 6, 'Expansión libre.', '2025-09-26T20:06:19.867Z', 'EE09', 'Expansión libre.', 'ASTM D4546', '350.00', true, '2025-09-26T20:06:19.867Z'),
  (1376, 6, 'Expansión controlada Método A.', '2025-09-26T20:06:19.867Z', 'EE10', 'Expansión controlada Método A.', 'ASTM D4546', '670.00', true, '2025-09-26T20:06:19.867Z'),
  (1377, 6, 'Conductividad hidráulica en pared flexible (Permeabilidad).', '2025-09-26T20:06:19.868Z', 'EE11', 'Conductividad hidráulica en pared flexible (Permeabilidad).', 'ASTM D5084', '640.00', true, '2025-09-26T20:06:19.868Z'),
  (1378, 6, 'Conductividad hidráulica en pared rígida (Permeabilidad).', '2025-09-26T20:06:19.868Z', 'EE12', 'Conductividad hidráulica en pared rígida (Permeabilidad).', 'ASTM D2434', '530.00', true, '2025-09-26T20:06:19.868Z'),
  (1379, 6, 'Ensayo resistividad eléctrica (5 perfiles).', '2025-09-26T20:06:19.869Z', 'EE13', 'Ensayo resistividad eléctrica (5 perfiles).', '-', '700.00', true, '2025-09-26T20:06:19.869Z'),
  (1380, 6, 'Conductividad térmica / Resistividad térmica.', '2025-09-26T20:06:19.870Z', 'EE14', 'Conductividad térmica / Resistividad térmica.', 'ASTM D5334-14', '1500.00', true, '2025-09-26T20:06:19.870Z'),
  (1381, 7, 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.', '2025-09-26T20:09:04.348Z', 'AG08A', 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.', 'NTP 400.016', '350.00', true, '2025-09-26T20:09:04.348Z'),
  (1382, 7, 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.', '2025-09-26T20:09:04.355Z', 'AG08B', 'Inalterabilidad Agregado Fino con Sulfato de Magnesio.', 'NTP 400.016', '350.00', true, '2025-09-26T20:09:04.355Z'),
  (1383, 7, 'Índice de Durabilidad Agregado.', '2025-09-26T20:09:04.357Z', 'AG09', 'Índice de Durabilidad Agregado.', 'MTC E-214', '350.00', true, '2025-09-26T20:09:04.357Z'),
  (1384, 7, 'Gravedad específica y absorción del agregado fino (*).', '2025-09-26T20:09:04.359Z', 'AG18', 'Gravedad específica y absorción del agregado fino (*).', 'ASTM C128-22', '150.00', true, '2025-09-26T20:09:04.359Z'),
  (1385, 7, 'Análisis granulométrico por tamizado en agregado (*).', '2025-09-26T20:09:04.360Z', 'AG19', 'Análisis granulométrico por tamizado en agregado (*).', 'ASTM C136/C136M-19', '100.00', true, '2025-09-26T20:09:04.360Z'),
  (1386, 7, 'Contenido de humedad en agregado (*).', '2025-09-26T20:09:04.361Z', 'AG20', 'Contenido de humedad en agregado (*).', 'ASTM C566-19', '30.00', true, '2025-09-26T20:09:04.361Z'),
  (1387, 7, 'Peso Unitario y Vacío de agregados (*).', '2025-09-26T20:09:04.362Z', 'AG22', 'Peso Unitario y Vacío de agregados (*).', 'ASTM C29/C29M-23', '120.00', true, '2025-09-26T20:09:04.362Z'),
  (1388, 7, 'Pasante de la malla No.200 (*).', '2025-09-26T20:09:04.363Z', 'AG23', 'Pasante de la malla No.200 (*).', 'ASTM C117-23', '120.00', true, '2025-09-26T20:09:04.363Z'),
  (1389, 7, 'Abrasión los Ángeles de agregado grueso de gran tamaño (*).', '2025-09-26T20:09:04.364Z', 'AG26', 'Abrasión los Ángeles de agregado grueso de gran tamaño (*).', 'ASTM C535-16 (Reapproved 2024)', '350.00', true, '2025-09-26T20:09:04.364Z'),
  (1390, 7, 'Gravedad especifica y absorción de agregado grueso (*).', '2025-09-26T20:09:04.365Z', 'AG28', 'Gravedad especifica y absorción de agregado grueso (*).', 'ASTM C127-24', '120.00', true, '2025-09-26T20:09:04.365Z'),
  (1391, 7, 'Índice de espesor del agregado grueso.', '2025-09-26T20:09:04.366Z', 'AG31', 'Índice de espesor del agregado grueso.', 'NTP 400.041', '90.00', true, '2025-09-26T20:09:04.366Z'),
  (1392, 7, 'Carbón y Lignito en agregado fino (OBSOLETO)', '2025-09-26T20:09:04.367Z', 'AG32', 'Carbón y Lignito en agregado fino (OBSOLETO)', 'MTC E215', '120.00', true, '2025-09-26T20:09:04.367Z'),
  (1393, 7, 'Angularidad del agregado fino.', '2025-09-26T20:09:04.367Z', 'AG33', 'Angularidad del agregado fino.', 'MTC E222', '120.00', true, '2025-09-26T20:09:04.367Z'),
  (1394, 7, 'Partículas planas y alargadas en agregado grueso (*).', '2025-09-26T20:09:04.368Z', 'AG34', 'Partículas planas y alargadas en agregado grueso (*).', 'ASTM D4791-19 (Reapproved 2023)', '120.00', true, '2025-09-26T20:09:04.368Z'),
  (1395, 7, 'Porcentaje de Caras fracturadas en agregado grueso (*).', '2025-09-26T20:09:04.369Z', 'AG35', 'Porcentaje de Caras fracturadas en agregado grueso (*).', 'ASTM D5821-13 (Reapproved 2017)', '120.00', true, '2025-09-26T20:09:04.369Z'),
  (1396, 7, 'Abrasión los Ángeles de agregado grueso de tamaño pequeño (*).', '2025-09-26T20:09:04.369Z', 'AG36', 'Abrasión los Ángeles de agregado grueso de tamaño pequeño (*).', 'ASTM C131/C131M-20', '250.00', true, '2025-09-26T20:09:04.369Z'),
  (1397, 8, 'Ensayo de penetración dinámica DPL.', '2025-09-26T20:11:41.667Z', 'SU02', 'Ensayo de penetración dinámica DPL.', 'NTP 339.159', '0.00', true, '2025-09-26T20:11:41.667Z'),
  (1398, 8, 'Infiltración de suelos en campo.', '2025-09-26T20:11:41.670Z', 'SU29', 'Infiltración de suelos en campo.', 'ASTM D3385', '3500.00', true, '2025-09-26T20:11:41.670Z'),
  (1400, 8, 'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear).', '2025-09-26T20:11:41.702Z', 'SU41', 'Determinación de la densidad de suelo en terreno (Método Densímetro Nuclear).', 'ASTM D2922', '90.00', true, '2025-09-26T20:11:41.702Z'),
  (1401, 8, 'Densidad del suelo IN-SITU, Cono de Arena 6" (*).', '2025-09-26T20:11:41.710Z', 'SU06A', 'Densidad del suelo IN-SITU, Cono de Arena 6" (*).', 'NTP 339.143:1999 (revisada el 2019)', '50.00', true, '2025-09-26T20:11:41.710Z'),
  (1402, 8, 'Densidad del suelo IN-SITU, Cono de Arena 12".', '2025-09-26T20:11:41.711Z', 'SU06B', 'Densidad del suelo IN-SITU, Cono de Arena 12".', 'NTP 339.143:1999 (revisada el 2019)', '80.00', true, '2025-09-26T20:11:41.711Z'),
  (1403, 8, 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal tecnico, por día.', '2025-09-26T20:11:41.712Z', 'SU06C', 'Control de calidad de suelo con Cono de arena 6", contenido de humedad con equipo Speedy, y personal tecnico, por día.', 'NTP 339.143:1999 (revisada el 2019)', '400.00', true, '2025-09-26T20:11:41.712Z'),
  (1404, 8, 'Densidad del suelo y roca IN SITU por reemplazo de agua.', '2025-09-26T20:11:41.712Z', 'SU28', 'Densidad del suelo y roca IN SITU por reemplazo de agua.', 'ASTM D5030', '0.00', true, '2025-09-26T20:11:41.712Z'),
  (1405, 9, 'Determinación del PH en Suelo y Agua.', '2025-09-26T20:14:06.711Z', 'SU03', 'Determinación del PH en Suelo y Agua.', 'NTP 339.176', '70.00', true, '2025-09-26T20:14:06.711Z'),
  (1406, 9, 'Sales solubles en Suelos y Agua.', '2025-09-26T20:14:06.717Z', 'SU13', 'Sales solubles en Suelos y Agua.', 'NTP 339.152', '80.00', true, '2025-09-26T20:14:06.717Z'),
  (1407, 9, 'Cloruros Solubles en Suelos y Agua.', '2025-09-26T20:14:06.718Z', 'SU14', 'Cloruros Solubles en Suelos y Agua.', 'NTP 339.177', '80.00', true, '2025-09-26T20:14:06.718Z'),
  (1408, 9, 'Sulfatos Solubles en Suelos y Agua.', '2025-09-26T20:14:06.719Z', 'SU15', 'Sulfatos Solubles en Suelos y Agua.', 'NTP 339.178', '120.00', true, '2025-09-26T20:14:06.719Z'),
  (1409, 9, 'Contenido de materia orgánica.', '2025-09-26T20:14:06.720Z', 'SU26', 'Contenido de materia orgánica.', 'AASHTO T267', '120.00', true, '2025-09-26T20:14:06.720Z'),
  (1410, 10, 'Contenido Sales solubles, fino o grueso.', '2025-09-26T20:18:16.653Z', 'AG11', 'Contenido Sales solubles, fino o grueso.', 'MTC E-219', '150.00', true, '2025-09-26T20:18:16.653Z'),
  (1411, 10, 'Contenido de cloruros solubles.', '2025-09-26T20:18:16.659Z', 'AG16', 'Contenido de cloruros solubles.', 'NTP 400.042', '90.00', true, '2025-09-26T20:18:16.659Z'),
  (1412, 10, 'Contenido de sulfatos solubles.', '2025-09-26T20:18:16.660Z', 'AG17', 'Contenido de sulfatos solubles.', 'NTP 400.042', '150.00', true, '2025-09-26T20:18:16.660Z'),
  (1413, 10, 'Valor de azul de metileno.', '2025-09-26T20:18:16.661Z', 'AG29', 'Valor de azul de metileno.', 'AASHTO TP57', '150.00', true, '2025-09-26T20:18:16.661Z'),
  (1414, 10, 'Reactividad agregado alcálisis.', '2025-09-26T20:18:16.663Z', 'AG30', 'Reactividad agregado alcálisis.', 'ASTM C289-07', '650.00', true, '2025-09-26T20:18:16.663Z'),
  (1415, 10, 'Partículas Liviana en los agregados (carbon y lignito), Fino o grueso.', '2025-09-26T20:18:16.664Z', 'AG24', 'Partículas Liviana en los agregados (carbon y lignito), Fino o grueso.', 'NTP 400.023', '220.00', true, '2025-09-26T20:18:16.664Z'),
  (1416, 10, 'Terrones de arcilla y partículas friables, Fino o grueso.', '2025-09-26T20:18:16.666Z', 'AG25', 'Terrones de arcilla y partículas friables, Fino o grueso.', 'NTP 400.015', '120.00', true, '2025-09-26T20:18:16.666Z'),
  (1417, 10, 'Adherencia en agregado fino - Riedel Weber.', '2025-09-26T20:18:16.667Z', 'AG12', 'Adherencia en agregado fino - Riedel Weber.', 'MTC E 220', '150.00', true, '2025-09-26T20:18:16.667Z'),
  (1418, 10, 'Impurezas Orgánicas en los áridos finos.', '2025-09-26T20:18:16.667Z', 'AG13', 'Impurezas Orgánicas en los áridos finos.', 'ASTM C40-99', '150.00', true, '2025-09-26T20:18:16.667Z'),
  (1419, 11, 'Resistencia a la compresión de probetas cilindricas de concreto (Incluye Curado)(*).', '2025-09-26T20:20:30.273Z', 'CO01', 'Resistencia a la compresión de probetas cilindricas de concreto (Incluye Curado)(*).', 'ASTM C39/C39M-24', '15.00', true, '2025-09-26T20:20:30.273Z'),
  (1420, 11, 'Resistencia a la compresión de probetas cilindricas de concreto, se ensayaran 3 probetas a 7 días y 3 probetas a 28 días, suministro equipo, curado y recojo. (*)', '2025-09-26T20:20:30.279Z', 'CO01.01', 'Resistencia a la compresión de probetas cilindricas de concreto, se ensayaran 3 probetas a 7 días y 3 probetas a 28 días, suministro equipo, curado y recojo. (*)', 'ASTM C39/C39M-24', '90.00', true, '2025-09-26T20:20:30.279Z'),
  (1421, 11, 'Extracción, tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', '2025-09-26T20:20:30.280Z', 'CO03A', 'Extracción, tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059', '250.00', true, '2025-09-26T20:20:30.280Z'),
  (1422, 11, 'Resane de estructura a causa de la extracción de diamantino.', '2025-09-26T20:20:30.281Z', 'CO03B', 'Resane de estructura a causa de la extracción de diamantino.', '-', '300.00', true, '2025-09-26T20:20:30.281Z'),
  (1423, 11, 'Extracción de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', '2025-09-26T20:20:30.282Z', 'CO03C', 'Extracción de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059', '200.00', true, '2025-09-26T20:20:30.282Z'),
  (1424, 11, 'Tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', '2025-09-26T20:20:30.283Z', 'CO03D', 'Tallado, refrentado y ensayo de compresión de testigos diamantino de concreto con BROCA de 2" o 3" o 4".', 'NTP 339.059 ASTM C39/C39M-24', '100.00', true, '2025-09-26T20:20:30.283Z'),
  (1425, 11, 'Extracción de diamantina de concreto asfaltico y su evaluación', '2025-09-26T20:20:30.285Z', 'CO03G', 'Extracción de diamantina de concreto asfaltico y su evaluación', 'NTP 339.059', '140.00', true, '2025-09-26T20:20:30.285Z'),
  (1426, 11, 'Esclerometría.', '2025-09-26T20:20:30.285Z', 'CO04', 'Esclerometría.', 'NTP 339.181', '80.00', true, '2025-09-26T20:20:30.285Z'),
  (1427, 11, 'Muestreo del concreto fresco', '2025-09-26T20:20:30.287Z', 'CO05', 'Muestreo del concreto fresco', 'NTP 339.036', '250.00', true, '2025-09-26T20:20:30.287Z'),
  (1428, 11, 'Procedimiento para la medicion asentamiento', '2025-09-26T20:20:30.287Z', 'CO06', 'Procedimiento para la medicion asentamiento', 'NTP 339-035', '0.00', true, '2025-09-26T20:20:30.287Z'),
  (1429, 11, 'Resistencia a la Flexión del concreto.', '2025-09-26T20:20:30.289Z', 'CO07', 'Resistencia a la Flexión del concreto.', 'NTP 339.078/079', '100.00', true, '2025-09-26T20:20:30.289Z'),
  (1430, 11, 'Resistencia a la compresión de mortero con especimen cubicos de 50 mm.', '2025-09-26T20:20:30.289Z', 'CO08', 'Resistencia a la compresión de mortero con especimen cubicos de 50 mm.', 'NTP 334.051', '20.00', true, '2025-09-26T20:20:30.289Z'),
  (1432, 11, 'Determinación PH concreto endurecido / Carbonatación.', '2025-09-26T20:20:30.323Z', 'CO10', 'Determinación PH concreto endurecido / Carbonatación.', 'ASTM D1293', '100.00', true, '2025-09-26T20:20:30.323Z'),
  (1433, 11, 'Control de calidad del concreto fresco en obra: * Muestreo de concreto fresco cant. 6 probetas * Ensayo asentamiento del concreto (Slump) * Control de temperatura en el concreto * Resistencia a la compresión', '2025-09-26T20:20:30.329Z', 'CO11', 'Control de calidad del concreto fresco en obra: * Muestreo de concreto fresco cant. 6 probetas * Ensayo asentamiento del concreto (Slump) * Control de temperatura en el concreto * Resistencia a la compresión', '-', '250.00', true, '2025-09-26T20:20:30.329Z'),
  (1434, 11, 'Compresión de testigos cilíndricos de concreto (*).', '2025-09-26T20:20:30.330Z', 'CO12', 'Compresión de testigos cilíndricos de concreto (*).', 'ASTM C39/C39M-24', '15.00', true, '2025-09-26T20:20:30.330Z'),
  (1435, 11, 'Ensayo Carbonatación.', '2025-09-26T20:20:30.331Z', 'CO13', 'Ensayo Carbonatación.', 'ASTM D129', '50.00', true, '2025-09-26T20:20:30.331Z'),
  (1436, 11, 'Resistencia tracción simple por compresión diametral.', '2025-09-26T20:20:30.332Z', 'CO14', 'Resistencia tracción simple por compresión diametral.', 'NTP 339.084', '25.00', true, '2025-09-26T20:20:30.332Z'),
  (1437, 11, 'Determinar el pH de las aguas usadas para elaborar morteros y concretos.', '2025-09-26T20:20:30.332Z', 'CO15', 'Determinar el pH de las aguas usadas para elaborar morteros y concretos.', 'NTP 334.190:2016', '100.00', true, '2025-09-26T20:20:30.332Z'),
  (1438, 11, 'Determinar el contenido de sulfatos en las aguas usadas en la elaboración de morteros y concretos de cemento Pórtland.', '2025-09-26T20:20:30.333Z', 'CO16', 'Determinar el contenido de sulfatos en las aguas usadas en la elaboración de morteros y concretos de cemento Pórtland.', 'NTP 339.227:2016', '120.00', true, '2025-09-26T20:20:30.333Z'),
  (1439, 11, 'Determinar el contenido del ion cloruro en las aguas usadas en la elaboración de concretos y morteros de cemento Pórtland.', '2025-09-26T20:20:30.334Z', 'CO17', 'Determinar el contenido del ion cloruro en las aguas usadas en la elaboración de concretos y morteros de cemento Pórtland.', 'NTP 339.076:2017', '120.00', true, '2025-09-26T20:20:30.334Z'),
  (1440, 11, 'Corte y refrentado de Testigo de concreto', '2025-09-26T20:20:30.335Z', 'CO18', 'Corte y refrentado de Testigo de concreto', '-', '20.00', true, '2025-09-26T20:20:30.335Z'),
  (1441, 11, 'Verificación diseño de mezcla.', '2025-09-26T20:20:30.336Z', 'DIS01', 'Verificación diseño de mezcla.', '-', '250.00', true, '2025-09-26T20:20:30.336Z'),
  (1442, 11, 'Verificación diseño de mezcla con aditivo.', '2025-09-26T20:20:30.337Z', 'DIS02', 'Verificación diseño de mezcla con aditivo.', '-', '500.00', true, '2025-09-26T20:20:30.337Z'),
  (1443, 11, 'Verificación de diseño de concreto, elaboración de 3 probetas que se ensayaran a 7 días.', '2025-09-26T20:20:30.338Z', 'DIS03', 'Verificación de diseño de concreto, elaboración de 3 probetas que se ensayaran a 7 días.', 'ACI 211', '200.00', true, '2025-09-26T20:20:30.338Z'),
  (1444, 11, 'Diseño de mezcla Teórico.', '2025-09-26T20:20:30.338Z', 'DIS04', 'Diseño de mezcla Teórico.', '-', '100.00', true, '2025-09-26T20:20:30.338Z'),
  (1445, 11, 'Refrentado de probetas cilíndricas de concreto (por cara).', '2025-09-26T20:20:30.339Z', 'CO19', 'Refrentado de probetas cilíndricas de concreto (por cara).', 'ASTM C617/C617M-23', '15.00', true, '2025-09-26T20:20:30.339Z'),
  (1446, 11, 'Compresión / Unidades de adoquines de concreto.', '2025-09-26T20:20:30.341Z', 'COM01', 'Compresión / Unidades de adoquines de concreto.', 'NTP 339.604', '150.00', true, '2025-09-26T20:20:30.341Z'),
  (1447, 11, 'Absorción / Unidades de adoquines de concreto.', '2025-09-26T20:20:30.342Z', 'ABS01', 'Absorción / Unidades de adoquines de concreto.', 'NTP 339.604', '150.00', true, '2025-09-26T20:20:30.342Z'),
  (1448, 12, 'Absorción / Unidades de albañilería de Arcilla.', '2025-09-26T20:21:33.223Z', 'ALB01', 'Absorción / Unidades de albañilería de Arcilla.', 'NTP 399.613', '130.00', true, '2025-09-26T20:21:33.223Z'),
  (1449, 12, 'Alabeo / Unidades de albañilería de Arcilla.', '2025-09-26T20:21:33.228Z', 'ALB02', 'Alabeo / Unidades de albañilería de Arcilla.', 'NTP 399.613', '130.00', true, '2025-09-26T20:21:33.228Z'),
  (1450, 12, 'Compresión / Unidades de albañilería de Arcilla.', '2025-09-26T20:21:33.231Z', 'ALB03', 'Compresión / Unidades de albañilería de Arcilla.', 'NTP 399.613', '200.00', true, '2025-09-26T20:21:33.231Z'),
  (1451, 12, 'Eflorescencia / Unidades de albañilería de Arcilla.', '2025-09-26T20:21:33.233Z', 'ALB04', 'Eflorescencia / Unidades de albañilería de Arcilla.', 'NTP 399.613', '130.00', true, '2025-09-26T20:21:33.233Z'),
  (1453, 12, 'Dimensionamiento / Unidades de albañilería de Arcilla.', '2025-09-26T20:21:33.270Z', 'ALB05', 'Dimensionamiento / Unidades de albañilería de Arcilla.', 'NTP 399.613', '130.00', true, '2025-09-26T20:21:33.270Z'),
  (1454, 12, 'Medidas del área de vacíos en unidades perforadas.', '2025-09-26T20:21:33.277Z', 'ALB06', 'Medidas del área de vacíos en unidades perforadas.', 'NTP 399.613', '150.00', true, '2025-09-26T20:21:33.277Z'),
  (1455, 12, 'Ensayo de Compresión en pilas de ladrillo (prisma albañilería).', '2025-09-26T20:21:33.278Z', 'ALB07', 'Ensayo de Compresión en pilas de ladrillo (prisma albañilería).', 'NTP 399.605', '250.00', true, '2025-09-26T20:21:33.278Z'),
  (1456, 12, 'Muestreo / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.279Z', 'ALB08', 'Muestreo / Unidades de albañilería de concreto.', 'NTP 399.604', '350.00', true, '2025-09-26T20:21:33.279Z'),
  (1457, 12, 'Resistencia a la compresión / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.280Z', 'ALB09', 'Resistencia a la compresión / Unidades de albañilería de concreto.', 'NTP 399.604', '250.00', true, '2025-09-26T20:21:33.280Z'),
  (1458, 12, 'Dimensionamiento / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.281Z', 'ALB10', 'Dimensionamiento / Unidades de albañilería de concreto.', 'NTP 399.604', '150.00', true, '2025-09-26T20:21:33.281Z'),
  (1459, 12, 'Absorción / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.282Z', 'ALB11', 'Absorción / Unidades de albañilería de concreto.', 'NTP 399.604', '150.00', true, '2025-09-26T20:21:33.282Z'),
  (1460, 12, 'Absorción / Ladrillo pastelero', '2025-09-26T20:21:33.283Z', 'ALB12', 'Absorción / Ladrillo pastelero', 'NTP 331.041', '130.00', true, '2025-09-26T20:21:33.283Z'),
  (1461, 12, 'Modulo de rotura (Ensayo Flexión) / Unidades de albañilería de Arcilla', '2025-09-26T20:21:33.284Z', 'ALB13', 'Modulo de rotura (Ensayo Flexión) / Unidades de albañilería de Arcilla', 'NTP 399.613', '200.00', true, '2025-09-26T20:21:33.284Z'),
  (1462, 12, 'Contenido de humedad / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.285Z', 'ALB14', 'Contenido de humedad / Unidades de albañilería de concreto.', 'NTP 399.604', '100.00', true, '2025-09-26T20:21:33.285Z'),
  (1463, 12, 'Densidad / Unidades de albañilería de concreto.', '2025-09-26T20:21:33.286Z', 'ALB15', 'Densidad / Unidades de albañilería de concreto.', 'NTP 399.604', '150.00', true, '2025-09-26T20:21:33.286Z'),
  (1464, 12, 'Dimensionamiento / Ladrillo pastelero', '2025-09-26T20:21:33.288Z', 'ALB16', 'Dimensionamiento / Ladrillo pastelero', 'NTP 331.041', '130.00', true, '2025-09-26T20:21:33.288Z'),
  (1465, 12, 'Alabeo / Ladrillo pastelero', '2025-09-26T20:21:33.289Z', 'ALB17', 'Alabeo / Ladrillo pastelero', 'NTP 331.041', '130.00', true, '2025-09-26T20:21:33.289Z'),
  (1466, 12, 'Carga de rotura por unidad de ancho / Ladrillo pastelero', '2025-09-26T20:21:33.290Z', 'ALB18', 'Carga de rotura por unidad de ancho / Ladrillo pastelero', 'NTP 331.041', '200.00', true, '2025-09-26T20:21:33.290Z'),
  (1467, 13, 'Carga Puntual (incluye tallado y ensayo 10 especimenes).', '2025-09-26T20:27:18.634Z', 'RO01', 'Carga Puntual (incluye tallado y ensayo 10 especimenes).', 'ASTM D 5731', '500.00', true, '2025-09-26T20:27:18.634Z'),
  (1468, 13, 'Gravedad especifica y absorción de roca.', '2025-09-26T20:27:18.640Z', 'RO02', 'Gravedad especifica y absorción de roca.', 'ASTM D 6473', '250.00', true, '2025-09-26T20:27:18.640Z'),
  (1469, 13, 'Densidad y peso unitario de muestra roca.', '2025-09-26T20:27:18.641Z', 'RO03', 'Densidad y peso unitario de muestra roca.', 'ASTM D 7263', '250.00', true, '2025-09-26T20:27:18.641Z'),
  (1470, 13, 'Método de prueba para la resistencia a la compresión (uniaxial) - Método C', '2025-09-26T20:27:18.643Z', 'RO04', 'Método de prueba para la resistencia a la compresión (uniaxial) - Método C', 'ASTM D 7012-14e1', '400.00', true, '2025-09-26T20:27:18.643Z'),
  (1471, 15, 'Medida de la Irregularidad superficial de un pavimento con el Rugosímetro Merlín.', '2025-09-26T20:28:37.039Z', 'PAV01', 'Medida de la Irregularidad superficial de un pavimento con el Rugosímetro Merlín.', 'MTC E 1001', '2400.00', true, '2025-09-26T20:28:37.039Z'),
  (1472, 15, 'Medida de la deflexión de un pavimento flexible (Viga Benkelman).', '2025-09-26T20:28:37.045Z', 'PAV02', 'Medida de la deflexión de un pavimento flexible (Viga Benkelman).', 'MTC E 1002', '3000.00', true, '2025-09-26T20:28:37.045Z'),
  (1473, 15, 'Medida de la deflexión de un pavimento flexible (Viga Benkelman) Inc. Camión.', '2025-09-26T20:28:37.046Z', 'PAV02A', 'Medida de la deflexión de un pavimento flexible (Viga Benkelman) Inc. Camión.', 'MTC E 1002', '5000.00', true, '2025-09-26T20:28:37.046Z'),
  (1474, 15, 'Determinacion del Coeficiente de Resistencia al Deslizamiento (Péndulo).', '2025-09-26T20:28:37.048Z', 'PAV03', 'Determinacion del Coeficiente de Resistencia al Deslizamiento (Péndulo).', 'MTC E 1004', '150.00', true, '2025-09-26T20:28:37.048Z'),
  (1475, 15, 'Determinación la Textura Superficial del Pavimento (Círculo de Arena).', '2025-09-26T20:28:37.049Z', 'PAV04', 'Determinación la Textura Superficial del Pavimento (Círculo de Arena).', 'MTC E 1005', '80.00', true, '2025-09-26T20:28:37.049Z'),
  (1476, 15, 'Tasa de Imprimación y Riego de Liga.', '2025-09-26T20:28:37.050Z', 'PAV05', 'Tasa de Imprimación y Riego de Liga.', '-', '100.00', true, '2025-09-26T20:28:37.050Z'),
  (1477, 15, 'Espesor de especímenes de mezcla asfálticas compactado.', '2025-09-26T20:28:37.051Z', 'PAV06', 'Espesor de especímenes de mezcla asfálticas compactado.', 'MTC E 507', '50.00', true, '2025-09-26T20:28:37.051Z'),
  (1478, 15, 'Peso específico y peso unitario de mezcla asfálticas compactado en especímenes saturados con superficie seca.', '2025-09-26T20:28:37.052Z', 'PAV07', 'Peso específico y peso unitario de mezcla asfálticas compactado en especímenes saturados con superficie seca.', 'MTC E 514', '90.00', true, '2025-09-26T20:28:37.052Z'),
  (1479, 15, 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, incluye peso específico (3 briquetas), cliente proporcionara ensayo Rice.', '2025-09-26T20:28:37.053Z', 'PAV08', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, incluye peso específico (3 briquetas), cliente proporcionara ensayo Rice.', 'MTC E 504', '540.00', true, '2025-09-26T20:28:37.053Z'),
  (1480, 15, 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', '2025-09-26T20:28:37.054Z', 'PAV09', 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', 'MTC E 502', '450.00', true, '2025-09-26T20:28:37.054Z'),
  (1481, 15, 'Grado de compactación de una mezcla Bituminosa.', '2025-09-26T20:28:37.055Z', 'PAV10', 'Grado de compactación de una mezcla Bituminosa.', 'MTC E 509', '100.00', true, '2025-09-26T20:28:37.055Z'),
  (1482, 15, 'Extracción de testigo diamantina con broca de 4" en pavimento flexible.', '2025-09-26T20:28:37.056Z', 'PAV11', 'Extracción de testigo diamantina con broca de 4" en pavimento flexible.', 'NTP 339.059', '140.00', true, '2025-09-26T20:28:37.056Z'),
  (1483, 15, 'Resane en pavimento asfáltico', '2025-09-26T20:28:37.056Z', 'PAV12', 'Resane en pavimento asfáltico', '-', '50.00', true, '2025-09-26T20:28:37.056Z'),
  (1484, 16, 'Penetración', '2025-09-26T20:32:20.645Z', 'AS01', 'Penetración', '-', '120.00', true, '2025-09-26T20:32:20.645Z'),
  (1485, 16, 'Punto de inflamación', '2025-09-26T20:32:20.651Z', 'AS02', 'Punto de inflamación', '321.058', '0.00', true, '2025-09-26T20:32:20.651Z'),
  (1486, 16, 'Solubilidad en tricloroetileno', '2025-09-26T20:32:20.652Z', 'AS03', 'Solubilidad en tricloroetileno', '-', '85.00', true, '2025-09-26T20:32:20.652Z'),
  (1487, 16, 'Ensayo de la mancha (Oliensis)', '2025-09-26T20:32:20.654Z', 'AS04', 'Ensayo de la mancha (Oliensis)', '-', '0.00', true, '2025-09-26T20:32:20.654Z'),
  (1488, 16, 'Ductilidad', '2025-09-26T20:32:20.655Z', 'AS05', 'Ductilidad', '-', '125.00', true, '2025-09-26T20:32:20.655Z'),
  (1489, 16, 'Película delgada (Incluye: pérdida por calentamiento, penetración del residuo, ductilidad del residuo)', '2025-09-26T20:32:20.656Z', 'AS06', 'Película delgada (Incluye: pérdida por calentamiento, penetración del residuo, ductilidad del residuo)', '-', '0.00', true, '2025-09-26T20:32:20.656Z'),
  (1490, 16, 'Punto de ablandamiento', '2025-09-26T20:32:20.657Z', 'AS07', 'Punto de ablandamiento', '-', '0.00', true, '2025-09-26T20:32:20.657Z'),
  (1491, 16, 'Viscosidad Saybolt Furol', '2025-09-26T20:32:20.658Z', 'AS08', 'Viscosidad Saybolt Furol', '321.07', '115.00', true, '2025-09-26T20:32:20.658Z'),
  (1492, 16, 'Índice de penetración (incluye 3 ensayos de penetración)', '2025-09-26T20:32:20.659Z', 'AS09', 'Índice de penetración (incluye 3 ensayos de penetración)', '-', '0.00', true, '2025-09-26T20:32:20.659Z'),
  (1493, 16, 'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad y solubilidad)', '2025-09-26T20:32:20.660Z', 'AS10', 'Control de calidad de asfalto emulsificado (Incluye: Viscosidad SF, estabilidad al almacenamiento, carga de partícula, tamizado, destilación, ensayos en residuo: penetración, ductilidad y solubilidad)', '321.059', '0.00', true, '2025-09-26T20:32:20.660Z'),
  (1494, 16, 'Peso específico', '2025-09-26T20:32:20.661Z', 'AS11', 'Peso específico', '321.084', '0.00', true, '2025-09-26T20:32:20.661Z'),
  (1495, 16, 'Viscosidad cinemática', '2025-09-26T20:32:20.661Z', 'AS12', 'Viscosidad cinemática', '-', '0.00', true, '2025-09-26T20:32:20.661Z'),
  (1496, 16, 'Control de calidad de asfaltos líquidos (Incluye: viscosidad cinemática, punto de inflamación, destilación y determinación del residuo, ensayos en residuo: penetración, ductilidad y solubilidad; contenido de agua)', '2025-09-26T20:32:20.662Z', 'AS13', 'Control de calidad de asfaltos líquidos (Incluye: viscosidad cinemática, punto de inflamación, destilación y determinación del residuo, ensayos en residuo: penetración, ductilidad y solubilidad; contenido de agua)', '321.026 321.027 321.028', '0.00', true, '2025-09-26T20:32:20.662Z'),
  (1497, 16, 'Ensayos al residuo de destilación (Incluye: destilación, penetración, ductilidad y solubilidad)', '2025-09-26T20:32:20.663Z', 'AS14', 'Ensayos al residuo de destilación (Incluye: destilación, penetración, ductilidad y solubilidad)', '-', '0.00', true, '2025-09-26T20:32:20.663Z'),
  (1498, 16, 'Contenido de agua', '2025-09-26T20:32:20.664Z', 'AS15', 'Contenido de agua', '321.067', '0.00', true, '2025-09-26T20:32:20.664Z'),
  (1499, 16, 'Control de calidad de cementos asfálticos (Incluye: penetración, punto de inflamación, solubilidad, ductilidad, pérdida por calentamiento, penetración retenida y ductilidad del residuo)', '2025-09-26T20:32:20.665Z', 'AS16', 'Control de calidad de cementos asfálticos (Incluye: penetración, punto de inflamación, solubilidad, ductilidad, pérdida por calentamiento, penetración retenida y ductilidad del residuo)', '321.051', '0.00', true, '2025-09-26T20:32:20.665Z'),
  (1500, 16, 'Pérdida por calentamiento', '2025-09-26T20:32:20.666Z', 'AS17', 'Pérdida por calentamiento', '-', '0.00', true, '2025-09-26T20:32:20.666Z'),
  (1501, 16, 'Estabilidad al almacenamiento', '2025-09-26T20:32:20.667Z', 'AS18', 'Estabilidad al almacenamiento', '321.082', '0.00', true, '2025-09-26T20:32:20.667Z'),
  (1502, 16, 'Carga de partícula', '2025-09-26T20:32:20.667Z', 'AS19', 'Carga de partícula', '321.061', '0.00', true, '2025-09-26T20:32:20.667Z'),
  (1503, 16, 'Tamizado malla N° 20', '2025-09-26T20:32:20.668Z', 'AS20', 'Tamizado malla N° 20', '321.073', '0.00', true, '2025-09-26T20:32:20.668Z'),
  (1504, 16, 'Destilación y determinación del residuo', '2025-09-26T20:32:20.669Z', 'AS21', 'Destilación y determinación del residuo', '321.068', '0.00', true, '2025-09-26T20:32:20.669Z'),
  (1505, 16, 'Evaporación y determinación del residuo', '2025-09-26T20:32:20.669Z', 'AS22', 'Evaporación y determinación del residuo', '321.064', '0.00', true, '2025-09-26T20:32:20.669Z'),
  (1506, 16, 'Sedimentación a los 5 días', '2025-09-26T20:32:20.670Z', 'AS23', 'Sedimentación a los 5 días', '321.076', '0.00', true, '2025-09-26T20:32:20.670Z'),
  (1507, 16, 'Ensayos al residuo de evaporación (Incluye: evaporación y determinación del residuo, penetración, solubilidad, punto de ablandamiento)', '2025-09-26T20:32:20.671Z', 'AS24', 'Ensayos al residuo de evaporación (Incluye: evaporación y determinación del residuo, penetración, solubilidad, punto de ablandamiento)', '-', '0.00', true, '2025-09-26T20:32:20.671Z'),
  (1508, 16, 'Control de calidad de emulsión catiónica modificada con polímeros (Incluye: Viscosidad SF, Estabilidad al almacenamiento, carga de partícula, tamizado, sedimentación, evaporación, ensayos en residuo: penetración, solubilidad y punto de ablandamiento)', '2025-09-26T20:32:20.672Z', 'AS25', 'Control de calidad de emulsión catiónica modificada con polímeros (Incluye: Viscosidad SF, Estabilidad al almacenamiento, carga de partícula, tamizado, sedimentación, evaporación, ensayos en residuo: penetración, solubilidad y punto de ablandamiento)', '321.141', '0.00', true, '2025-09-26T20:32:20.672Z'),
  (1509, 17, 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', '2025-09-26T20:40:16.092Z', 'MA01', 'Extraccíón cuantitativa de asfalto en mezclas para pavimentos (Lavado asfaltico), incl. Granulometría.', 'ASTM D 2172 / MTC502', '450.00', true, '2025-09-26T20:40:16.092Z'),
  (1510, 17, 'Lavado asfáltico (incluye tricloroetileno)', '2025-09-26T20:40:16.104Z', 'MA01A', 'Lavado asfáltico (incluye tricloroetileno)', 'ASTM D 2172 / MTC502', '250.00', true, '2025-09-26T20:40:16.104Z'),
  (1511, 17, 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall , incluye ensayo Rice y peso específico.', '2025-09-26T20:40:16.107Z', 'MA02', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall , incluye ensayo Rice y peso específico.', 'ASTM D1559 / MTC E504 / MTC E 514 / ASTM D2041', '790.00', true, '2025-09-26T20:40:16.107Z'),
  (1512, 17, 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, e incluye peso específico, el cliente proporcionara el ensayo Rice.', '2025-09-26T20:40:16.110Z', 'MA02A', 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall, e incluye peso específico, el cliente proporcionara el ensayo Rice.', 'ASTM D1559 / MTC E504 / MTC E 514', '540.00', true, '2025-09-26T20:40:16.110Z'),
  (1513, 17, 'Estabilidad Marshall (Incluye: elaboración de briqueta 3und, estabilidad y flujo)', '2025-09-26T20:40:16.114Z', 'MA03', 'Estabilidad Marshall (Incluye: elaboración de briqueta 3und, estabilidad y flujo)', 'ASTM D1559', '350.00', true, '2025-09-26T20:40:16.114Z'),
  (1514, 17, 'Densidad máxima teórica (Rice).', '2025-09-26T20:40:16.118Z', 'MA04', 'Densidad máxima teórica (Rice).', 'ASTM D2041', '250.00', true, '2025-09-26T20:40:16.118Z'),
  (1515, 17, 'Porcentaje de vacíos (incluye: densidad de espécimen y densidad máxima teórica (Rice)) (costo por briqueta).', '2025-09-26T20:40:16.121Z', 'MA04A', 'Porcentaje de vacíos (incluye: densidad de espécimen y densidad máxima teórica (Rice)) (costo por briqueta).', '-', '100.00', true, '2025-09-26T20:40:16.121Z'),
  (1516, 17, 'Diseño de mezcla asfáltica en caliente (Diseño Marshall).', '2025-09-26T20:40:16.124Z', 'MA05', 'Diseño de mezcla asfáltica en caliente (Diseño Marshall).', 'D1559', '5000.00', true, '2025-09-26T20:40:16.124Z'),
  (1517, 17, 'Elaboración de briquetas (juego de 3).', '2025-09-26T20:40:16.126Z', 'MA06', 'Elaboración de briquetas (juego de 3).', 'MTC E 504', '0.00', true, '2025-09-26T20:40:16.126Z'),
  (1518, 17, 'Diseño mezcla en frío (teórico, por áreas equivalentes).', '2025-09-26T20:40:16.128Z', 'MA09', 'Diseño mezcla en frío (teórico, por áreas equivalentes).', '-', '0.00', true, '2025-09-26T20:40:16.128Z'),
  (1519, 17, 'Adherencia en agregado grueso (Revestimiento y desprendimiento), incluye ensayo Peso específico.', '2025-09-26T20:40:16.130Z', 'MA11', 'Adherencia en agregado grueso (Revestimiento y desprendimiento), incluye ensayo Peso específico.', 'MTC E517', '250.00', true, '2025-09-26T20:40:16.130Z'),
  (1520, 17, 'Espesor o altura de especimenes compactados de mezcla asfáltica.', '2025-09-26T20:40:16.133Z', 'MA12', 'Espesor o altura de especimenes compactados de mezcla asfáltica.', 'MTC E 507', '150.00', true, '2025-09-26T20:40:16.133Z'),
  (1521, 17, 'determinacion del grado de compactacion de mezclas vituminosas.', '2025-09-26T20:40:16.135Z', 'MA13', 'determinacion del grado de compactacion de mezclas vituminosas.', '-', '0.00', true, '2025-09-26T20:40:16.135Z'),
  (1522, 17, 'Grado estimado de cubrimiento de partículas en mezclas agregado - Bitumen.', '2025-09-26T20:40:16.137Z', 'MA14', 'Grado estimado de cubrimiento de partículas en mezclas agregado - Bitumen.', 'MTC E 519', '150.00', true, '2025-09-26T20:40:16.137Z'),
  (1523, 17, 'Control de temperatura en mezcla asfáltica.', '2025-09-26T20:40:16.139Z', 'MA15', 'Control de temperatura en mezcla asfáltica.', '-', '70.00', true, '2025-09-26T20:40:16.139Z'),
  (1524, 16, 'Recuperación de asfalto por el método de abson.', '2025-09-26T20:41:42.060Z', 'AS26', 'Recuperación de asfalto por el método de abson.', '-', '1200.00', true, '2025-09-26T20:41:42.060Z'),
  (1525, 18, 'Escaneo de acero de refuerzo.', '2025-09-26T21:09:18.263Z', 'E01', 'Escaneo de acero de refuerzo.', '-', '0.00', true, '2025-09-26T21:09:18.263Z'),
  (1526, 18, 'Escaneo de acero por portico.', '2025-09-26T21:09:18.269Z', 'E02', 'Escaneo de acero por portico.', '-', '0.00', true, '2025-09-26T21:09:18.269Z'),
  (1527, 18, 'Escaneo de acero por estructura.', '2025-09-26T21:09:18.270Z', 'E03', 'Escaneo de acero por estructura.', '-', '0.00', true, '2025-09-26T21:09:18.270Z'),
  (1528, 18, 'PH concreto.', '2025-09-26T21:09:18.272Z', 'E04', 'PH concreto.', 'ASTM C4262', '100.00', true, '2025-09-26T21:09:18.272Z'),
  (1529, 19, 'Implemetación de personal técnico y equipo de laboratorio en obra en la especialidad SUELO, AGREGADO, CONCRETO, PAVIMENTO.', '2025-09-26T21:09:25.551Z', 'IL01', 'Implemetación de personal técnico y equipo de laboratorio en obra en la especialidad SUELO, AGREGADO, CONCRETO, PAVIMENTO.', '-', '0.00', true, '2025-09-26T21:09:25.551Z'),
  (1530, 19, 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales.', '2025-09-26T21:10:16.901Z', 'IL02', 'Estudio de suelos con fines de cimentación superficial y profunda, edificaciones, puentes, plantas industriales.', '-', '0.00', true, '2025-09-26T21:10:16.901Z'),
  (1531, 19, 'Estudio de suelos y diseño de pavimentación.', '2025-09-26T21:10:16.907Z', 'IL03', 'Estudio de suelos y diseño de pavimentación.', '-', '0.00', true, '2025-09-26T21:10:16.907Z'),
  (1532, 19, 'Estudio de suelos con fines de estabilidad de taludes.', '2025-09-26T21:10:16.908Z', 'IL04', 'Estudio de suelos con fines de estabilidad de taludes.', '-', '0.00', true, '2025-09-26T21:10:16.908Z'),
  (1533, 19, 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado.', '2025-09-26T21:10:16.909Z', 'IL05', 'Estudio de suelos confines de diseño de instalaciones sanitarias de agua y alcantarillado.', '-', '0.00', true, '2025-09-26T21:10:16.909Z'),
  (1534, 19, 'Estudio de Potencial de licuación de suelos.', '2025-09-26T21:10:16.911Z', 'IL06', 'Estudio de Potencial de licuación de suelos.', '-', '0.00', true, '2025-09-26T21:10:16.911Z'),
  (1535, 19, 'Evaluación y caracterización del maciso rocoso.', '2025-09-26T21:10:16.912Z', 'IL07', 'Evaluación y caracterización del maciso rocoso.', '-', '0.00', true, '2025-09-26T21:10:16.912Z'),
  (1536, 19, 'Evaluación de canteras.', '2025-09-26T21:10:16.913Z', 'IL08', 'Evaluación de canteras.', '-', '0.00', true, '2025-09-26T21:10:16.913Z'),
  (1537, 20, 'Movilización de personal y equipo (Densidad campo).', '2025-09-26T21:11:02.192Z', 'SER01', 'Movilización de personal y equipo (Densidad campo).', '-', '0.00', true, '2025-09-26T21:11:02.192Z'),
  (1538, 20, 'Movilización de personal y equipo.', '2025-09-26T21:11:02.199Z', 'SER02', 'Movilización de personal y equipo.', '-', '0.00', true, '2025-09-26T21:11:02.199Z'),
  (1539, 20, 'Movilización de muestreo en cantera y/o obra.', '2025-09-26T21:11:02.200Z', 'SER03', 'Movilización de muestreo en cantera y/o obra.', '-', '0.00', true, '2025-09-26T21:11:02.200Z'),
  (1540, 20, 'Movilización', '2025-09-26T21:11:02.202Z', 'SER04', 'Movilización', '-', '0.00', true, '2025-09-26T21:11:02.202Z'),
  (1541, 20, 'Tener en cuenta lo siguiente: . Lista de precios referencial, la cual está sujeta a mejora de acuerdo a las cantidades ingresadas. . Algunos ensayos tienen puntos mínimos. . Algunos ensayos se encuentran relacionados a otros ensayos que se requieren. . (*) Métodos de ensayos acreditados ante INACAL.', '2025-09-26T21:11:02.204Z', 'NOTA', 'Tener en cuenta lo siguiente: . Lista de precios referencial, la cual está sujeta a mejora de acuerdo a las cantidades ingresadas. . Algunos ensayos tienen puntos mínimos. . Algunos ensayos se encuentran relacionados a otros ensayos que se requieren. . (*) Métodos de ensayos acreditados ante INACAL.', '-', '0.00', true, '2025-09-26T21:11:02.204Z');

-- No data for table: templates

-- Data for table: ticket_comments
INSERT INTO ticket_comments (id, ticket_id, user_id, comment, is_system, is_read, created_at, updated_at) VALUES
  (1, 14, 6, 'Comentario de prueba', false, false, '2025-10-07T19:18:14.881Z', '2025-10-07T19:18:14.881Z'),
  (2, 14, 6, 'Comentario de prueba directo', false, false, '2025-10-07T19:46:26.555Z', '2025-10-07T19:46:26.555Z'),
  (3, 13, 6, 'hhhhhhhh', false, false, '2025-10-10T17:31:37.689Z', '2025-10-10T17:31:37.689Z'),
  (4, 15, 6, 'oye
ss', false, false, '2025-10-10T17:36:28.419Z', '2025-10-10T17:36:28.419Z'),
  (5, 15, 6, 'sassa', false, false, '2025-10-10T17:41:48.745Z', '2025-10-10T17:41:48.745Z'),
  (6, 15, 1613, 'HOLA', false, false, '2025-10-10T17:46:50.613Z', '2025-10-10T17:46:50.613Z'),
  (7, 15, 6, 'gg', false, false, '2025-10-10T17:47:06.572Z', '2025-10-10T17:47:06.572Z'),
  (8, 15, 6, 'dd', false, false, '2025-10-10T17:47:11.021Z', '2025-10-10T17:47:11.021Z'),
  (9, 15, 1613, 'aasas', false, false, '2025-10-10T17:47:31.189Z', '2025-10-10T17:47:31.189Z'),
  (10, 15, 6, 'assa', false, false, '2025-10-10T17:47:41.144Z', '2025-10-10T17:47:41.144Z'),
  (11, 15, 1613, 'sa', false, false, '2025-10-10T17:47:44.610Z', '2025-10-10T17:47:44.610Z'),
  (12, 15, 6, 'assa', false, false, '2025-10-10T17:47:47.864Z', '2025-10-10T17:47:47.864Z'),
  (13, 15, 1613, 'sasasa', false, false, '2025-10-10T17:47:57.772Z', '2025-10-10T17:47:57.772Z'),
  (14, 15, 6, 'asas', false, false, '2025-10-10T17:48:02.503Z', '2025-10-10T17:48:02.503Z'),
  (15, 15, 1613, 'assssssssssssssssssssssssssssssssss', false, false, '2025-10-10T17:48:30.043Z', '2025-10-10T17:48:30.043Z'),
  (16, 15, 6, 'xs', false, false, '2025-10-10T17:59:54.475Z', '2025-10-10T17:59:54.475Z'),
  (17, 15, 6, 'ss', false, false, '2025-10-10T17:59:56.544Z', '2025-10-10T17:59:56.544Z'),
  (18, 15, 1613, 'sss', false, false, '2025-10-10T18:00:09.696Z', '2025-10-10T18:00:09.696Z'),
  (19, 15, 1613, 'zz', false, false, '2025-10-10T18:00:11.229Z', '2025-10-10T18:00:11.229Z'),
  (20, 15, 6, 'aaaa', false, false, '2025-10-10T18:00:15.334Z', '2025-10-10T18:00:15.334Z'),
  (21, 15, 6, 'aaa', false, false, '2025-10-10T18:00:16.242Z', '2025-10-10T18:00:16.242Z'),
  (22, 15, 6, 'a', false, false, '2025-10-10T18:00:16.932Z', '2025-10-10T18:00:16.932Z'),
  (23, 15, 1613, 'sss', false, false, '2025-10-10T18:00:24.391Z', '2025-10-10T18:00:24.391Z'),
  (24, 15, 1613, 'sss', false, false, '2025-10-10T18:00:25.772Z', '2025-10-10T18:00:25.772Z'),
  (25, 15, 6, 'ssasa', false, false, '2025-10-10T18:00:30.629Z', '2025-10-10T18:00:30.629Z'),
  (26, 15, 1613, 'sasa', false, false, '2025-10-10T18:00:31.997Z', '2025-10-10T18:00:31.997Z'),
  (27, 15, 1613, 'assasaas', false, false, '2025-10-10T18:00:36.044Z', '2025-10-10T18:00:36.044Z'),
  (28, 15, 6, 'assasaasas', false, false, '2025-10-10T18:00:36.982Z', '2025-10-10T18:00:36.982Z');

-- Data for table: ticket_history
INSERT INTO ticket_history (id, ticket_id, action, performed_by, performed_at, notes) VALUES
  (1, 11, 'creado', 6, '2025-10-07T18:41:05.314Z', NULL),
  (2, 11, 'cambio a en_progreso', 6, '2025-10-07T18:49:15.308Z', NULL),
  (3, 11, 'cambio a resuelto', 6, '2025-10-07T18:49:20.751Z', NULL),
  (4, 11, 'cambio a cancelado', 6, '2025-10-07T18:49:22.781Z', NULL),
  (5, 11, 'cambio a en_progreso', 6, '2025-10-07T18:49:34.025Z', NULL),
  (6, 11, 'cambio a en_progreso', 6, '2025-10-07T18:49:39.161Z', NULL),
  (7, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:40.880Z', NULL),
  (8, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:41.667Z', NULL),
  (9, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:42.168Z', NULL),
  (10, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:43.844Z', NULL),
  (11, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:44.031Z', NULL),
  (12, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:46.239Z', NULL),
  (13, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:46.535Z', NULL),
  (14, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:46.770Z', NULL),
  (15, 11, 'cambio a cerrado', 6, '2025-10-07T18:49:46.972Z', NULL),
  (16, 11, 'cambio a cerrado', 6, '2025-10-07T18:50:49.400Z', NULL),
  (17, 11, 'cambio a cerrado', 6, '2025-10-07T18:51:09.122Z', NULL),
  (18, 12, 'creado', 6, '2025-10-07T18:51:29.750Z', NULL),
  (19, 13, 'creado', 6, '2025-10-07T18:52:27.433Z', NULL),
  (20, 14, 'creado', 6, '2025-10-07T18:57:50.875Z', NULL),
  (21, 14, 'cambio a abierto', 6, '2025-10-07T19:42:30.612Z', NULL),
  (22, 14, 'cambio a en_progreso', 6, '2025-10-07T20:39:05.523Z', NULL),
  (23, 14, 'cambio a resuelto', 6, '2025-10-07T20:39:15.091Z', NULL),
  (24, 15, 'creado', 1613, '2025-10-10T17:35:54.216Z', NULL),
  (25, 15, 'cambio a cancelado', 6, '2025-10-10T17:53:04.219Z', NULL),
  (26, 16, 'creado', 1613, '2025-10-10T18:04:36.643Z', NULL);

-- No data for table: ticket_notifications

-- Data for table: tickets
INSERT INTO tickets (id, user_id, title, description, priority, status, attachment_url, created_at, updated_at, module, category, type, assigned_to, estimated_time, tags, additional_notes, actual_time, notes, attachment_name, closed_at, created_by) VALUES
  (6, 6, 'Solicitud de información sobre servicios', 'Necesito información detallada sobre los servicios de análisis de suelos que ofrecen.', 'media', 'abierto', NULL, '2025-09-30T16:43:08.199Z', '2025-09-30T16:43:08.199Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (7, 6, 'Problema con cotización', 'Hay un error en el cálculo de la cotización COT-2025-0001. El monto no coincide.', 'alta', 'abierto', NULL, '2025-09-30T16:43:08.204Z', '2025-09-30T16:43:08.204Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (8, 6, 'Consulta sobre proyecto', '¿Cuál es el avance del proyecto de análisis de suelos?', 'baja', 'cerrado', NULL, '2025-09-30T16:43:08.205Z', '2025-09-30T16:43:08.205Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (9, 6, 'Solicitud de modificación', 'Necesito modificar los parámetros del estudio de impacto ambiental.', 'media', 'abierto', NULL, '2025-09-30T16:43:08.205Z', '2025-09-30T16:43:08.205Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (10, 6, 'Problema técnico', 'No puedo acceder al sistema de reportes.', 'alta', 'abierto', NULL, '2025-09-30T16:43:08.206Z', '2025-09-30T16:43:08.206Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (11, 6, 'sasasas', 'asasas', 'alta', 'cerrado', NULL, '2025-10-07T18:41:05.303Z', '2025-10-07T18:51:09.113Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (12, 6, 'asdsadsa', 'asadsdas', 'alta', 'abierto', NULL, '2025-10-07T18:51:29.744Z', '2025-10-07T18:51:29.744Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (13, 6, 'lolol', 'lololol', 'alta', 'abierto', NULL, '2025-10-07T18:52:27.425Z', '2025-10-07T18:52:27.425Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
  (14, 6, 'dedede', 'dededed', 'media', 'resuelto', NULL, '2025-10-07T18:57:50.866Z', '2025-10-07T20:39:15.083Z', 'sistema', 'tecnico', 'solicitud', 1446, '2', 'dededed', 'dededed', NULL, 'dededed', NULL, NULL, 6),
  (15, 1613, 'coso', 'coso ayuda de mi coso', 'alta', 'cancelado', '/uploads/1760117754189-914387663-cotizacion-borrador-272.pdf', '2025-10-10T17:35:54.203Z', '2025-10-10T17:53:04.205Z', 'comercial', 'ssaaas', 'asas', NULL, 'assaas', 'asasa', 'aassasasa', NULL, NULL, NULL, NULL, NULL),
  (16, 1613, 'saas', 'assas', 'urgente', 'abierto', '/uploads/1760119476622-395558663-cotizacion-borrador-270 (1).pdf', '2025-10-10T18:04:36.635Z', '2025-10-10T18:04:36.635Z', 'laboratorio', 'sasa', 'asas', NULL, '2', 'aassa', 'sasasaasas', NULL, NULL, NULL, NULL, NULL);

-- No data for table: uploads

-- Data for table: users
INSERT INTO users (id, name, email, password_hash, role, created_at, apellido, area, notification_enabled, active, phone) VALUES
  (6, 'Admin', 'admin@crm.com', '$2a$10$dHxb8SD2c6cX9TrEJKhfyOsJUXriMV2r7Sy1U2WT5BNs7FzgMU0Z.', 'admin', '2025-09-22T15:04:31.971Z', 'sito', 'Sistemas', true, true, '930238631'),
  (1007, 'angel', 'sistemas@gmail.com', '$2a$10$W59n.eb.xOqlDNsKkTnMr.MiArS6jpaFSMg.YRXkBI.FFWo6kKzCy', 'admin', '2025-09-22T18:53:00.089Z', 'lopez', 'Sistemas', true, true, NULL);

-- ==============================================
-- SEQUENCES
-- ==============================================

-- Sequence: payment_proofs_id_seq
SELECT setval('payment_proofs_id_seq', 1, true);

-- Sequence: quote_number_seq
SELECT setval('quote_number_seq', 1, true);

-- Sequence: audit_quotes_id_seq
SELECT setval('audit_quotes_id_seq', 1, true);

-- Sequence: quote_variants_id_seq
SELECT setval('quote_variants_id_seq', 1, true);

-- Sequence: users_id_seq
SELECT setval('users_id_seq', 1, true);

-- Sequence: quotes_id_seq
SELECT setval('quotes_id_seq', 1, true);

-- Sequence: projects_id_seq
SELECT setval('projects_id_seq', 1, true);

-- Sequence: companies_id_seq
SELECT setval('companies_id_seq', 1, true);

-- Sequence: categories_id_seq
SELECT setval('categories_id_seq', 1, true);

-- Sequence: subcategories_id_seq
SELECT setval('subcategories_id_seq', 1, true);

-- Sequence: project_history_id_seq
SELECT setval('project_history_id_seq', 1, true);

-- Sequence: services_id_seq
SELECT setval('services_id_seq', 1, true);

-- Sequence: subservices_id_seq
SELECT setval('subservices_id_seq', 1, true);

-- Sequence: project_services_id_seq
SELECT setval('project_services_id_seq', 1, true);

-- Sequence: tickets_id_seq
SELECT setval('tickets_id_seq', 1, true);

-- Sequence: quote_items_id_seq
SELECT setval('quote_items_id_seq', 1, true);

-- Sequence: ticket_history_id_seq
SELECT setval('ticket_history_id_seq', 1, true);

-- Sequence: invoices_id_seq
SELECT setval('invoices_id_seq', 1, true);

-- Sequence: templates_id_seq
SELECT setval('templates_id_seq', 1, true);

-- Sequence: evidences_id_seq
SELECT setval('evidences_id_seq', 1, true);

-- Sequence: audit_log_id_seq
SELECT setval('audit_log_id_seq', 1, true);

-- Sequence: leads_id_seq
SELECT setval('leads_id_seq', 1, true);

-- Sequence: project_attachments_id_seq
SELECT setval('project_attachments_id_seq', 1, true);

-- Sequence: shipments_id_seq
SELECT setval('shipments_id_seq', 1, true);

-- Sequence: export_history_id_seq
SELECT setval('export_history_id_seq', 1, true);

-- Sequence: notifications_id_seq
SELECT setval('notifications_id_seq', 1, true);

-- Sequence: activities_id_seq
SELECT setval('activities_id_seq', 1, true);

-- Sequence: project_categories_id_seq
SELECT setval('project_categories_id_seq', 1, true);

-- Sequence: project_subcategories_id_seq
SELECT setval('project_subcategories_id_seq', 1, true);

-- Sequence: monthly_goals_id_seq
SELECT setval('monthly_goals_id_seq', 1, true);

-- Sequence: shipment_status_id_seq
SELECT setval('shipment_status_id_seq', 1, true);

-- Sequence: project_evidence_id_seq
SELECT setval('project_evidence_id_seq', 1, true);

-- Sequence: project_invoices_id_seq
SELECT setval('project_invoices_id_seq', 1, true);

-- Sequence: audit_cleanup_log_id_seq
SELECT setval('audit_cleanup_log_id_seq', 1, true);

-- Sequence: project_states_id_seq
SELECT setval('project_states_id_seq', 1, true);

-- Sequence: project_files_id_seq
SELECT setval('project_files_id_seq', 1, true);

-- Sequence: quote_versions_id_seq
SELECT setval('quote_versions_id_seq', 1, true);

-- Sequence: quote_approvals_id_seq
SELECT setval('quote_approvals_id_seq', 1, true);

-- Sequence: quote_subservices_id_seq
SELECT setval('quote_subservices_id_seq', 1, true);

-- Sequence: quote_categories_id_seq
SELECT setval('quote_categories_id_seq', 1, true);

-- Sequence: funnel_metrics_id_seq
SELECT setval('funnel_metrics_id_seq', 1, true);

-- Sequence: exports_id_seq
SELECT setval('exports_id_seq', 1, true);

-- Sequence: ticket_comments_id_seq
SELECT setval('ticket_comments_id_seq', 1, true);

-- Sequence: uploads_id_seq
SELECT setval('uploads_id_seq', 1, true);

-- Sequence: ticket_notifications_id_seq
SELECT setval('ticket_notifications_id_seq', 1, true);

-- Sequence: quote_evidences_id_seq
SELECT setval('quote_evidences_id_seq', 1, true);

-- Sequence: client_comments_id_seq
SELECT setval('client_comments_id_seq', 1, true);

-- ==============================================
-- CUSTOM FUNCTIONS
-- ==============================================

-- Function: update_shipments_updated_at

BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
;

-- Function: update_ticket_comments_updated_at

      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      ;

-- Function: update_client_comments_updated_at

BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
;

-- Function: update_templates_updated_at

BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
;

-- Function: update_payment_proofs_updated_at

BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
;

-- Function: get_next_quote_sequence

      DECLARE
        next_seq INTEGER;
      BEGIN
        INSERT INTO quote_sequences (date_part, sequence)
        VALUES (date_part_param, 1)
        ON CONFLICT (date_part) 
        DO UPDATE SET 
          sequence = quote_sequences.sequence + 1,
          updated_at = NOW()
        RETURNING sequence INTO next_seq;
        
        RETURN next_seq;
      END;
      ;

-- Function: search_services

      BEGIN
        RETURN QUERY
        SELECT 
          s.id,
          s.code,
          s.name,
          s.description,
          s.norm_ntp,
          s.norm_astm,
          s.price,
          sc.name as subcategory_name
        FROM services s
        JOIN subcategories sc ON s.subcategory_id = sc.id
        WHERE s.is_active = true
          AND (
            s.code ILIKE '%' || search_term || '%' OR
            s.name ILIKE '%' || search_term || '%' OR
            s.description ILIKE '%' || search_term || '%'
          )
        ORDER BY s.code, s.name
        LIMIT 20;
      END;
      ;

-- Function: get_service_by_code

      BEGIN
        RETURN QUERY
        SELECT 
          s.id,
          s.code,
          s.name,
          s.description,
          s.norm_ntp,
          s.norm_astm,
          s.price,
          s.comments,
          sc.name as subcategory_name
        FROM services s
        JOIN subcategories sc ON s.subcategory_id = sc.id
        WHERE s.code = service_code AND s.is_active = true;
      END;
      ;

-- Function: update_updated_at_column

BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
;

-- Function: get_last_cleanup

BEGIN
  RETURN (
    SELECT cleanup_date 
    FROM audit_cleanup_log 
    ORDER BY cleanup_date DESC 
    LIMIT 1
  );
END;
;

-- Function: generate_quote_number

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
;

-- Function: update_funnel_metrics

BEGIN
  -- Actualizar métricas cuando se aprueba una cotización
  IF NEW.status = 'aprobada' AND OLD.status != 'aprobada' THEN
    -- Aquí se pueden agregar lógicas adicionales para actualizar métricas
    -- Por ejemplo, actualizar tablas de métricas, enviar notificaciones, etc.
    NULL;
  END IF;
  
  RETURN NEW;
END;
;

-- Function: get_funnel_stats

BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT fmv.quote_id) as total_quotes,
            SUM(fmv.total_amount) as total_revenue,
            AVG(fmv.total_amount) as avg_quote_value,
            COUNT(DISTINCT fmv.company_ruc) as unique_companies,
            COUNT(DISTINCT fmv.subservice_id) as unique_services
        FROM funnel_metrics_view fmv
        WHERE (start_date IS NULL OR fmv.approved_at >= start_date)
          AND (end_date IS NULL OR fmv.approved_at <= end_date)
    ),
    top_service AS (
        SELECT 
            service_name,
            SUM(total_price) as service_revenue
        FROM funnel_metrics_view fmv
        WHERE (start_date IS NULL OR fmv.approved_at >= start_date)
          AND (end_date IS NULL OR fmv.approved_at <= end_date)
        GROUP BY service_name
        ORDER BY service_revenue DESC
        LIMIT 1
    )
    SELECT 
        s.total_quotes,
        s.total_revenue,
        s.avg_quote_value,
        s.unique_companies,
        s.unique_services,
        ts.service_name,
        ts.service_revenue
    FROM stats s
    CROSS JOIN top_service ts;
END;
;

