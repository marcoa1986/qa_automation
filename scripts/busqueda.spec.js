const { Builder, until } = require('selenium-webdriver');
const assert = require('assert');
const { HomePage } = require('./HomePage');

(async function pruebaBusquedaMercadoLibre() {
  // 1. Inicializar el navegador Chrome con Selenium
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // 2. Instanciar tu clase POM
    const homePage = new HomePage(driver);

    // 3. Ejecutar el flujo de prueba
    console.log('Abriendo Mercado Libre...');
    await homePage.irAInicio();

    console.log('Buscando producto...');
    await homePage.buscarProducto('Laptop gamer');

    // 4. Esperar a que la URL refleje la búsqueda
    await driver.wait(until.urlContains('laptop-gamer'), 5000);

    // 5. Validación (Assert nativo de Node.js)
    const urlActual = await driver.getCurrentUrl();
    assert.ok(
      urlActual.includes('laptop-gamer'),
      `Error: La URL esperada debía contener 'laptop-gamer', pero fue: ${urlActual}`
    );

    console.log('✅ PRUEBA EXITOSA: Se mostraron los resultados correctamente.');

  } catch (error) {
    console.error('❌ PRUEBA FALLIDA:', error.message);
  } finally {
    // 6. Cerrar el navegador sin importar si pasó o falló
    await driver.quit();
  }
})();

// Prueba de Pull Request
