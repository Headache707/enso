const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

const CAPSULES_DIR = path.join(__dirname, 'capsules');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const RUNNER_PATH = path.join(__dirname, 'runner.js');

const activeLocks = new Map();

function isLocked(port) {
  const lockPath = path.join(CAPSULES_DIR, `${port}.lock`);
  return fs.existsSync(lockPath);
}

function setLock(port) {
  const lockPath = path.join(CAPSULES_DIR, `${port}.lock`);
  fs.writeFileSync(lockPath, 'locked');
  activeLocks.set(port, lockPath);
}

function releaseLock(port) {
  const lockPath = path.join(CAPSULES_DIR, `${port}.lock`);
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  activeLocks.delete(port);
}

function loadProfileTaskFiles() {
  const files = fs.readdirSync(CAPSULES_DIR).filter(f => f.endsWith('.json'));

  const tasks = [];

  for (const file of files) {
    const filePath = path.join(CAPSULES_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
      const profile = JSON.parse(raw);
      const { port, tasks: taskList } = profile;
      if (!port || !taskList || !Array.isArray(taskList)) continue;

      for (const task of taskList) {
        tasks.push({
          cron: task.cron,
          script: task.script,
          port
        });
      }
    } catch (err) {
      console.warn(`⚠️ Ошибка чтения ${file}: ${err.message}`);
    }
  }

  return tasks;
}

function scheduleTasks() {
  const taskDefs = loadProfileTaskFiles();

  for (const def of taskDefs) {
    cron.schedule(def.cron, () => {
      if (isLocked(def.port)) {
        console.log(`⏳ [${def.port}] Пропуск запуска — профиль заблокирован.`);
        return;
      }

      console.log(`🚀 Запуск runner.js для порта ${def.port}`);
      setLock(def.port);

      const child = exec(`node "${RUNNER_PATH}" ${def.port}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Ошибка runner.js [${def.port}]: ${err.message}`);
        }
        if (stdout) console.log(stdout.trim());
        if (stderr) console.error(stderr.trim());

        releaseLock(def.port);
        console.log(`🔓 Разблокирован профиль ${def.port}`);
      });
    });
  }
}

// MAIN
console.log('🗓️ Старт планировщика scheduler.js');
scheduleTasks();
