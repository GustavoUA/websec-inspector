# Política de privacidad — WebSec Inspector

Versión 1.0.0

Desarrollador y editor: **SecTF Labs**.

WebSec Inspector realiza el análisis localmente en el navegador. Para generar los resultados puede acceder a la URL de la pestaña activa, cabeceras HTTP de la navegación principal, cookies asociadas a esa URL, formularios y orígenes de recursos observados por la página.

WebSec Inspector v1.0.0:

- no transmite el historial, las URLs, las cookies ni los resultados a SecTF Labs ni a servidores externos;
- no vende datos ni crea perfiles publicitarios;
- no utiliza analítica o telemetría remota;
- no almacena contraseñas ni valores introducidos en formularios;
- no modifica el contenido ni las solicitudes de las páginas;
- no guarda un historial de análisis.

Los informes JSON y HTML solo se generan cuando el usuario pulsa el botón correspondiente. Se crean localmente mediante el mecanismo de descarga del navegador y contienen las señales mostradas en el informe, incluidos URL, cabeceras y metadatos de cookies. El usuario decide dónde guardarlos y con quién compartirlos.

## Finalidad de los permisos

- **activeTab:** identificar y analizar la pestaña seleccionada por el usuario.
- **webRequest y host_permissions:** observar las cabeceras y redirecciones de la navegación.
- **cookies:** evaluar atributos como Secure, HttpOnly y SameSite.
- **storage:** reservado para preferencias locales de la extensión; v1.0.0 no mantiene historial remoto ni local de análisis.
- **content script:** obtener formularios y orígenes de recursos visibles desde la página.

Esta política debe revisarse antes de publicar una versión posterior que cambie la recopilación, almacenamiento o transmisión de datos.
