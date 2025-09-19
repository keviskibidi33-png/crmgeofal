# scripts-backend.md

## Scripts y comandos útiles para CRMGeoFal Backend

### Instalación y entorno

- Instalar dependencias:
  ```bash
  npm install
  ```
- Copiar y configurar variables de entorno:
  ```bash
  cp .env.example .env
  # Edita .env con tus datos de PostgreSQL y JWT_SECRET
  ```

### Ejecución y desarrollo

- Iniciar el servidor backend:
  ```bash
  node index.js
  ```
- Ejecutar en modo desarrollo (si tienes nodemon):
  ```bash
  npx nodemon index.js
  ```

### Pruebas

- Ejecutar todos los tests:
  ```bash
  npm test
  ```
  > Nota: Los tests requieren la base de datos y variables de entorno correctas.

### Docker

- Levantar backend y base de datos PostgreSQL:
  ```bash
  docker-compose up --build
  ```
- Detener servicios:
  ```bash
  docker-compose down
  ```

### Limpieza y logs

- Limpiar dependencias:
  ```bash
  npm prune
  ```
- Ver logs:
  - Errores: `backend/logs/error.log`
  - Combinados: `backend/logs/combined.log`

---

## Recomendaciones
- Mantén actualizado `.env` y nunca lo subas a repositorios públicos.
- Revisa los scripts en `package.json` para personalizar tareas.
- Consulta el README para endpoints y estructura general.
