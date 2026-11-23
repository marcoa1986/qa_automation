require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');

const config = {
  baseUrl: process.env.BASE_URL || 'http://192.168.1.43/',
  username: process.env.QA_USERNAME || '',
  password: process.env.QA_PASSWORD || '',
  invalidPassword: process.env.QA_INVALID_PASSWORD || 'invalid-qa-password',
  selectors: {
    username: process.env.SEL_LOGIN_USERNAME || '[data-testid="username"]',
    password: process.env.SEL_LOGIN_PASSWORD || '[data-testid="password"]',
    submit: process.env.SEL_LOGIN_SUBMIT || '[data-testid="login-submit"]',
    error: process.env.SEL_LOGIN_ERROR || '[data-testid="login-error"]',
    success: process.env.SEL_LOGIN_SUCCESS || '[data-testid="dashboard"]',
    logout: process.env.SEL_LOGOUT_BUTTON || '[data-testid="logout"]',
    protectedRoute: process.env.SEL_PROTECTED_ROUTE || '/dashboard',
    navItems: process.env.SEL_NAV_ITEMS || '[data-testid="main-menu"] a',
    formSubmit: process.env.SEL_FORM_SUBMIT || '[data-testid="form-submit"]',
    formRequiredError: process.env.SEL_FORM_REQUIRED_ERROR || '[data-testid="validation-error"]'
  }
};

function css(selector) { return By.css(selector); }
async function startBrowser() {
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.manage().window().maximize();
  return driver;
}
async function waitVisible(driver, selector, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(css(selector)), timeout, `No se encontró selector: ${selector}`);
  await driver.wait(until.elementIsVisible(el), timeout, `Elemento no visible: ${selector}`);
  return el;
}
async function waitClickable(driver, selector, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(css(selector)), timeout, `No se encontró selector: ${selector}`);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  return el;
}
async function login(driver, username = config.username, password = config.password) {
  assert.ok(username, 'Falta QA_USERNAME en .env');
  assert.ok(password, 'Falta QA_PASSWORD en .env');
  await driver.get(config.baseUrl);
  const userInput = await waitVisible(driver, config.selectors.username);
  const passInput = await waitVisible(driver, config.selectors.password);
  await userInput.clear();
  await userInput.sendKeys(username);
  await passInput.clear();
  await passInput.sendKeys(password);
  const submit = await waitClickable(driver, config.selectors.submit);
  await submit.click();
}
async function screenshotOnError(driver, scriptName) {
  try {
    const path = `evidence-${scriptName}-${Date.now()}.png`;
    await driver.takeScreenshot().then(data => require('fs').writeFileSync(path, data, 'base64'));
    console.error(`Evidencia de fallo guardada: ${path}`);
  } catch (e) { console.error('No se pudo guardar captura:', e.message); }
}
async function runTest(name, testBody) {
  let driver;
  try {
    driver = await startBrowser();
    await testBody(driver);
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}\n${error.stack || error}`);
    if (driver) await screenshotOnError(driver, name.replaceAll(' ', '-'));
    process.exitCode = 1;
  } finally {
    if (driver) await driver.quit();
  }
}
module.exports = { config, css, startBrowser, waitVisible, waitClickable, login, runTest, assert, until };
