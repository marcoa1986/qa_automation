# Suite base de QA NGNIX — JavaScript + Selenium WebDriver

**No incluye pruebas ETL.** La suite usa JavaScript (Node.js) y Selenium WebDriver para automatización de navegador. El sistema de destino configurado inicialmente es `http://192.168.1.43/`.

## Requisitos
- Windows 10/11
- Node.js LTS
- Google Chrome instalado
- VS Code
- Acceso autorizado a ambiente QA y cuentas de prueba

## Instalación en Windows / VS Code
1. Extrae el ZIP y abre la carpeta `NGNIX_QA_Selenium` en VS Code.
2. Abre Terminal > New Terminal. Si PowerShell bloquea `npm.ps1`, usa `npm.cmd`.
3. Ejecuta: `npm.cmd install`
4. Copia `.env.example` como `.env` y modifica selectores y credenciales QA. No uses cuentas ni datos productivos.
5. Verifica el ambiente en el navegador antes de ejecutar.

## Scripts
- `npm.cmd run smoke` — disponibilidad básica y lectura de título/URL.
- `npm.cmd run login-positive` — acceso con credenciales válidas.
- `npm.cmd run login-negative` — rechazo de contraseña inválida.
- `npm.cmd run login-required` — campos vacíos / validación requerida.
- `npm.cmd run logout` — cerrar sesión y comprobar retorno.
- `npm.cmd run route-protection` — ruta protegida sin autenticación.
- `npm.cmd run navigation` — menú/enlaces visibles tras login.
- `npm.cmd run form-validation` — plantilla; **no ejecutar sin adaptar** módulo, selectores y resultado esperado.

## Configurar selectores
Los selectores de `.env.example` son ejemplos con `data-testid`; no se han inspeccionado los HTML reales de NGNIX. Deben sustituirse por selectores existentes. Recomendación para desarrollo: agregar `data-testid` estable en los controles que QA necesita.

## Evidencia
Los scripts capturan screenshot al fallar y guardan `evidence-<script>-<timestamp>.png` en el directorio desde donde se ejecuta el comando. Conserva logs y capturas como evidencia del ciclo.

## Alcance y precauciones
- Los scripts son starter tests; su validez depende de ajustar selectores y expectativas al sistema real.
- Ejecutar primero en QA, con datos de prueba no sensibles.
- Los escenarios de eliminación, roles, seguridad, carga y operaciones destructivas son manuales en la matriz y requieren autorización.
- No se incluye JMeter, Playwright, ETL ni conexión directa a PostgreSQL en esta suite Selenium.
