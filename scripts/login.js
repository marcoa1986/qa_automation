
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

async function loginTest() {
    let driver;

    try {
        console.log('INICIO - LOGIN POSITIVO');

        driver = await new Builder()
            .forBrowser('chrome')
            .build();

        // 1. Abrir página de login
        await driver.get('https://the-internet.herokuapp.com/login');
        console.log('Login visible durante 10 segundos...');
        await driver.sleep(10000);

        // 2. Localizar campo de usuario
        const username = await driver.wait(
            until.elementLocated(By.id('username')),
            10000
        );

        // 3. Localizar campo de contraseña
        const password = await driver.wait(
            until.elementLocated(By.id('password')),
            10000
        );

        // 4. Ingresar credenciales de prueba
        await username.sendKeys('tomsmith');
        await password.sendKeys('SuperSecretPassword!');

        console.log('Credenciales ingresadas correctamente');

        // 5. Identificar y presionar Login
        const loginButton = await driver.findElement(
            By.css('button[type="submit"]')
        );

        await loginButton.click();

        // 6. Esperar resultado del login
        await driver.wait(
            until.urlContains('/secure'),
            10000
        );

        // 7. Validar resultado
        const pageText = await driver.findElement(
            By.tagName('body')
        ).getText();

        if (pageText.includes('Secure Area')) {
            console.log('PRUEBA APROBADA: Login exitoso');
            console.log('Mostrando resultado durante 10 segundos...');
            await driver.sleep(10000);
        } else {
            throw new Error('No se encontró el texto Secure Area');
        }

        // 8. Capturar evidencia
        const image = await driver.takeScreenshot();

        fs.writeFileSync(
            'evidencia-login-exitoso.png',
            image,
            'base64'
        );

        console.log('Evidencia guardada: evidencia-login-exitoso.png');

    } catch (error) {
        console.error('PRUEBA FALLIDA:', error.message);

    } finally {
        if (driver) {
            await driver.quit();
            console.log('Navegador cerrado');
        }
    }
}

loginTest();
