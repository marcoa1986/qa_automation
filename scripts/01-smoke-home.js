const { config, runTest, assert } = require('./helpers');
runTest('Smoke test: página inicial disponible', async driver => {
  await driver.get(config.baseUrl);
  const title = await driver.getTitle();
  const url = await driver.getCurrentUrl();
  assert.ok(url.startsWith(config.baseUrl), `URL inesperada: ${url}`);
  assert.ok(title !== undefined, 'No se pudo leer el título de la página');
  console.log({ title, url });
});
