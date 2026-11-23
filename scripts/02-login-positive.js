const { config, css, runTest, waitVisible, login, assert } = require('./helpers');
runTest('Login positivo: credenciales QA válidas', async driver => {
  await login(driver);
  await waitVisible(driver, config.selectors.success);
  assert.ok(await driver.findElement(css(config.selectors.success)).isDisplayed(), 'El elemento de éxito no está visible');
});
