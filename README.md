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
3. Copiar `.env.example` a `.env` y completar los valores
4. Iniciar el servidor:
   ```bash
   node index.js
   ```

#### Despliegue con Docker
1. Copiar `.env.example` a `.env` y completar los valores
2. Ejecutar:
   ```bash
   docker-compose up --build
   ```
3. El backend estará disponible en `http://localhost:4000`

### Frontend
1. Ir a la carpeta `frontend`
2. Crear la app React si no existe:
   ```bash
   npx create-react-app .
   ```
3. Instalar dependencias adicionales si es necesario
4. Iniciar la app:
   ```bash
   npm start
   ```

---

Este esqueleto está listo para comenzar a desarrollar el CRM con autenticación, roles y dashboard.
