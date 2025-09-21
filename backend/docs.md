# Documentación rápida de la API CRMGeoFal

- Documentación OpenAPI: ver `swagger.json` (puedes usar Swagger UI o Redoc para visualizarla)
- Ejemplo de endpoints:
  - `GET /api/leads` — Listar leads (paginado)
  - `POST /api/leads` — Crear lead (requiere autenticación y validación)
  - `GET /api/export/excel` — Exportar reporte a Excel
  - `POST /api/tickets` — Crear ticket
  - `POST /api/invoices` — Crear factura

## Endpoints nuevos (vistas globales)

### Exportaciones
- `GET /api/export/history` — Historial de exportaciones
  - Roles: `admin`, `gerencia`, `sistemas`, `soporte`, `jefa_comercial`, `jefe_laboratorio`
  - Query params:
    - `page` int (default 1)
    - `limit` int (default 20)
    - `q` string (busca en `resource`)
    - `type` string (`pdf`, `xlsx`, `csv`)
    - `range` string (`7`, `30`, `90`, `all`)
  - Respuesta: `{ data: [ { id, user_id, user_name, type, resource, created_at } ], total }`

### Tickets
- `GET /api/tickets/history/global` — Feed global de historial de tickets
  - Roles: `admin`, `sistemas`, `soporte`, `gerencia`
  - Query params:
    - `page` int (default 1)
    - `limit` int (default 20)
    - `q` string (ticket_id/usuario)
    - `action` string (ej. `creado`, `cambio a en_proceso`, etc.)
    - `range` string (`7`, `30`, `90`, `all`)
  - Respuesta: `{ data: [ { id, ticket_id, action, performed_by, user_name, performed_at, notes } ], total }`

### Notificaciones WhatsApp
- `GET /api/whatsapp-notices` — Listado global de avisos de WhatsApp (alias de `/api/project-whatsapp-notices`)
  - Roles: `admin`, `gerencia`, `sistemas`, `soporte`, `jefa_comercial`, `jefe_comercial`
  - Query params:
    - `page` int (default 1)
    - `limit` int (default 20)
    - `q` string (busca en `message` o `sent_to`)
    - `status` string (si la tabla maneja estados)
    - `project_id` int (filtra por proyecto)
    - `range` string (`7`, `30`, `90`, `all`)
  - Respuesta: `{ data: [ { id, project_id, sent_by, sent_to, message, sent_at } ], total }`

## Migraciones automáticas

- El backend ahora carga automáticamente todos los `.sql` en `backend/sql` al iniciar, en orden alfabético.
- Control por variable: `MIGRATE_ON_START=false` para desactivar.
- Tablas nuevas añadidas:
  - `export_history` (para registrar descargas de Excel/PDF)

## Variables de entorno principales

- `PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT` — Configuración de PostgreSQL
- `JWT_SECRET` — Secreto para JWT
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Configuración de correo

## Flujos de negocio

- Solo usuarios autenticados pueden crear/modificar entidades.
- Control de acceso por roles en endpoints sensibles.
- Validación y sanitización de datos en endpoints críticos.
- Notificaciones automáticas por correo en creación de leads, tickets y facturas.
- Exportación de reportes a Excel/PDF.

## Pruebas

- Se recomienda usar Jest y Supertest para pruebas de endpoints.
- Ver ejemplo de validación en `/api/leads`.

---

Para más detalles, consulta el archivo `swagger.json` o solicita ejemplos de endpoints específicos.
