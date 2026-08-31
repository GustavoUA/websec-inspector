# WebSec Inspector v0.1.1

**Browser Security Analysis · by SecTF Labs**

Desarrollador y editor del proyecto: **SecTF Labs**.

Extensión local para Chrome/Edge basada en Manifest V3.

## Funciones
- Comprueba si la página usa HTTPS.
- Captura cabeceras de seguridad de la respuesta principal.
- Revisa HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy y Permissions-Policy.
- Cuenta redirecciones de la navegación principal.
- Lista/contabiliza orígenes de terceros cargados por la página.
- Revisa atributos Secure, HttpOnly y SameSite de cookies accesibles mediante la API del navegador.
- Detecta campos de contraseña en páginas sin HTTPS.
- Calcula un Security Score 0-100 explicable.
- Exporta el informe actual a JSON.
- Todo el análisis se realiza localmente.

## Instalación manual en Chrome
1. Descomprime `websec-inspector-chrome-edge-v0.1.1.zip`.
2. Abre `chrome://extensions`.
3. Activa "Modo de desarrollador".
4. Pulsa "Cargar descomprimida".
5. Selecciona la carpeta descomprimida.
6. Visita una página web y abre WebSec Inspector.

## Instalación manual en Edge
1. Abre `edge://extensions`.
2. Activa el modo de desarrollador.
3. Elige "Cargar desempaquetado".
4. Selecciona la carpeta.

## Notas y limitaciones
- El score NO demuestra que una web sea segura ni sustituye una auditoría, pentest o escáner especializado.
- Una cabecera ausente puede ser intencionada o compensarse con otros controles.
- El análisis de terceros usa Performance API y puede no observar todos los recursos.
- Las cookies solo se evalúan respecto a los atributos que expone la API del navegador.
- La v0.1 no valida certificados TLS ni reputación/antigüedad de dominios.
- No se envían URLs, cookies, historial ni resultados a servidores externos.

## Próximas versiones
- Typosquatting/phishing local.
- Lista configurable de dominios corporativos.
- Mejor scoring por contexto.
- Exportación PDF.
- Firefox.
- Tests automáticos.
- Dashboard opcional.

## Cambios en v0.1.1
- Marca SecTF Labs en el popup, manifest y documentación.
- Versión 0.1.1 y pie con «Local-first security analysis».
- Scripts de análisis, scoring, exportación JSON y permisos sin cambios respecto a v0.1.0.

## Paquetes
- `WebSec_Inspector_v0.1.1_FULL.zip`: proyecto completo con documentación y ZIP Chrome/Edge en `dist/`.
- `websec-inspector-chrome-edge-v0.1.1.zip`: extensión con `manifest.json` en la raíz; descomprimir antes de cargarla en el navegador.

Para actualizar una instalación existente, sustituye sus archivos por los de v0.1.1 y pulsa el botón de recarga de la extensión. Recarga también la página que quieras analizar.
