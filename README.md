# WebSec Inspector v1.0.0

**Browser Security Analysis · by SecTF Labs**

Extensión local y de código abierto para Chrome y Edge, basada en Manifest V3. Reúne señales visibles para el navegador, explica cada resultado y ofrece recomendaciones sin enviar el análisis a servidores externos.

## Novedades de v1.0

- Puntuación transparente con penalización individual por hallazgo.
- Clasificación entre riesgo, hardening e información.
- Análisis contextual de los valores de HSTS, CSP, X-Content-Type-Options, protección contra marcos y Referrer-Policy.
- Cookies propias diferenciadas y evaluación contextual de Secure, HttpOnly y SameSite.
- Detección de formularios o campos de contraseña enviados sin HTTPS.
- Explicación y recomendación para cada comprobación.
- Pestañas de resultados y detalles.
- Exportación JSON e informe HTML imprimible como PDF.
- Pruebas automatizadas del motor de puntuación.

## Instalación manual

1. Descarga el código o el ZIP instalable de la release v1.0.0.
2. Descomprime el paquete.
3. Abre `chrome://extensions` o `edge://extensions`.
4. Activa el modo de desarrollador.
5. Elige **Cargar descomprimida** o **Cargar desempaquetado**.
6. Selecciona la carpeta que contiene `manifest.json`.
7. Abre una página HTTP/HTTPS y pulsa el icono de WebSec Inspector.

Al actualizar desde v0.1.1, recarga la extensión y las páginas que quieras analizar.

## Comprobaciones

- HTTPS y formularios inseguros.
- HSTS y duración de `max-age`.
- CSP y patrones débiles básicos.
- `X-Content-Type-Options: nosniff`.
- CSP `frame-ancestors` o `X-Frame-Options`.
- Referrer-Policy.
- Permissions-Policy.
- Cookies propias: Secure, HttpOnly y SameSite.
- Redirecciones y orígenes de terceros observados.

## Privacidad y permisos

El análisis se realiza localmente. La extensión no usa analítica remota ni transmite URLs, cookies o informes a SecTF Labs. Los permisos permiten observar la pestaña activa, sus cabeceras, cookies y recursos para generar el informe. Consulta [PRIVACY.md](PRIVACY.md).

## Limitaciones

El Security Score es orientativo. No demuestra que una web sea segura y no sustituye una auditoría, pentest o escáner especializado. La extensión:

- solo observa señales disponibles para las API del navegador;
- no valida la cadena del certificado TLS;
- no evalúa la lógica interna del servidor;
- no detecta todas las vulnerabilidades ni todos los recursos;
- realiza comprobaciones básicas de CSP, no un análisis completo de explotabilidad.

## Desarrollo y pruebas

El motor de puntuación está aislado en `src/scoring.js`. Las pruebas están en `tests/scoring.test.js` y pueden ejecutarse con Node.js:

```bash
node tests/scoring.test.js
```

## Licencia

Publicado bajo la [licencia MIT](LICENSE).

## Historial

- **1.0.0:** análisis contextual, resultados explicados, desglose, informe HTML y pruebas.
- **0.1.1:** identidad SecTF Labs.
- **0.1.0:** MVP inicial.
