# Estrategia QA para NGNIX (revisada)

- Alcance: aplicación web NGNIX, interfaz React, backend Java, base PostgreSQL y servidor web Nginx en Windows.
- ETL: fuera del alcance; no se han informado procesos ETL.
- Automatización UI: JavaScript + Selenium WebDriver.
- Manual: exploración, visuales, reglas aún inestables, seguridad con autorización, rendimiento/carga, operaciones destructivas, validaciones complejas y verificaciones de datos.
- Automatizada: smoke, login positivo/negativo, validación requerida del login, logout, ruta protegida, menú/navegación. La plantilla de formulario requiere adaptación antes de ejecutarse.
- Los selectores de los scripts son placeholders basados en `data-testid`; deben confirmarse contra el DOM real. La suite no es una certificación ni afirma haber probado el sistema.
- Prioridad propuesta: riesgos críticos y flujos repetitivos; después cobertura por módulos, regresión y compatibilidad.
- Seguridad y rendimiento: únicamente en ambiente autorizado, con plan de prueba y umbrales acordados.
