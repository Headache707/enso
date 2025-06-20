const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CAPSULES_DIR = path.join(__dirname, 'capsules');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(q) {
  return new Promise(res => rl.question(q, answer => res(answer.trim())));
}

function listProfiles() {
  const files = fs.readdirSync(CAPSULES_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => path.basename(f, '.json'));
}

async function addProfile() {
  const id = await prompt('🆔 Введите ID профиля: ');
  const port = await prompt('🔌 Введите порт профиля: ');

  const filePath = path.join(CAPSULES_DIR, `${port}.json`);
  const profile = {
    id,
    port: parseInt(port, 10),
    tasks: []
  };

  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
  console.log(`✅ Профиль ${id} создан.`);
}

async function viewProfileTasks() {
  const profiles = listProfiles();
  if (!profiles.length) return console.log('❌ Нет доступных профилей.');

  console.log('📄 Список профилей:');
  profiles.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  const index = parseInt(await prompt('Выберите номер профиля: '), 10) - 1;

  const port = profiles[index];
  const filePath = path.join(CAPSULES_DIR, `${port}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const profile = JSON.parse(raw);

  if (!profile.tasks || !profile.tasks.length) {
    return console.log('ℹ️ У этого профиля нет задач.');
  }

  console.log(`📋 Задачи профиля ${profile.id} (${profile.port}):`);
  profile.tasks.forEach((t, i) => console.log(`${i + 1}. [${t.cron}] → ${t.script}`));
}

async function addTaskToProfile() {
  const profiles = listProfiles();
  if (!profiles.length) return console.log('❌ Нет доступных профилей.');

  console.log('📄 Список профилей:');
  profiles.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  const index = parseInt(await prompt('Выберите номер профиля: '), 10) - 1;

  const port = profiles[index];
  const filePath = path.join(CAPSULES_DIR, `${port}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const profile = JSON.parse(raw);

  const cron = await prompt('⏱ Введите cron выражение (например, */5 * * * *): ');
  const scriptName = await prompt('📜 Введите имя скрипта (из папки scripts): ');
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);

  if (!fs.existsSync(scriptPath)) {
    console.log(`❌ Скрипт ${scriptName} не найден в папке scripts`);
    return mainMenu();
  }

  const task = { cron, script: scriptName };
  const exists = profile.tasks.find(t => t.script === scriptName);

  if (exists) {
    console.log('⚠️ Такая задача уже есть. Заменяю...');
    profile.tasks = profile.tasks.filter(t => t.script !== scriptName);
  }

  profile.tasks.push(task);
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
  console.log('✅ Задача добавлена.');
}

async function clearTasks() {
  const mode = await prompt('1. Очистить один профиль\n2. Очистить все\nВыберите: ');
  const profiles = listProfiles();

  if (mode === '1') {
    profiles.forEach((p, i) => console.log(`${i + 1}. ${p}`));
    const index = parseInt(await prompt('Выберите номер профиля: '), 10) - 1;
    const port = profiles[index];
    const filePath = path.join(CAPSULES_DIR, `${port}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const profile = JSON.parse(raw);
    profile.tasks = [];
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
    console.log('🧹 Задачи очищены.');
  } else if (mode === '2') {
    for (const port of profiles) {
      const filePath = path.join(CAPSULES_DIR, `${port}.json`);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const profile = JSON.parse(raw);
      profile.tasks = [];
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
    }
    console.log('🧼 Все задачи очищены.');
  } else {
    console.log('❌ Неверный выбор');
  }
}

async function mainMenu() {
  console.log('\n🔧 Меню управления задачами:\n1. Добавить профиль\n2. Просмотреть задачи профиля\n3. Добавить задачу\n4. Очистить задачи\n5. Выход');

  const choice = await prompt('Выберите действие: ');

  switch (choice) {
    case '1':
      await addProfile();
      break;
    case '2':
      await viewProfileTasks();
      break;
    case '3':
      await addTaskToProfile();
      break;
    case '4':
      await clearTasks();
      break;
    case '5':
      rl.close();
      process.exit(0);
      break;
    default:
      console.log('❌ Неверный выбор');
  }

  mainMenu();
}

mainMenu();
