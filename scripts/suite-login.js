
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const URL_LOGIN = 'https://the-internet.herokuapp.com/login';

const carpetaEvidencias = path.join(__dirname, 'evidencias');

if (!fs.existsSync(carpetaEvidencias)) {
    fs.mkdirSync(carpetaEvidencias, { recursive: true });
}

const archivoLog = path.join(
    carpetaEvidencias,
    'ejecucion-qa.log'
);

const archivoJSON = path.join(
    carpetaEvidencias,
    'matriz-ejecucion-qa.json'
);

const archivoCSV = path.join(
    carpetaEvidencias,
    'matriz-ejecucion-qa.csv'
);

// ID único de esta ejecución
const ID_EJECUCION = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

// ==========================================
// LOGGER PROFESIONAL QA
// ==========================================

function escribirLog(nivel, mensaje, caso = 'GENERAL') {
    const fecha = new Date().toISOString();

    // Evitar que saltos de línea rompan la estructura del log
    const mensajeLimpio = String(mensaje)
        .replace(/\r?\n/g, ' | ');

    const registro =
        `[${fecha}] [${nivel}] [RUN:${ID_EJECUCION}] [${caso}] ${mensajeLimpio}\n`;

    fs.appendFileSync(archivoLog, registro, 'utf8');

    console.log(registro.trim());
}

const logQA = {
    info: (mensaje, caso = 'GENERAL') =>
        escribirLog('INFO', mensaje, caso),

    warn: (mensaje, caso = 'GENERAL') =>
        escribirLog('WARN', mensaje, caso),

    error: (mensaje, caso = 'GENERAL') =>
        escribirLog('ERROR', mensaje, caso),

    inicio: (caso, nombre) =>
        escribirLog('INFO', `INICIO DEL CASO: ${nombre}`, caso),

    fin: (caso, resultado, duracion) =>
        escribirLog(
            resultado === 'APROBADO' ? 'INFO' : 'ERROR',
            `FIN DEL CASO | Resultado: ${resultado} | Duración: ${duracion} ms`,
            caso
        )
};

// Separador para distinguir las ejecuciones
logQA.info('==========================================');
logQA.info('INICIO DE SUITE AUTOMATIZADA QA');
logQA.info(`URL de pruebas: ${URL_LOGIN}`);
logQA.info('==========================================');

// ==========================================
// ASSERTIONS
// ==========================================

class AssertionError extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = 'AssertionError';
    }
}

function verificar(condicion, mensaje) {
    if (!condicion) {
        throw new AssertionError(mensaje);
    }
}

// ==========================================
// UTILIDADES
// ==========================================

function marcaTiempo() {
    return new Date()
        .toISOString()
        .replace(/[:.]/g, '-');
}

function convertirCSV(valor) {
    return '"' +
        String(valor ?? '')
            .replace(/"/g, '""') +
        '"';
}

// ==========================================
// CONFIGURAR CHROME
// Compatible con ejecución local y CI
// ==========================================

function crearDriver() {
    const options = new chrome.Options();

    // Permite usar Chrome sin ventana gráfica en CI
    if (process.env.CI === 'true') {
        options.addArguments(
            '--headless=new',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
        );
    }

    // Solicitar registros de consola del navegador
    options.setLoggingPrefs({
        browser: 'ALL'
    });

    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

// ==========================================
// CAPTURA DE ERRORES DE CONSOLA
// ==========================================

async function obtenerErroresConsola(driver, idCaso) {
    try {
        const registros = await driver.manage()
            .logs()
            .get('browser');

        const errores = registros
            .filter(registro =>
                registro.level.name === 'SEVERE'
            )
            .map(registro => ({
                nivel: registro.level.name,
                mensaje: registro.message,
                fecha: new Date(
                    registro.timestamp
                ).toISOString()
            }));

        if (errores.length > 0) {
            logQA.warn(
                `Se detectaron ${errores.length} mensajes SEVERE en consola`,
                idCaso
            );

            errores.forEach(error => {
                logQA.warn(
                    `Chrome SEVERE: ${error.mensaje}`,
                    idCaso
                );
            });
        } else {
            logQA.info(
                'No se detectaron mensajes SEVERE en consola',
                idCaso
            );
        }

        return errores;

    } catch (error) {
        logQA.warn(
            `No fue posible consultar logs del navegador: ${error.message}`,
            idCaso
        );

        return [{
            nivel: 'NO_DISPONIBLE',
            mensaje: error.message,
            fecha: new Date().toISOString()
        }];
    }
}

// ==========================================
// EJECUTAR UN CASO DE PRUEBA
// ==========================================

async function ejecutarCaso(
    id,
    modulo,
    riesgo,
    nombre,
    prueba
) {
    let driver;

    const inicioMs = Date.now();

    const resultado = {
        id,
        modulo,
        riesgo,
        caso: nombre,
        estado: 'ERROR',
        inicio: new Date().toISOString(),
        fin: null,
        duracionMs: 0,
        mensaje: '',
        evidencia: null,
        erroresTecnicos: [],
        alertaTecnica: false
    };

    logQA.inicio(id, nombre);

    try {
        logQA.info('Iniciando navegador Chrome', id);

        driver = await crearDriver();

        logQA.info('Chrome iniciado correctamente', id);

        await driver.get(URL_LOGIN);

        logQA.info('Página de login cargada', id);

        await driver.wait(
            until.elementLocated(By.id('username')),
            10000
        );

        logQA.info('Campo username localizado', id);

        await prueba(driver, id);

        resultado.estado = 'APROBADO';
        resultado.mensaje = 'Criterios funcionales cumplidos.';

        logQA.info(
            'Validación funcional completada',
            id
        );

    } catch (error) {
        resultado.estado =
            error instanceof AssertionError
                ? 'FALLIDO'
                : 'ERROR';

        resultado.mensaje = error.message;

        logQA.error(
            `${resultado.estado}: ${error.message}`,
            id
        );

    } finally {
        if (driver) {
            // Recopilar logs antes de cerrar Chrome
            resultado.erroresTecnicos =
                await obtenerErroresConsola(driver, id);

            resultado.alertaTecnica =
                resultado.erroresTecnicos.some(
                    error => error.nivel === 'SEVERE'
                );

            // Captura de pantalla
            try {
                const archivo = `${id}_${marcaTiempo()}.png`;

                const ruta = path.join(
                    carpetaEvidencias,
                    archivo
                );

                const imagen = await driver.takeScreenshot();

                fs.writeFileSync(
                    ruta,
                    imagen,
                    'base64'
                );

                resultado.evidencia = ruta;

                logQA.info(
                    `Captura guardada: ${ruta}`,
                    id
                );

                console.log('CAPTURA:', ruta);

            } catch (errorCaptura) {
                resultado.mensaje +=
                    ` | Error de captura: ${errorCaptura.message}`;

                logQA.error(
                    `Error al generar captura: ${errorCaptura.message}`,
                    id
                );
            }

            // Cerrar Chrome
            try {
                await driver.quit();

                logQA.info(
                    'Navegador cerrado correctamente',
                    id
                );

            } catch (errorCierre) {
                resultado.mensaje +=
                    ` | Error al cerrar Chrome: ${errorCierre.message}`;

                logQA.error(
                    `Error al cerrar navegador: ${errorCierre.message}`,
                    id
                );
            }
        }

        resultado.fin = new Date().toISOString();

        resultado.duracionMs = Date.now() - inicioMs;

        logQA.fin(
            id,
            resultado.estado,
            resultado.duracionMs
        );

        console.log(id, resultado.estado);
    }

    return resultado;
}

// ==========================================
// CP-001: CONTRASEÑA INCORRECTA
// ==========================================

async function contraseñaIncorrecta(driver, id) {
    logQA.info('Ingresando usuario válido', id);

    await driver.findElement(By.id('username'))
        .sendKeys('tomsmith');

    logQA.info('Ingresando contraseña incorrecta', id);

    await driver.findElement(By.id('password'))
        .sendKeys('ClaveIncorrecta123');

    logQA.info('Presionando botón Login', id);

    await driver.findElement(
        By.css('button[type="submit"]')
    ).click();

    const mensaje = await driver.wait(
        until.elementLocated(By.id('flash')),
        10000
    );

    const texto = await mensaje.getText();

    logQA.info(
        `Mensaje recibido: ${texto.trim()}`,
        id
    );

    verificar(
        texto.includes('Your password is invalid!'),
        'Mensaje esperado no encontrado: ' + texto
    );
}

// ==========================================
// CP-002: USUARIO VACÍO
// ==========================================

async function usuarioVacio(driver, id) {
    logQA.info('Dejando usuario vacío', id);

    await driver.findElement(By.id('password'))
        .sendKeys('SuperSecretPassword!');

    logQA.info('Presionando botón Login', id);

    await driver.findElement(
        By.css('button[type="submit"]')
    ).click();

    const mensaje = await driver.wait(
        until.elementLocated(By.id('flash')),
        10000
    );

    const texto = await mensaje.getText();

    logQA.info(
        `Mensaje recibido: ${texto.trim()}`,
        id
    );

    verificar(
        texto.includes('Your username is invalid!'),
        'No se rechazó el usuario vacío: ' + texto
    );
}

// ==========================================
// CP-003: CONTRASEÑA VACÍA
// ==========================================

async function contraseñaVacia(driver, id) {
    logQA.info('Ingresando usuario válido', id);

    await driver.findElement(By.id('username'))
        .sendKeys('tomsmith');

    logQA.info('Dejando contraseña vacía', id);

    await driver.findElement(
        By.css('button[type="submit"]')
    ).click();

    const mensaje = await driver.wait(
        until.elementLocated(By.id('flash')),
        10000
    );

    const texto = await mensaje.getText();

    logQA.info(
        `Mensaje recibido: ${texto.trim()}`,
        id
    );

    verificar(
        texto.includes('Your password is invalid!'),
        'No se rechazó la contraseña vacía: ' + texto
    );
}

// ==========================================
// CP-004: CERRAR SESIÓN
// ==========================================

async function cerrarSesion(driver, id) {
    logQA.info('Ingresando credenciales válidas', id);

    await driver.findElement(By.id('username'))
        .sendKeys('tomsmith');

    await driver.findElement(By.id('password'))
        .sendKeys('SuperSecretPassword!');

    logQA.info('Presionando botón Login', id);

    await driver.findElement(
        By.css('button[type="submit"]')
    ).click();

    await driver.wait(
        until.urlContains('/secure'),
        10000
    );

    logQA.info('Login exitoso, entrando a Secure Area', id);

    await driver.findElement(
        By.css('a[href="/logout"]')
    ).click();

    logQA.info('Se presionó Logout', id);

    await driver.wait(
        until.urlContains('/login'),
        10000
    );

    const texto = await driver.findElement(
        By.id('flash')
    ).getText();

    logQA.info(
        `Mensaje de logout: ${texto.trim()}`,
        id
    );

    verificar(
        texto.includes('You logged out'),
        'No se confirmó el cierre de sesión: ' + texto
    );
}

// ==========================================
// CP-005: MONITOREO TÉCNICO
// ==========================================

async function monitorearErroresTecnicos(driver, id) {
    logQA.info(
        'Iniciando login para monitoreo técnico',
        id
    );

    await driver.findElement(By.id('username'))
        .sendKeys('tomsmith');

    await driver.findElement(By.id('password'))
        .sendKeys('SuperSecretPassword!');

    await driver.findElement(
        By.css('button[type="submit"]')
    ).click();

    await driver.wait(
        until.urlContains('/secure'),
        10000
    );

    logQA.info(
        'Login realizado para monitoreo técnico',
        id
    );

    console.log(
        'Login realizado para monitoreo técnico.'
    );
}

// ==========================================
// EJECUTAR SUITE COMPLETA
// ==========================================

async function ejecutarSuite() {
    logQA.info('Preparando casos de prueba');

    const casos = [
        {
            id: 'CP-001',
            modulo: 'Autenticación',
            riesgo: 'ALTO',
            nombre: 'Contraseña incorrecta',
            prueba: contraseñaIncorrecta
        },
        {
            id: 'CP-002',
            modulo: 'Autenticación',
            riesgo: 'MEDIO',
            nombre: 'Usuario vacío',
            prueba: usuarioVacio
        },
        {
            id: 'CP-003',
            modulo: 'Autenticación',
            riesgo: 'MEDIO',
            nombre: 'Contraseña vacía',
            prueba: contraseñaVacia
        },
        {
            id: 'CP-004',
            modulo: 'Gestión de sesión',
            riesgo: 'ALTO',
            nombre: 'Cerrar sesión',
            prueba: cerrarSesion
        },
        {
            id: 'CP-005',
            modulo: 'Monitoreo técnico',
            riesgo: 'MEDIO',
            nombre: 'Detección de errores técnicos',
            prueba: monitorearErroresTecnicos
        }
    ];

    const resultados = [];

    logQA.info(
        `Total de casos programados: ${casos.length}`
    );

    for (const caso of casos) {
        const resultado = await ejecutarCaso(
            caso.id,
            caso.modulo,
            caso.riesgo,
            caso.nombre,
            caso.prueba
        );

        resultados.push(resultado);
    }

    // ==========================================
    // RESUMEN QA
    // ==========================================

    const resumen = {
        proyecto: 'Suite QA Selenium - Práctica',
        idEjecucion: ID_EJECUCION,
        fechaEjecucion: new Date().toISOString(),
        totalCasos: resultados.length,

        aprobados: resultados.filter(
            r => r.estado === 'APROBADO'
        ).length,

        fallidos: resultados.filter(
            r => r.estado === 'FALLIDO'
        ).length,

        errores: resultados.filter(
            r => r.estado === 'ERROR'
        ).length,

        alertasTecnicas: resultados.filter(
            r => r.alertaTecnica
        ).length,

        resultados
    };

    // ==========================================
    // GENERAR JSON
    // ==========================================

    fs.writeFileSync(
        archivoJSON,
        JSON.stringify(resumen, null, 2),
        'utf8'
    );

    logQA.info(`Reporte JSON generado: ${archivoJSON}`);

    // ==========================================
    // GENERAR CSV
    // ==========================================

    const columnas = [
        'ID',
        'Modulo',
        'Riesgo',
        'Caso',
        'Resultado',
        'Inicio',
        'Fin',
        'DuracionMs',
        'Mensaje',
        'Evidencia',
        'AlertaTecnica',
        'ErroresTecnicos'
    ];

    const filas = resultados.map(r => [
        r.id,
        r.modulo,
        r.riesgo,
        r.caso,
        r.estado,
        r.inicio,
        r.fin,
        r.duracionMs,
        r.mensaje,
        r.evidencia || '',
        r.alertaTecnica ? 'SI' : 'NO',
        JSON.stringify(r.erroresTecnicos)
    ]);

    const contenidoCSV = [
        columnas.map(convertirCSV).join(';'),
        ...filas.map(fila =>
            fila.map(convertirCSV).join(';')
        )
    ].join('\n');

    fs.writeFileSync(
        archivoCSV,
        '\uFEFF' + contenidoCSV,
        'utf8'
    );

    logQA.info(`Reporte CSV generado: ${archivoCSV}`);

    // ==========================================
    // RESUMEN EN CONSOLA
    // ==========================================

    console.log('\n======= RESUMEN QA =======');
    console.log('ID ejecución:', resumen.idEjecucion);
    console.log('Total:', resumen.totalCasos);
    console.log('Aprobados:', resumen.aprobados);
    console.log('Fallidos:', resumen.fallidos);
    console.log('Errores:', resumen.errores);
    console.log('Alertas técnicas:', resumen.alertasTecnicas);
    console.log('JSON:', archivoJSON);
    console.log('CSV:', archivoCSV);
    console.log('LOG:', archivoLog);
    console.log('==========================');

    logQA.info('==========================================');
    logQA.info('FIN DE SUITE AUTOMATIZADA QA');
    logQA.info(`Total: ${resumen.totalCasos}`);
    logQA.info(`Aprobados: ${resumen.aprobados}`);
    logQA.info(`Fallidos: ${resumen.fallidos}`);
    logQA.info(`Errores: ${resumen.errores}`);
    logQA.info(`Alertas técnicas: ${resumen.alertasTecnicas}`);
    logQA.info('==========================================');

    // ==========================================
    // CONTROL DE SALIDA PARA CI/CD
    // ==========================================

    // Fallos funcionales y errores de ejecución bloquean el pipeline.
    // Alertas SEVERE se reportan, pero no bloquean por defecto.
    // Para hacerlas bloqueantes, define:
    // QA_FAIL_ON_TECH_ALERTS=true

    const bloquearPorAlertas =
        process.env.QA_FAIL_ON_TECH_ALERTS === 'true';

    if (
        resumen.fallidos > 0 ||
        resumen.errores > 0 ||
        (bloquearPorAlertas && resumen.alertasTecnicas > 0)
    ) {
        logQA.error(
            'SUITE NO APROBADA. Se devuelve código de salida 1.'
        );

        process.exitCode = 1;
    } else {
        logQA.info(
            'SUITE APROBADA según los criterios configurados.'
        );

        process.exitCode = 0;
    }
}

// ==========================================
// MANEJO DE ERROR GENERAL
// ==========================================

ejecutarSuite().catch(error => {
    logQA.error(
        `ERROR GENERAL DE SUITE: ${error.stack || error.message}`
    );

    console.error('ERROR GENERAL:', error);

    process.exitCode = 1;
});
