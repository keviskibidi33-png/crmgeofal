# CORRECCIÓN FUNCIÓN CONVERTIR PDF

## 🚨 **PROBLEMA IDENTIFICADO**

El servidor backend estaba fallando con el error:
```
ReferenceError: convertHtmlToPdf is not defined
```

## 🔍 **CAUSA DEL PROBLEMA**

Durante las modificaciones del archivo `smartTemplatePdf.js`, la función `convertHtmlToPdf` fue eliminada accidentalmente, pero seguía siendo llamada en la función `generateSmartTemplatePdf`.

## ✅ **SOLUCIÓN APLICADA**

### **Archivo corregido:**
- `crmgeofal/backend/utils/smartTemplatePdf.js`

### **Función restaurada:**

```javascript
async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {top: '15mm', right: '10mm', bottom: '15mm', left: '10mm'},
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });
  } finally {
    await browser.close();
  }
}
```

## 🎯 **FUNCIÓN DE LA FUNCIÓN**

La función `convertHtmlToPdf` es responsable de:

1. **Iniciar Puppeteer**: Lanza un navegador headless
2. **Cargar HTML**: Navega al archivo HTML temporal
3. **Generar PDF**: Convierte el HTML a PDF con configuración A4
4. **Configuración de márgenes**: 15mm arriba/abajo, 10mm izquierda/derecha
5. **Limpiar recursos**: Cierra el navegador después del uso

## ✅ **RESULTADO**

- ✅ **Servidor funcionando**: El backend ahora puede generar PDFs correctamente
- ✅ **Sin errores**: Se eliminó el `ReferenceError`
- ✅ **Funcionalidad completa**: Las exportaciones PDF funcionan
- ✅ **Módulo operativo**: El módulo de Cotización Inteligente está funcional

## 📋 **FLUJO DE GENERACIÓN PDF**

1. **Frontend**: Usuario hace clic en "📄 PDF Borrador"
2. **Backend**: `generateSmartTemplatePdf` procesa los datos
3. **HTML**: Se genera el HTML temporal con Handlebars
4. **Puppeteer**: `convertHtmlToPdf` convierte HTML a PDF
5. **Respuesta**: Se devuelve el PDF al frontend

## 📅 **Fecha de corrección**
2025-01-27

## 👤 **Corregido por**
Asistente IA - Restauración de función convertHtmlToPdf
