-- BACKUP DE ESQUEMA DE BASE DE DATOS
-- Fecha: 2025-09-29T13:34:13.758Z
-- Solo estructura de tablas


-- Tabla: activities
CREATE TABLE IF NOT EXISTS activities (
id integer NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
user_id integer NOT NULL,
type character varying NOT NULL,
title character varying NOT NULL,
description text,
entity_type character varying,
entity_id integer,
metadata jsonb,
created_at timestamp without time zone DEFAULT now()
);

-- Tabla: audit_cleanup_log
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

-- Tabla: audit_log
CREATE TABLE IF NOT EXISTS audit_log (
id integer NOT NULL DEFAULT nextval('audit_log_id_seq'::regclass),
user_id integer,
action character varying NOT NULL,
entity character varying,
entity_id integer,
details text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: audit_quotes
CREATE TABLE IF NOT EXISTS audit_quotes (
id integer NOT NULL DEFAULT nextval('audit_quotes_id_seq'::regclass),
user_id integer,
action character varying NOT NULL,
entity character varying NOT NULL,
entity_id integer,
details text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: categories
CREATE TABLE IF NOT EXISTS categories (
id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
name character varying NOT NULL,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
description text,
is_active boolean DEFAULT true,
updated_at timestamp without time zone DEFAULT now()
);

-- Tabla: companies
CREATE TABLE IF NOT EXISTS companies (
id integer NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
ruc character varying NOT NULL,
name character varying NOT NULL,
address text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
type character varying DEFAULT 'empresa'::character varying,
dni character varying,
email character varying,
phone character varying,
contact_name character varying,
city character varying,
sector character varying
);

-- Tabla: evidences
CREATE TABLE IF NOT EXISTS evidences (
id integer NOT NULL DEFAULT nextval('evidences_id_seq'::regclass),
project_id integer,
invoice_id integer,
type character varying NOT NULL,
file_url text NOT NULL,
uploaded_by integer,
uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: export_history
CREATE TABLE IF NOT EXISTS export_history (
id integer NOT NULL DEFAULT nextval('export_history_id_seq'::regclass),
user_id integer,
type character varying NOT NULL,
resource character varying NOT NULL,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
client_id integer,
project_id integer,
commercial_id integer,
laboratory_id integer,
status character varying DEFAULT 'nuevo'::character varying
);

-- Tabla: invoices
CREATE TABLE IF NOT EXISTS invoices (
id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
project_id integer NOT NULL,
quote_number character varying NOT NULL,
received_at date,
payment_due date,
payment_status character varying NOT NULL DEFAULT 'pendiente'::character varying,
amount numeric NOT NULL DEFAULT 0,
created_by integer,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: leads
CREATE TABLE IF NOT EXISTS leads (
id integer NOT NULL DEFAULT nextval('leads_id_seq'::regclass),
company_id integer,
name character varying NOT NULL,
email character varying,
phone character varying,
status character varying NOT NULL DEFAULT 'nuevo'::character varying,
type character varying NOT NULL DEFAULT 'nuevo'::character varying,
assigned_to integer,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: monthly_goals
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

-- Tabla: notifications
CREATE TABLE IF NOT EXISTS notifications (
id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
user_id integer NOT NULL,
type character varying NOT NULL,
title character varying NOT NULL,
message text NOT NULL,
data jsonb,
priority character varying DEFAULT 'normal'::character varying,
read_at timestamp without time zone,
created_at timestamp without time zone DEFAULT now(),
updated_at timestamp without time zone DEFAULT now()
);

-- Tabla: project_attachments
CREATE TABLE IF NOT EXISTS project_attachments (
id integer NOT NULL DEFAULT nextval('project_attachments_id_seq'::regclass),
project_id integer NOT NULL,
uploaded_by integer,
file_type character varying,
description text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
category_id integer,
subcategory_id integer,
filename character varying,
original_name character varying,
file_path character varying,
file_size integer,
requiere_laboratorio boolean DEFAULT false,
requiere_ingenieria boolean DEFAULT false,
requiere_consultoria boolean DEFAULT false,
requiere_capacitacion boolean DEFAULT false,
requiere_auditoria boolean DEFAULT false,
mime_type character varying,
updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
file_url text
);

-- Tabla: project_categories
CREATE TABLE IF NOT EXISTS project_categories (
id integer NOT NULL DEFAULT nextval('project_categories_id_seq'::regclass),
name character varying NOT NULL,
description text,
created_at timestamp without time zone DEFAULT now(),
updated_at timestamp without time zone DEFAULT now()
);

-- Tabla: project_files
CREATE TABLE IF NOT EXISTS project_files (
id integer NOT NULL DEFAULT nextval('project_files_id_seq'::regclass),
project_id integer,
quote_id integer,
tipo_archivo character varying,
nombre_archivo character varying,
ruta_archivo character varying,
tamaño_archivo bigint,
tipo_mime character varying,
usuario_id integer,
fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
version integer DEFAULT 1,
es_activo boolean DEFAULT true
);

-- Tabla: project_history
CREATE TABLE IF NOT EXISTS project_history (
id integer NOT NULL DEFAULT nextval('project_history_id_seq'::regclass),
project_id integer NOT NULL,
action character varying NOT NULL,
performed_by integer,
performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
notes text
);

-- Tabla: project_services
CREATE TABLE IF NOT EXISTS project_services (
id integer NOT NULL DEFAULT nextval('project_services_id_seq'::regclass),
project_id integer NOT NULL,
subservice_id integer NOT NULL,
quantity integer NOT NULL DEFAULT 1,
provided_by integer,
provided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: project_states
CREATE TABLE IF NOT EXISTS project_states (
id integer NOT NULL DEFAULT nextval('project_states_id_seq'::regclass),
project_id integer,
estado_anterior character varying,
estado_nuevo character varying,
usuario_id integer,
fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
notas text
);

-- Tabla: project_subcategories
CREATE TABLE IF NOT EXISTS project_subcategories (
id integer NOT NULL DEFAULT nextval('project_subcategories_id_seq'::regclass),
category_id integer,
name character varying NOT NULL,
description text,
created_at timestamp without time zone DEFAULT now(),
updated_at timestamp without time zone DEFAULT now()
);

-- Tabla: projects
CREATE TABLE IF NOT EXISTS projects (
id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
company_id integer NOT NULL,
name character varying NOT NULL,
location character varying,
vendedor_id integer,
laboratorio_id integer,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
status character varying DEFAULT 'pendiente'::character varying,
project_type character varying,
requiere_laboratorio boolean DEFAULT false,
requiere_ingenieria boolean DEFAULT false,
contact_name character varying,
contact_phone character varying,
contact_email character varying,
laboratorio_status character varying DEFAULT 'no_requerido'::character varying,
ingenieria_status character varying DEFAULT 'no_requerido'::character varying,
status_notes text,
requiere_consultoria boolean DEFAULT false,
requiere_capacitacion boolean DEFAULT false,
requiere_auditoria boolean DEFAULT false,
queries text,
marked boolean DEFAULT false,
priority character varying DEFAULT 'normal'::character varying,
updated_at timestamp without time zone DEFAULT now(),
category_id integer,
subcategory_id integer,
category_name character varying,
subcategory_name character varying,
estado character varying DEFAULT 'borrador'::character varying,
cotizacion_id integer,
usuario_laboratorio_id integer,
fecha_envio_laboratorio timestamp without time zone,
fecha_completado_laboratorio timestamp without time zone,
notas_laboratorio text
);

-- Tabla: quote_items
CREATE TABLE IF NOT EXISTS quote_items (
id integer NOT NULL DEFAULT nextval('quote_items_id_seq'::regclass),
quote_id integer NOT NULL,
code character varying,
description text,
norm character varying,
unit_price numeric,
quantity integer,
partial_price numeric,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: quote_variants
CREATE TABLE IF NOT EXISTS quote_variants (
id integer NOT NULL DEFAULT nextval('quote_variants_id_seq'::regclass),
code character varying NOT NULL,
title character varying NOT NULL,
description text,
conditions jsonb,
active boolean DEFAULT true,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
image_url text
);

-- Tabla: quotes
CREATE TABLE IF NOT EXISTS quotes (
id integer NOT NULL DEFAULT nextval('quotes_id_seq'::regclass),
project_id integer NOT NULL,
document_url text,
engineer_name character varying,
notes text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
subtotal numeric DEFAULT 0,
igv numeric DEFAULT 0,
reference text,
meta jsonb,
variant_id integer,
created_by integer,
client_contact character varying,
client_email character varying,
client_phone character varying,
issue_date date,
total numeric,
status character varying DEFAULT 'borrador'::character varying,
updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
reference_type jsonb,
es_contrato boolean DEFAULT false,
archivos_cotizacion jsonb,
archivos_laboratorio jsonb,
notas_vendedor text,
notas_laboratorio text
);

-- Tabla: services
CREATE TABLE IF NOT EXISTS services (
id integer NOT NULL DEFAULT nextval('services_id_seq'::regclass),
name character varying NOT NULL,
area character varying NOT NULL,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
code character varying,
description text,
norm_ntp character varying,
norm_astm character varying,
comments text,
category_id integer,
is_active boolean DEFAULT true,
subcategory_id integer,
updated_at timestamp without time zone DEFAULT now(),
price numeric DEFAULT 0
);

-- Tabla: subcategories
CREATE TABLE IF NOT EXISTS subcategories (
id integer NOT NULL DEFAULT nextval('subcategories_id_seq'::regclass),
category_id integer NOT NULL,
name character varying NOT NULL,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
description text,
is_active boolean DEFAULT true,
updated_at timestamp without time zone DEFAULT now()
);

-- Tabla: subservices
CREATE TABLE IF NOT EXISTS subservices (
id integer NOT NULL DEFAULT nextval('subservices_id_seq'::regclass),
service_id integer NOT NULL,
name text NOT NULL,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
codigo character varying NOT NULL,
descripcion text NOT NULL,
norma text,
precio numeric NOT NULL DEFAULT 0,
is_active boolean NOT NULL DEFAULT true,
updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ticket_history
CREATE TABLE IF NOT EXISTS ticket_history (
id integer NOT NULL DEFAULT nextval('ticket_history_id_seq'::regclass),
ticket_id integer NOT NULL,
action character varying NOT NULL,
performed_by integer,
performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
notes text
);

-- Tabla: tickets
CREATE TABLE IF NOT EXISTS tickets (
id integer NOT NULL DEFAULT nextval('tickets_id_seq'::regclass),
user_id integer NOT NULL,
title character varying NOT NULL,
description text NOT NULL,
priority character varying NOT NULL DEFAULT 'media'::character varying,
status character varying NOT NULL DEFAULT 'abierto'::character varying,
attachment_url text,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: users
CREATE TABLE IF NOT EXISTS users (
id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
name character varying NOT NULL,
email character varying NOT NULL,
password_hash character varying NOT NULL,
role character varying NOT NULL DEFAULT 'vendedor'::character varying,
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
apellido text,
area text,
notification_enabled boolean DEFAULT true
);
