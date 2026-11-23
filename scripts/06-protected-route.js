const { config, css, runTest, assert } = require('./helpers');
runTest('Ruta protegida: acceso directo sin autenticación', async driver => {
  const route = config.selectors.protectedRoute;
  const target = new URL(route, config.baseUrl).toString();
  await driver.get(target);
  await driver.sleep(1500); // espera breve para redirección SPA; ajustar si la aplicación usa otro flujo
  const currentUrl = await driver.getCurrentUrl();
  const loginVisible = await driver.findElement(css(config.selectors.username)).isDisplayed().catch(() => false);
  const remainsOnProtected = currentUrl.includes(route) && !loginVisible;
  assert.ok(!remainsOnProtected, `Parece permitir permanecer en ruta protegida: ${currentUrl}`);
});
