const { config, css, runTest, waitVisible, waitClickable, assert } = require('./helpers');
runTest('Login: campos requeridos vacíos', async driver => {
  await driver.get(config.baseUrl);
  const submit = await waitClickable(driver, config.selectors.submit);
  await submit.click();
  // Adaptar a la implementación: validación HTML nativa o mensaje del sistema.
  const username = await driver.findElement(css(config.selectors.username));
  const password = await driver.findElement(css(config.selectors.password));
  const userRequired = await username.getAttribute('required');
  const passRequired = await password.getAttribute('required');
  const userValidity = await username.getAttribute('aria-invalid');
  const passValidity = await password.getAttribute('aria-invalid');
  const errorDisplayed = await driver.findElement(css(config.selectors.error)).isDisplayed().catch(() => false);
  assert.ok(userRequired !== null || passRequired !== null || userValidity === 'true' || passValidity === 'true' || errorDisplayed,
    'Ajusta las validaciones esperadas según el comportamiento real de login');
});
