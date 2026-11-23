const { config, css, runTest, waitVisible, login, assert } = require('./helpers');
runTest('Login negativo: contraseña inválida', async driver => {
  await login(driver, config.username, config.invalidPassword);
  await waitVisible(driver, config.selectors.error);
  assert.equal(await driver.findElement(css(config.selectors.success)).isDisplayed().catch(() => false), false,
    'No debe aparecer la vista autenticada tras credenciales inválidas');
});
