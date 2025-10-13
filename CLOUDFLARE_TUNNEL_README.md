# Cloudflare Tunnel para CRM GeoFal

Este documento explica cómo usar Cloudflare Tunnel para acceder a tu aplicación CRM GeoFal desde internet de manera temporal.

## ¿Qué es Cloudflare Tunnel?

Cloudflare Tunnel permite exponer tu aplicación local a internet de forma segura sin necesidad de configurar puertos en tu router o firewall. Es perfecto para desarrollo, pruebas y acceso temporal.

## Archivos Incluidos

- `cloudflared.exe` - El ejecutable de Cloudflare Tunnel
- `start-tunnels.ps1` - Script para iniciar los tunnels
- `stop-tunnels.ps1` - Script para detener los tunnels
- `get-tunnel-urls.ps1` - Script para obtener las URLs de los tunnels
- `cloudflare-tunnel-config.yml` - Configuración para el backend
- `cloudflare-tunnel-frontend-config.yml` - Configuración para el frontend

## Uso Rápido

### 1. Iniciar los Tunnels

```powershell
.\start-tunnels.ps1
```

Este script:
- Descarga cloudflared si no está presente
- Inicia un tunnel para el backend (puerto 4000)
- Inicia un tunnel para el frontend (puerto 3000)

### 2. Obtener las URLs

```powershell
.\get-tunnel-urls.ps1
```

O revisa las ventanas de cloudflared que se abrieron automáticamente. Busca líneas como:
```
https://xxxxx-xxxxx-xxxxx.trycloudflare.com
```

### 3. Detener los Tunnels

```powershell
.\stop-tunnels.ps1
```

## URLs Típicas

- **Backend API**: `https://xxxxx-xxxxx-xxxxx.trycloudflare.com`
- **Frontend Web**: `https://yyyyy-yyyyy-yyyyy.trycloudflare.com`

## Configuración de la Aplicación

### Backend (Puerto 4000)
Tu backend ya está configurado para correr en el puerto 4000. Asegúrate de que esté ejecutándose:

```bash
cd backend
npm start
```

### Frontend (Puerto 3000)
Tu frontend está configurado para correr en el puerto 3000 con proxy al backend:

```bash
cd frontend
npm run dev
```

## Acceso para Usuarios

Una vez que tengas las URLs de los tunnels:

1. **Para vendedores y usuarios**: Comparte la URL del frontend
2. **Para desarrolladores**: Pueden usar la URL del backend para APIs

## Seguridad

- Los tunnels son temporales y se cierran cuando detienes cloudflared
- Las URLs cambian cada vez que reinicias los tunnels
- No expongas credenciales sensibles en los logs

## Solución de Problemas

### El backend no responde
- Verifica que el backend esté corriendo: `netstat -ano | findstr :4000`
- Revisa los logs del backend

### El frontend no se conecta al backend
- Verifica que ambos servicios estén corriendo
- El frontend está configurado para hacer proxy a `/api` hacia el backend

### No puedo ver las URLs
- Revisa las ventanas de cloudflared que se abrieron
- Ejecuta `.\get-tunnel-urls.ps1` para obtener información

## Comandos Útiles

```powershell
# Verificar puertos en uso
netstat -ano | findstr :4000
netstat -ano | findstr :3000

# Ver procesos de cloudflared
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}

# Detener todos los procesos de cloudflared
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"} | Stop-Process -Force
```

## Notas Importantes

- Los tunnels son gratuitos pero tienen limitaciones de ancho de banda
- Las URLs expiran después de un tiempo de inactividad
- Para uso en producción, considera configurar tunnels permanentes con Cloudflare
