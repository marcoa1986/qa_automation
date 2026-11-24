const { By, until } = require('selenium-webdriver');

class HomePage {
  constructor(driver) {
    this.driver = driver;
    
    // 1. Localizadores del DOM (Selenium By)
    this.barraBusqueda = By.css('#cb1-edit');
    this.botonBuscar = By.css('button.nav-search-btn');
  }

  // 2. Acciones sobre los elementos
  async irAInicio() {
    await this.driver.get('https://mercadolibre.com.mx');
  }

  async buscarProducto(producto) {
    const input = await this.driver.wait(
      until.elementLocated(this.barraBusqueda), 
      5000
    );
    await input.clear();
    await input.sendKeys(producto);

    const boton = await this.driver.findElement(this.botonBuscar);
    await boton.click();
  }
}

module.exports = { HomePage };