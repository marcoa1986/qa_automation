const { config, css, runTest, login, waitClickable, assert } = require('./helpers');
runTest('Cerrar sesión y comprobar retorno a login', async driver => {
  await login(driver);
  await driver.findElement(css(config.selectors.success));
  const logoutButton = await waitClickable(driver, config.selectors.logout);
  await logoutButton.click();
  await driver.wait(async d => {
    const current = await d.getCurrentUrl();
    const loginVisible = await d.findElement(config.selectors.username).isDisplayed().catch(() => false);
    return loginVisible || current === config.baseUrl;
  }, 10000, 'No se observó retorno al login después de cerrar sesión');
  assert.ok(true, 'Logout verificado con condición configurada');
});
