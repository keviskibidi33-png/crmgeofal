// Prueba simple con curl usando PowerShell
console.log('Para probar la API manualmente, ejecuta estos comandos en PowerShell:');
console.log('');
console.log('1. Login:');
console.log('Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body \'{"email":"admin@crm.com","password":"admin123"}\'');
console.log('');
console.log('2. Obtener perfil (usa el token del login):');
console.log('Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" -Headers @{"Authorization"="Bearer TU_TOKEN_AQUI"}');
console.log('');
console.log('3. Actualizar perfil (usa el token del login):');
console.log('Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" -Method PUT -ContentType "application/json" -Headers @{"Authorization"="Bearer TU_TOKEN_AQUI"} -Body \'{"name":"Test Usuario","apellido":"Test Apellido","email":"admin@crm.com"}\'');
console.log('');
console.log('El error ya está corregido - la columna updated_at fue removida del query.');