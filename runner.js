const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');

const profilePort = process.argv[2]; // например: 3001
const taskPath = path.join(__dirname, 'scripts', 'generated_task.json');

if (!profilePort) {
  console.error('❌ Укажите порт профиля: node runner.js <port>');
  process.exit(1);
}

(async () => {
  try {
    // Получаем wsEndpoint для профиля Dolphin через порт
    const versionInfo = await axios.get(`http://127.0.0.1:${profilePort}/json/version`);
    const browser = await puppeteer.connect({ browserWSEndpoint: versionInfo.data.webSocketDebuggerUrl });

    const page = await browser.newPage();

    // Загружаем сценарий
    const script = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));

    const executedClickIds = new Set();

    for (const step of script) {
      if (step.clickId && executedClickIds.has(step.clickId)) {
        continue; // уже выполнен успешный клик из этой группы
      }

      try {
        switch (step.action) {
          case 'setViewport':
            console.log(`🖥️ Установка viewport: ${step.width}x${step.height}`);
            await page.setViewport({ width: step.width, height: step.height });
            break;

          case 'goto':
            console.log(`🌐 Переход: ${step.url}`);
            await page.goto(step.url, { waitUntil: 'networkidle2' });
            break;

          case 'wait':
            const time =
              typeof step.time === 'string' && step.time.startsWith('RANDOM(')
                ? (() => {
                    const [min, max] = step.time
                      .match(/RANDOM\((\d+)-(\d+)\)/)
                      .slice(1)
                      .map(Number);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                  })()
                : step.time;
            console.log(`⏳ Ожидание ${time} мс`);
            await page.waitForTimeout(time);
            break;

          case 'waitForSelector':
            console.log(`🔍 Ожидание селектора: ${step.selector}`);
            await page.waitForSelector(step.selector, { timeout: 10000 });
            break;

          case 'hover':
            console.log(`🖱️ Hover на ${step.selector}`);
            await page.hover(step.selector);
            break;

          case 'click':
            if (step.selectors && Array.isArray(step.selectors)) {
              let clicked = false;

              for (const sel of step.selectors) {
                try {
                  const el = await page.$(sel);
                  if (!el) continue;

                  const box = await el.boundingBox();
                  if (!box) continue;

                  const offset = {
                    x:
                      typeof step.offset.x === 'string' && step.offset.x.startsWith('RANDOM(')
                        ? (() => {
                            const [min, max] = step.offset.x.match(/RANDOM\((\d+)-(\d+)\)/).slice(1).map(Number);
                            return Math.floor(Math.random() * (max - min + 1)) + min;
                          })()
                        : step.offset.x || box.width / 2,
                    y:
                      typeof step.offset.y === 'string' && step.offset.y.startsWith('RANDOM(')
                        ? (() => {
                            const [min, max] = step.offset.y.match(/RANDOM\((\d+)-(\d+)\)/).slice(1).map(Number);
                            return Math.floor(Math.random() * (max - min + 1)) + min;
                          })()
                        : step.offset.y || box.height / 2
                  };

                  const clickX = box.x + offset.x;
                  const clickY = box.y + offset.y;

                  console.log(`✅ Клик по ${sel} (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
                  await page.mouse.click(clickX, clickY);
                  clicked = true;
                  if (step.clickId) executedClickIds.add(step.clickId);
                  break;
                } catch (e) {
                  console.warn(`⚠️ Не удалось кликнуть по ${sel}: ${e.message}`);
                }
              }

              if (!clicked) {
                console.warn(`❌ Не удалось кликнуть ни по одному селектору из fallback-группы`);
              }
            } else {
              console.log(`⚠️ Click без fallback, по ${step.selector}`);
              await page.click(step.selector);
              if (step.clickId) executedClickIds.add(step.clickId);
            }
            break;

          default:
            console.warn(`⚠️ Неизвестное действие: ${step.action}`);
        }
      } catch (err) {
        console.error(`💥 Ошибка на шаге ${step.action}: ${err.message}`);
      }
    }

    // Закрытие вкладки
    await page.close();
    console.log('✅ Задача завершена. Вкладка закрыта.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Ошибка runner.js:', e.message);
    process.exit(1);
  }
})();
