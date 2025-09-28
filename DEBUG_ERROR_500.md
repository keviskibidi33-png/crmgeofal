# 🔍 DEBUG: Error 500 al crear empresa

## ❌ **PROBLEMA IDENTIFICADO**

El frontend está recibiendo error 500 al intentar crear una empresa, pero el backend funciona correctamente.

## 🔧 **DIAGNÓSTICO REALIZADO**

### **1. Backend funcionando ✅**
```bash
# Prueba directa al endpoint
Invoke-RestMethod -Uri "http://localhost:4000/api/companies" -Method POST -ContentType "application/json" -Body '{"ruc":"12345678901","name":"Test Company"}'

# Resultado: ✅ ÉXITO
id: 12
ruc: 12345678901
name: Test Company
```

### **2. Posibles causas del error 500:**

1. **Token de autenticación faltante**
   - El frontend no está enviando el token JWT
   - El backend rechaza la petición sin token

2. **Datos faltantes en el payload**
   - `client.ruc` o `client.company_name` están vacíos
   - El backend valida campos obligatorios

3. **Problema de CORS**
   - El frontend no puede hacer peticiones al backend

## 🎯 **SOLUCIÓN RECOMENDADA**

### **Verificar autenticación:**
```javascript
// En el frontend, verificar si hay token
const token = localStorage.getItem('token');
if (!token) {
  console.error('No hay token de autenticación');
}
```

### **Verificar datos del cliente:**
```javascript
// En onSubmit, verificar datos antes de crear empresa
console.log('Datos del cliente:', {
  ruc: client.ruc,
  company_name: client.company_name,
  contact_name: client.contact_name
});
```

## 🚀 **PRÓXIMOS PASOS**

1. **Verificar autenticación** en el frontend
2. **Revisar logs** del servidor en tiempo real
3. **Probar con datos válidos** en el formulario
4. **Verificar CORS** en el backend

**¡El backend está funcionando, el problema está en el frontend!** 🎉
