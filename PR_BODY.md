Resumen de cambios

- chore(frontend): centralizar llamadas API en `frontend/src/services/api.js` (`apiFetch`) y actualizar componentes:
  - `GestionUsuarios.jsx` ahora usa `apiFetch` y reemplaza `window.location.reload()` por `setRefresh`.
  - `Recuperados.jsx` y `AuthContext.jsx` también usan `apiFetch`.
- chore(backend): eliminar warnings por parámetros no usados en `notificationService.js` y manejar middleware de errores sin romper la firma de Express.
- Añadidos `.eslintignore` locales en `frontend/` y `backend/` para evitar que ESLint analice `dist/` y artefactos de build.

Motivación

Reducir duplicación (headers auth), mejorar el manejo de errores en llamadas HTTP y evitar recargas completas de página. Preparar el código para pasar linters enfocados en `src/` y facilitar futuras refactorizaciones y tests.

Validaciones realizadas

- Ejecutado ESLint sobre archivos fuente y corregidos los avisos críticos que afectaban a `backend`.
- Ejecutado `npm run build` en `frontend` para generar artefactos (dist) y confirmar que la app se construye.

Siguientes pasos recomendados

1. Revisar PR en GitHub y probar la rama en tu entorno local.
2. (Opcional) Refactor adicional: centralizar el manejo de errores HTTP en un wrapper más completo; añadir tests unitarios para helpers y controladores menores.
3. Ajustar CI para ejecutar `eslint "src/**/*.{js,jsx,ts,tsx}"` en vez de `eslint .` para evitar escanear `dist`.

Notas

- Algunos warnings aparecen si ejecutas ESLint desde la raíz sin la exclusión correcta de `dist/`. Ejecuta `npx eslint "src/**/*.{js,jsx,ts,tsx}"` desde `frontend` para analizar solo código fuente.
