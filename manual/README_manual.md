# Casos de prueba manuales - NGNIX

Estos casos deben ejecutarse por tester; no forman parte de scripts Selenium. Usar solo ambiente QA y datos autorizados.

| ID | Módulo | Escenario | Resultado esperado |
|---|---|---|---|
| MAN-01 | Login | Usuario válido, password válida | Autenticación y acceso autorizado |
| MAN-02 | Login | Password incorrecta | Mensaje genérico; no autentica |
| MAN-03 | Login | Usuario no registrado | Rechazo sin revelar datos sensibles |
| MAN-04 | Login | Campos vacíos | Validación; no autentica |
| MAN-05 | Login | Espacios y caracteres límite | Tratamiento conforme a reglas documentadas |
| MAN-06 | Seguridad | Repetición de intentos fallidos | Controles según política configurada |
| MAN-07 | Sesión | Expiración de sesión | Reautenticación solicitada o sesión inválida |
| MAN-08 | Seguridad | Rol sin permiso a módulo | Acceso denegado; no expone contenido protegido |
| MAN-09 | Seguridad | Intento de URL protegida sin login | Redirección/bloqueo efectivo |
| MAN-10 | UI | Exploración de menú y navegación | Módulos habilitados abren correctamente |
| MAN-11 | UI | Visualización responsive / zoom | Contenido usable; sin superposición grave |
| MAN-12 | Formulario | Campos obligatorios y mensajes | Validaciones claras y no guarda datos inválidos |
| MAN-13 | Formulario | Valores límite, formato, caracteres | Reglas respetadas; errores entendibles |
| MAN-14 | CRUD | Editar datos y verificar persistencia | Cambios se guardan y muestran correctamente |
| MAN-15 | CRUD | Borrado/desactivación y cancelación | Confirmación; cancelación no altera datos; borrado solo autorizado |
| MAN-16 | Datos | Integridad y relaciones (verificación SQL read-only) | Datos y relaciones consistentes según reglas |
| MAN-17 | Reportes | Filtros, búsquedas y paginación | Resultados coinciden con dataset de QA |
| MAN-18 | Reportes | Totales/indicadores | Cálculos conciliados contra referencia independiente |
| MAN-19 | Seguridad | Revisar exposición de datos en mensajes/logs | No expone contraseñas, tokens ni información sensible |
| MAN-20 | Nginx | Reinicio/recarga tras cambio aprobado de configuración | Servicio y rutas vuelven a operar; registrar logs |
| MAN-21 | Rendimiento | Carga/estrés con perfil y umbral aprobados | Métricas comparadas con criterios de aceptación |
| MAN-22 | Compatibilidad | Navegador secundario soportado | Flujo crítico funciona de acuerdo con soporte declarado |
| MAN-23 | Recuperación | Interrupción de conexión o backend no disponible | Mensaje/recuperación apropiados; no pierde datos confirmados |
| MAN-24 | Regresión exploratoria | Exploración de cambios recientes | Hallazgos documentados con evidencia y defectos |

## Evidencia mínima
Registrar ID, fecha, tester, ambiente, datos QA utilizados (sin secretos), pasos, resultado esperado/obtenido, Pass/Fail/Blocked, captura/log, ID de defecto y observaciones.
