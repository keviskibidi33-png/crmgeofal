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
