const { config, css, runTest, login, waitClickable, assert } = require('./helpers');
runTest('Plantilla: validación de formulario (requiere adaptar módulo)', async driver => {
  // TODO: definir URL del módulo, precondiciones, campos y datos de prueba reales.
  // Este template no debe ejecutarse sin adaptar selectores y reglas del módulo.
  await login(driver);
  const submit = await waitClickable(driver, config.selectors.formSubmit);
  await submit.click();
  const validationVisible = await driver.findElement(css(config.selectors.formRequiredError)).isDisplayed().catch(() => false);
  assert.ok(validationVisible, 'Adapta SEL_FORM_REQUIRED_ERROR al mensaje/indicador real de validación');
});
