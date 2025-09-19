# CRMGeoFal

## Estructura del proyecto

- `/backend`: Node.js + Express + PostgreSQL
  - `controllers/`, `models/`, `routes/`, `middlewares/`, `config/`
- `/frontend`: React.js
  - `src/components/`, `src/contexts/`, `src/pages/`, `src/services/`


## Instalación y ejecución

### Backend
1. Ir a la carpeta `backend`
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar `.env.example` a `.env` y completar los valores de conexión a PostgreSQL y JWT_SECRET.
   - Ejemplo de `.env`:
     ```env
     PGUSER=postgres
     PGPASSWORD=tu_password
     PGHOST=localhost
     PGDATABASE=crm
     PGPORT=5432
     JWT_SECRET=pon_un_secreto_fuerte_aqui
     ```
4. Iniciar el servidor:
   ```bash
   node index.js
   ```
5. Para ejecutar los tests (Jest + Supertest):
   ```bash
   npm test
   ```
   - Nota: Los tests requieren la base de datos configurada y variables de entorno correctas.

#### Despliegue con Docker
1. Copiar `.env.example` a `.env` y completar los valores
2. Ejecutar:
   ```bash
   docker-compose up --build
   ```
3. El backend estará disponible en `http://localhost:4000`

#### Endpoints principales
- Autenticación: `/api/auth/login`
- Usuarios: `/api/users`
- Empresas: `/api/companies`
- Proyectos: `/api/projects`
- Cotizaciones: `/api/quotes`, `/api/quote-items`, `/api/quote-variants`
- Adjuntos: `/api/project-attachments`
- Avisos WhatsApp: `/api/project-whatsapp-notices`
- Tickets: `/api/tickets`
- Categorías y subcategorías: `/api/categories`, `/api/subcategories`
- Reportes: `/api/reports`
- Auditoría: `/api/audit`, `/api/audit-quotes`

> **Importante:** Todos los endpoints protegidos requieren autenticación JWT y roles adecuados.

### Frontend
1. Ir a la carpeta `frontend`
2. Si no existe, crear la app React:
   ```bash
   npx create-react-app .
   ```
3. Instalar dependencias adicionales si es necesario
4. Iniciar la app:
   ```bash
   npm start
   ```

---

## Scripts útiles

- `npm start` (backend): Inicia el servidor Express
- `npm test` (backend): Ejecuta los tests con Jest
- `docker-compose up --build`: Levanta backend y base de datos PostgreSQL

---

## Notas y buenas prácticas
- Mantén actualizado el archivo `.env` y nunca lo subas a repositorios públicos.
- Los logs se guardan en la carpeta `backend/logs/`.
- Para producción, revisa la configuración de CORS, JWT y rate limiting.
- Consulta la documentación Swagger/OpenAPI (próximamente en `/backend/swagger.json`).

---

Sistema CRMGeoFal listo para desarrollo, pruebas y despliegue profesional.

---

## Cotizaciones LEM: Variantes y flujo de creación

Esta sección documenta cómo usar e implementar la creación de cotizaciones con variantes (LEM), y cómo crear Cliente y Proyecto desde el frontend.

### 1) Variantes en el creador de cotizaciones

- Página: `frontend/src/pages/CotizacionNuevaLEM.jsx`
- Servicio: `frontend/src/services/quoteVariants.js`
- Backend: `GET /api/quote-variants`

Flujo:
1. El formulario carga variantes activas para mostrarlas en el `<select>` de “Variante”.
2. Al guardar, se persiste `variant_id` junto con datos del cliente, `subtotal`, `igv`, `total`, `status` y `meta`.
3. Luego se insertan los ítems con `POST /api/quote-items`.

Campos clave:
- `reference`: texto libre para “Según lo solicitado …”
- `payment_terms`: adelantado, 50%, crédito 7/15/30 días
- `acceptance`: checkbox de aceptación
- `igv`: aplica 18% cuando está activo

Selección visual y autocompletado:
- El selector de variantes permite alternar entre lista y "Ver con imágenes".
- Si la variante tiene `image_url`, se muestra en una tarjeta clickeable.
- Al seleccionar una variante, se autocompletan campos desde `variant.conditions`:
   - `default_payment_terms`, `default_acceptance`, `default_igv`, `default_reference`.
   - `default_items`: inserta ítems por defecto si la tabla está vacía.
   - `default_service_name`: sugiere el nombre del servicio.

Cómo registrar una variante con imagen y condiciones (ejemplo de payload):
```json
{
   "code": "LEM-A",
   "title": "Análisis de mezclas - Plan A",
   "description": "Plan estándar LEM",
   "image_url": "https://tu-cdn/variantes/lem-a.png",
   "conditions": {
      "default_payment_terms": "adelantado",
      "default_acceptance": true,
      "default_igv": true,
      "default_reference": "Según solicitud vía correo",
      "default_service_name": "Control de calidad de mezclas",
      "default_items": [
         { "code": "ENS-001", "description": "Ensayo de resistencia", "norm": "NTP 339", "unit_price": 150, "quantity": 2 },
         { "code": "ENS-010", "description": "Muestreo en obra", "norm": "NTP 321", "unit_price": 80, "quantity": 1 }
      ]
   }
}
```

Exportación:
- PDF final: `GET /api/quotes/:id/export/pdf`
- PDF borrador: `GET /api/quotes/:id/export/pdf-draft`
- Excel: `GET /api/quotes/:id/export/excel`

Ubicación de la plantilla PDF:
- `backend/utils/quotePdfTemplate.js` (diseño fiel al formato mostrado)

### 2) Crear Cliente y Proyecto desde el creador

- Componente: `frontend/src/components/CompanyProjectPicker.jsx`
- Servicios:
   - Clientes: `frontend/src/services/companies.js` → `GET/POST /api/companies`
   - Proyectos: `frontend/src/services/projects.js` → `GET/POST /api/projects`

Uso:
1. Selecciona un Cliente del combo (se cargan hasta 50 por defecto; ajustar en servicio si hace falta).
2. Escribe “Nombre del proyecto” y “Ubicación”.
3. Presiona “Crear” para crear el Proyecto asociado al Cliente seleccionado.
4. El componente emite `project_id` y `project` hacia el formulario padre (`CotizacionNuevaLEM`).

Notas:
- Se puede agregar validación adicional (por ejemplo, nombre no vacío, longitud mínima).
- El componente muestra datos de contacto del cliente seleccionado como referencia.

### 3) Listado, detalle, clonado y exportación

- Listado: `frontend/src/pages/ListaCotizaciones.jsx`
   - Filtros por Cliente (`company_id`) y Proyecto (`project_id`).
   - Acciones por fila: Ver/Editar, Clonar (copia ítems), PDF, Excel.
   - Usa `services/quotes.js` y parsea respuestas `{rows}`, `{data}` o array.
- Detalle: `frontend/src/pages/DetalleCotizacion.jsx`
   - Muestra datos y todos los ítems de la cotización.
   - Exportación directa a PDF/Excel.
- Rutas (`frontend/src/App.jsx`):
   - `/cotizaciones` (lista), `/cotizaciones/nueva/lem` (crear), `/cotizaciones/:id` (detalle)

### 4) Buenas prácticas de resiliencia en frontend

- Lazy loading por ruta (code splitting) con `React.lazy` y `Suspense`.
- `ErrorBoundary` por ruta para que los fallos de un módulo no afecten a los demás.
- Normalización de respuestas desde servicios para tolerar `{rows}` o `{data}`.

### 5) Pasos rápidos (Quick Start)

Backend:
```powershell
cd C:\Users\Lenovo\Documents\CRMGeoFal\backend
npm install
npm test
node index.js
```

Frontend:
```powershell
cd C:\Users\Lenovo\Documents\CRMGeoFal\frontend
npm install
npm run dev
```

Rutas de interés:
- Crear LEM: `/cotizaciones/nueva/lem`
- Listado: `/cotizaciones`
- Detalle: `/cotizaciones/:id`

### 6) Próximas mejoras sugeridas
- Edición completa en detalle (guardar cambios e ítems).
- Regla anti-duplicado (una cotización “en proceso” por proyecto salvo “nueva ronda”).
- Envío por Email/WhatsApp con registro de auditoría.
- Excel con formato similar al PDF y soporte de logo opcional.
