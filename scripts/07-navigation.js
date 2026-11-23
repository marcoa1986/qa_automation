const { config, css, runTest, login, waitVisible, assert } = require('./helpers');
runTest('Navegación: menú visible y enlaces disponibles', async driver => {
  await login(driver);
  await waitVisible(driver, config.selectors.success);
  const items = await driver.findElements(css(config.selectors.navItems));
  assert.ok(items.length > 0, `No se encontraron enlaces con selector: ${config.selectors.navItems}`);
  const labels = [];
  for (const item of items) {
    if (await item.isDisplayed()) labels.push((await item.getText()).trim());
  }
  assert.ok(labels.some(Boolean), 'No se encontró texto visible en enlaces de menú');
  console.log('Opciones de navegación visibles:', labels);
});
