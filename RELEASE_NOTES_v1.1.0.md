# WebSec Inspector v1.1.0

Esta versión incorpora Threat Intelligence opcional mediante AbuseIPDB y mantiene el análisis local de seguridad web como señal principal.

## Novedades

- Integración opcional con AbuseIPDB API v2.
- Resolución del hostname a dirección IP mediante DNS-over-HTTPS.
- Consulta de reputación de IP con Abuse Confidence Score, reportes, país, ISP, dominio y tipo de uso cuando están disponibles.
- Nueva sección Threat Intelligence en la interfaz.
- Security Score combinado, con el análisis local como componente principal y AbuseIPDB como señal secundaria.
- Caché temporal de consultas para reducir consumo de cuota.
- Configuración de API Key desde la propia extensión usando chrome.storage.local.
- La API Key no se incluye en el código fuente ni en los informes exportados.
- README y política de privacidad actualizados para reflejar el tratamiento de datos de Threat Intelligence.
- CI actualizada para aceptar versiones 1.x.x y generar paquetes con versión dinámica.

## Instalación

1. Descarga `websec-inspector-chrome-edge-v1.1.0.zip` desde los assets de esta release.
2. Descomprime el archivo.
3. Abre `chrome://extensions` o `edge://extensions`.
4. Activa el modo desarrollador.
5. Pulsa Cargar descomprimida / Cargar desempaquetado.
6. Selecciona la carpeta que contiene `manifest.json`.

## AbuseIPDB

La integración es opcional. Para activarla, abre WebSec Inspector, entra en Threat Intelligence, pulsa Configurar API Key e introduce tu propia clave de AbuseIPDB.

La reputación de IP es orientativa. Una IP puede pertenecer a una CDN, proveedor cloud o infraestructura compartida, por lo que un reporte asociado a la IP no demuestra por sí mismo que el sitio sea malicioso.

## Nota

WebSec Inspector es una herramienta de análisis orientativo y no sustituye una auditoría de seguridad, pentest o escáner especializado.
