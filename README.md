# WebSec Inspector v1.1.0

**Browser Security Analysis & Threat Intelligence · by SecTF Labs**

WebSec Inspector es una extensión de código abierto para Chrome y Edge basada en Manifest V3. Combina análisis local y explicable de señales de seguridad web con inteligencia de amenazas mediante AbuseIPDB para aportar contexto adicional sobre la reputación de la infraestructura que aloja una web.

## Novedades de v1.1.0

- Integración opcional con **AbuseIPDB API v2**.
- Resolución del hostname analizado a dirección IP mediante DNS-over-HTTPS.
- Consulta de reputación de la IP asociada al sitio.
- Visualización de `abuseConfidenceScore`, reportes, país, ISP y tipo de uso cuando están disponibles.
- Nueva sección **Threat Intelligence** en la interfaz.
- Clasificación de riesgo de la IP como señal complementaria al análisis web local.
- Security Score combinado: análisis local como señal principal y AbuseIPDB con una ponderación moderada.
- Caché temporal de consultas para reducir consumo de cuota de la API.
- Configuración de la API Key desde la propia extensión.
- La API Key se almacena localmente mediante `chrome.storage.local` y no forma parte del código fuente ni de los informes exportados.

WebSec Inspector no considera una IP reportada como prueba de que una web sea maliciosa. Servicios CDN, hosting y cloud pueden compartir infraestructura entre múltiples dominios, por lo que la reputación IP se utiliza únicamente como una señal adicional.

## Instalación manual

1. Descarga el código de la rama/release **v1.1.0**.
2. Descomprime el paquete.
3. Abre `chrome://extensions` o `edge://extensions`.
4. Activa el modo de desarrollador.
5. Elige **Cargar descomprimida** o **Cargar desempaquetado**.
6. Selecciona la carpeta que contiene `manifest.json`.
7. Abre una página HTTP/HTTPS y pulsa el icono de WebSec Inspector.

## Configurar AbuseIPDB

La integración con AbuseIPDB es opcional. El análisis local de WebSec Inspector continúa funcionando aunque no se configure una API Key.

1. Crea una cuenta en AbuseIPDB y genera una API Key.
2. Abre WebSec Inspector.
3. En **Threat Intelligence**, pulsa **Configurar API Key**.
4. Introduce tu API Key y pulsa **Guardar**.
5. Vuelve a analizar la página.

La clave se guarda únicamente en el almacenamiento local de la extensión. **Nunca publiques tu API Key en GitHub ni la incluyas directamente en el código fuente.** Para una distribución pública o comercial se recomienda utilizar un backend intermedio que gestione las credenciales y el rate limiting.

## Comprobaciones locales

- HTTPS y formularios inseguros.
- HSTS y duración de `max-age`.
- CSP y patrones débiles básicos.
- `X-Content-Type-Options: nosniff`.
- CSP `frame-ancestors` o `X-Frame-Options`.
- Referrer-Policy.
- Permissions-Policy.
- Cookies propias: Secure, HttpOnly y SameSite.
- Redirecciones y orígenes de terceros observados.

## Threat Intelligence

Cuando AbuseIPDB está configurado, WebSec Inspector puede mostrar información como:

- dirección IP analizada;
- Abuse Confidence Score;
- número de reportes;
- país;
- ISP;
- tipo de uso de la infraestructura.

La consulta se realiza únicamente cuando el usuario ejecuta el análisis. Se utiliza caché temporal para evitar consultas repetidas innecesarias.

## Security Score

WebSec Inspector mantiene el análisis local como componente principal de la puntuación. La reputación obtenida mediante AbuseIPDB actúa como señal secundaria y no como veredicto independiente.

Esto reduce falsos positivos en sitios alojados detrás de CDN, reverse proxies, proveedores cloud o infraestructuras compartidas.

## Privacidad y permisos

El análisis de cabeceras, cookies, formularios y recursos continúa realizándose localmente. Si el usuario configura AbuseIPDB, la dirección IP resuelta del dominio analizado se envía a la API de AbuseIPDB para obtener información de reputación.

WebSec Inspector no envía la API Key ni los informes generados a SecTF Labs. La clave se almacena mediante `chrome.storage.local`.

Consulta [PRIVACY.md](PRIVACY.md) para conocer la política de privacidad del proyecto.

## Limitaciones

El Security Score es orientativo. No demuestra que una web sea segura y no sustituye una auditoría, pentest, análisis de vulnerabilidades o escáner especializado. La extensión:

- solo observa señales disponibles para las API del navegador;
- no valida completamente la cadena del certificado TLS;
- no evalúa la lógica interna del servidor;
- no detecta todas las vulnerabilidades ni todos los recursos;
- realiza comprobaciones básicas de CSP, no un análisis completo de explotabilidad;
- utiliza la reputación de IP como contexto y no como prueba de que un dominio sea malicioso;
- puede obtener resultados asociados a infraestructura compartida por múltiples sitios.

## Desarrollo y pruebas

El motor de puntuación local está en `src/scoring.js`. Las pruebas están en `tests/scoring.test.js` y pueden ejecutarse con Node.js:

```bash
node tests/scoring.test.js
```

La integración de Threat Intelligence se gestiona desde el service worker `src/background.js` y la interfaz desde `src/popup.js`.

## Roadmap

La arquitectura de v1.1.0 permite incorporar nuevas fuentes de Threat Intelligence en futuras versiones, por ejemplo VirusTotal, urlscan.io o ThreatFox, manteniendo cada proveedor como una señal independiente dentro del análisis.

## Licencia

Publicado bajo la [licencia MIT](LICENSE).

## Historial

- **1.1.0:** integración opcional con AbuseIPDB, resolución de IP, Threat Intelligence, caché y score combinado.
- **1.0.0:** análisis contextual, resultados explicados, desglose, informe HTML y pruebas.
- **0.1.1:** identidad SecTF Labs.
- **0.1.0:** MVP inicial.
