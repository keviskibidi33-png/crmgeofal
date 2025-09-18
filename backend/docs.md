# Documentación rápida de la API CRMGeoFal

- Documentación OpenAPI: ver `swagger.json` (puedes usar Swagger UI o Redoc para visualizarla)
- Ejemplo de endpoints:
  - `GET /api/leads` — Listar leads (paginado)
  - `POST /api/leads` — Crear lead (requiere autenticación y validación)
  - `GET /api/export/excel` — Exportar reporte a Excel
  - `POST /api/tickets` — Crear ticket
  - `POST /api/invoices` — Crear factura

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
