const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });
    const page = await browser.newPage();

    // Переходим на страницу
    await page.goto('https://kodaktor.ru/g/exp260425');

    // Начинаем замер времени
    const startTime = Date.now();

    // Нажимаем кнопку
    await page.click('button');

    // Ждем появления кода в заголовке
    await page.waitForFunction(() => {
        return document.title !== 'exp260425';
    });

    // Получаем заголовок (уникальный код)
    const uniqueCode = await page.title();

    // Замеряем время выполнения
    const endTime = Date.now();
    const delay = (endTime - startTime) / 1000; // в секундах

    console.log('Уникальный код:', uniqueCode);
    console.log('Время генерации:', delay, 'секунд');

    await browser.close();
})();