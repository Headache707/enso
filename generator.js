const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const INPUT_FILE = path.join(__dirname, 'test_task.txt');

function randTemplate(min, max) {
  return `RANDOM(${min}-${max})`;
}

function extractSelectorsFromHTML(html) {
  const $ = cheerio.load(html);
  const el = $('*').first();
  const selectors = [];

  if (el.attr('id')) selectors.push(`#${el.attr('id')}`);
  if (el.attr('name')) selectors.push(`[name='${el.attr('name')}']`);
  if (el.attr('aria-label')) selectors.push(`[aria-label="${el.attr('aria-label')}"]`);
  if (el.attr('value')) selectors.push(`[value="${el.attr('value')}"]`);
  if (el.attr('data-testid')) selectors.push(`[data-testid="${el.attr('data-testid')}"]`);
  if (el.attr('class')) {
    const classSelector = '.' + el.attr('class').trim().split(/\s+/).join('.');
    selectors.push(classSelector);
  }
  if (el.attr('type')) selectors.push(`[type='${el.attr('type')}']`);

  return [...new Set(selectors)];
}

function prioritizeSelectors(selList) {
  const weights = sel => {
    if (sel.startsWith('#')) return 1;
    if (sel.startsWith('[name=')) return 2;
    if (sel.startsWith('[aria-label=')) return 3;
    if (sel.startsWith('[value=')) return 4;
    if (sel.startsWith('[data-testid=')) return 5;
    if (sel.startsWith('.')) return 6;
    return 99;
  };
  return selList.sort((a, b) => weights(a) - weights(b));
}

function parseInputFile(content) {
  const lines = content.split(/\r?\n/);

  let url = null;
  let jsonBlockLines = [];
  let htmlBlocks = [];

  let currentBlock = [];
  let phase = 0; // 0: URL, 1: JSON, 2: HTML

  for (let line of lines) {
    const trimmed = line.trim();

    if (phase === 0) {
      if (trimmed.length > 0) {
        url = trimmed;
        phase = 1;
      }
    } else if (phase === 1) {
      if (trimmed.length === 0 && currentBlock.length > 0) {
        jsonBlockLines = [...currentBlock];
        currentBlock = [];
        phase = 2;
      } else {
        currentBlock.push(line);
      }
    } else if (phase === 2) {
      if (trimmed.length === 0 && currentBlock.length > 0) {
        htmlBlocks.push(currentBlock.join('\n').trim());
        currentBlock = [];
      } else {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    htmlBlocks.push(currentBlock.join('\n').trim());
  }

  if (!url) throw new Error('❌ Не удалось извлечь ссылку из test_task.txt');

  let devtoolsJSON;
  try {
    devtoolsJSON = JSON.parse(jsonBlockLines.join('\n'));
  } catch (err) {
    console.error('❌ Ошибка парсинга JSON DevTools:', err.message);
    process.exit(1);
  }

  return {
    url,
    devtoolsSteps: devtoolsJSON.steps || [],
    htmlElements: htmlBlocks
  };
}

function generateScript(url, devtoolsSteps, htmlElements) {
  const steps = [];

  const viewportStep = devtoolsSteps.find(s => s.type === 'setViewport');
  if (viewportStep && viewportStep.width && viewportStep.height) {
    steps.push({
      action: 'setViewport',
      width: viewportStep.width,
      height: viewportStep.height
    });
  }

  steps.push({ action: 'goto', url });
  steps.push({ action: 'wait', time: randTemplate(5000, 8000) });

  const clickSteps = devtoolsSteps.filter(e => e.type === 'click');
  if (clickSteps.length !== htmlElements.length) {
    console.warn(`⚠️ Несовпадение количества кликов и HTML: clicks=${clickSteps.length}, html=${htmlElements.length}`);
  }

  for (let i = 0; i < clickSteps.length; i++) {
    const step = clickSteps[i];
    const html = htmlElements[i];
    if (!html || !step) {
      console.warn(`⚠️ [${i}] Пропущен шаг — отсутствует HTML или click`);
      continue;
    }

    let selList = prioritizeSelectors(extractSelectorsFromHTML(html));
    if (!selList.length && step.selectors?.length) {
      selList = step.selectors.map(s => s[0]);
    }

    if (!selList.length) {
      console.warn(`⚠️ [${i}] Не найдено селекторов`);
      continue;
    }

    const allSelectors = [...new Set([...selList, ...(step.selectors?.map(s => s[0]) || [])])];
    const clickId = `click_${i}`;

    for (let sel of allSelectors) {
      const offset = {
        x: randTemplate(5, 15),
        y: randTemplate(5, 15)
      };

      steps.push({ action: 'waitForSelector', selector: sel, clickId });
      steps.push({ action: 'hover', selector: sel, clickId });
      steps.push({
        action: 'click',
        selector: sel,
        offset,
        selectors: allSelectors,
        clickId
      });
      steps.push({ action: 'wait', time: randTemplate(5000, 8000), clickId });
    }
  }

  return steps;
}

// MAIN
try {
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const { url, devtoolsSteps, htmlElements } = parseInputFile(raw);
  const script = generateScript(url, devtoolsSteps, htmlElements);

  const outputDir = path.join(__dirname, 'scripts');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputFile = path.join(outputDir, 'generated_task.json');
  fs.writeFileSync(outputFile, JSON.stringify(script, null, 2));
  console.log(`✅ Сценарий успешно создан: ${outputFile}`);
} catch (e) {
  console.error('💥 Ошибка генерации:', e.message);
}
