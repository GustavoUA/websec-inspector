# Política de privacidad — WebSec Inspector

Versión 1.1.0

Desarrollador y editor: **SecTF Labs**.

WebSec Inspector es una extensión de análisis de seguridad web para Chrome y Edge. La mayor parte del análisis se realiza localmente en el navegador. La versión 1.1.0 incorpora además una integración opcional de Threat Intelligence con AbuseIPDB.

## Datos utilizados para el análisis local

Para generar los resultados, WebSec Inspector puede acceder a:

- URL y hostname de la pestaña activa;
- cabeceras HTTP de la navegación principal;
- redirecciones observadas;
- cookies asociadas a la URL y atributos como Secure, HttpOnly y SameSite;
- presencia de formularios y campos de contraseña;
- orígenes de recursos de terceros observados en la página.

Estos datos se utilizan para proporcionar el análisis solicitado por el usuario.

WebSec Inspector:

- no vende datos personales ni datos de navegación;
- no crea perfiles publicitarios;
- no utiliza los datos para publicidad, evaluación crediticia ni fines ajenos a las funciones de seguridad de la extensión;
- no utiliza analítica o telemetría remota de SecTF Labs;
- no almacena contraseñas ni valores introducidos por el usuario en formularios web;
- no modifica el contenido de las páginas ni altera sus solicitudes con fines distintos del funcionamiento de la extensión;
- no mantiene en servidores de SecTF Labs un historial de las páginas analizadas.

## Threat Intelligence y AbuseIPDB

La integración con AbuseIPDB es opcional y requiere que el usuario configure su propia API Key.

Cuando esta integración está configurada y el usuario ejecuta un análisis, WebSec Inspector puede resolver el hostname de la página a una dirección IP y enviar **esa dirección IP** a la API de AbuseIPDB para consultar su reputación.

La consulta se utiliza exclusivamente para obtener información de Threat Intelligence, como:

- Abuse Confidence Score;
- número de reportes asociados a la IP;
- país;
- ISP;
- dominio asociado;
- tipo de uso de la infraestructura.

WebSec Inspector utiliza el endpoint de consulta (`check`) de AbuseIPDB. La extensión no reporta automáticamente direcciones IP como abusivas.

AbuseIPDB es un servicio externo e independiente de SecTF Labs. Las solicitudes realizadas a su API están sujetas a las políticas, condiciones y prácticas de privacidad de AbuseIPDB.

La reputación de una dirección IP se utiliza únicamente como una señal complementaria. Una IP puede pertenecer a una CDN, proveedor cloud, hosting o infraestructura compartida y, por tanto, un reporte asociado a la IP no demuestra por sí mismo que el sitio visitado sea malicioso.

## Resolución DNS

Para poder consultar AbuseIPDB, WebSec Inspector puede utilizar un servicio DNS-over-HTTPS para resolver el hostname analizado a una dirección IP. Esto implica que el hostname utilizado en la consulta DNS puede ser transmitido al proveedor DNS correspondiente para realizar la resolución.

Esta operación se realiza únicamente como parte de la función de Threat Intelligence solicitada por el usuario.

## API Key de AbuseIPDB

La API Key introducida por el usuario se almacena mediante `chrome.storage.local` en el perfil local del navegador.

La API Key:

- no forma parte del código fuente publicado en GitHub;
- no se incluye en los informes JSON o HTML generados por WebSec Inspector;
- no se transmite a SecTF Labs;
- se utiliza únicamente para autenticar las consultas realizadas a AbuseIPDB.

El usuario es responsable de mantener su API Key privada y de cumplir las condiciones de uso del proveedor.

Para una distribución pública o comercial futura, SecTF Labs podrá sustituir el almacenamiento de credenciales en el cliente por una arquitectura backend que evite exponer credenciales de servicio dentro de la extensión.

## Caché local

WebSec Inspector puede almacenar temporalmente resultados de Threat Intelligence para evitar consultas repetidas innecesarias y reducir el consumo de cuota de las APIs externas.

Esta caché es local al navegador y tiene una duración limitada. No se utiliza para crear un historial de navegación ni se transmite a SecTF Labs.

## Informes exportados

Los informes JSON y HTML solo se generan cuando el usuario pulsa el botón correspondiente. Se crean localmente mediante el mecanismo de descarga del navegador.

Los informes pueden contener la URL analizada, resultados de las comprobaciones, cabeceras, metadatos de cookies y resultados de Threat Intelligence mostrados por la extensión. **La API Key no se incluye en los informes.**

El usuario decide dónde guardar los informes y con quién compartirlos.

## Finalidad de los permisos

- **activeTab:** identificar y analizar la pestaña seleccionada por el usuario.
- **webRequest y host_permissions:** observar cabeceras, navegación y redirecciones necesarias para el análisis.
- **cookies:** evaluar atributos de seguridad como Secure, HttpOnly y SameSite.
- **storage:** almacenar localmente la configuración de la integración, incluida la API Key proporcionada por el usuario, y la caché temporal necesaria para el funcionamiento de Threat Intelligence.
- **content script:** obtener señales de seguridad visibles desde la página, como formularios y orígenes de recursos.

## Transferencia a terceros

WebSec Inspector no transmite los resultados del análisis a SecTF Labs.

Cuando el usuario activa y utiliza funciones de Threat Intelligence, determinados datos técnicos estrictamente necesarios pueden transmitirse a proveedores externos para prestar esa función. En la versión 1.1.0 esto incluye la dirección IP consultada en AbuseIPDB y, cuando sea necesario para resolverla, el hostname enviado al servicio DNS utilizado.

No se realizan estas transferencias con fines publicitarios, comerciales basados en datos de navegación ni para crear perfiles de usuario.

## Uso limitado

La información obtenida mediante las API del navegador se utiliza exclusivamente para proporcionar las funciones de análisis de seguridad solicitadas por el usuario. No se vende, no se utiliza para publicidad personalizada, no se emplea para determinar solvencia o crédito y no se utiliza para fines incompatibles con la funcionalidad declarada de WebSec Inspector.

La transmisión de datos técnicos a servicios externos se limita a lo necesario para ejecutar las funciones de Threat Intelligence que el usuario haya configurado y solicitado.

## Cambios en esta política

Esta política deberá actualizarse cuando una versión futura incorpore nuevos proveedores externos, modifique los datos tratados o cambie de forma significativa la recopilación, almacenamiento o transmisión de información.
