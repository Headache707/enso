
# Enso — README (English)

**Automated multi-account system with realistic behavior, designed for anti-detect browsers and complex UI scenarios.**

---

## 📦 Project Structure

```

Enso/
├── capsules/             # Profiles and tasks by ports (JSON)
├── logs/                 # Execution logs (recommended to configure)
├── node\_modules/         # Node.js dependencies
├── scripts/              # Generated JSON scripts
├── generator.js          # Script generator based on HTML and DevTools data
├── runner.js             # Task executor using Puppeteer
├── scheduler.js          # Cron task scheduler with port locking
├── task-manager.js       # CLI wrapper for managing profiles and tasks
├── test\_task.txt         # Sample input task for generation
├── package.json
└── package-lock.json

````

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
````

### 2. Prepare a task

Example `test_task.txt`:

```
https://example.com

{ ...DevTools JSON steps... }

<input id="button" class="btn">  # Target element HTML
```

Generate the script:

```bash
node generator.js
```

### 3. Create profile and add tasks

```bash
node task-manager.js
```

> Use the CLI to add a profile, assign port, and link cron-scheduled scripts.

### 4. Run the scheduler

```bash
node scheduler.js
```

---

## 🧠 How It Works

1. **generator.js** parses `test_task.txt` and creates a step-by-step JSON script (`generated_task.json`).
2. **runner.js** connects to a running Dolphin Anty profile via WebSocket Debugger URL and performs steps:

   * `setViewport`, `goto`, `wait`, `hover`, `click`
   * Supports fallback selectors and randomized interaction offsets.
3. **scheduler.js** schedules tasks using cron expressions and manages `.lock` files to avoid conflicts per port.
4. **task-manager.js** is an interactive CLI tool for managing `capsules/*.json` profiles and their tasks.

---

## 🧬 Technologies Used

* **Node.js**
* **Puppeteer** (connected mode for Dolphin Anty)
* **cheerio** (HTML parsing for selector generation)
* **axios** (HTTP requests for WebSocket endpoint discovery)
* **node-cron** (task scheduling)
* **readline** (interactive CLI)

---

## 🔒 Security and Limitations

* Each port is locked with a `.lock` file until the task finishes.
* Profiles are unlocked even if `runner.js` crashes.
* Scripts run with randomized offsets and fallback selectors to mimic human behavior.

---

## 📁 Sample Capsule File (`capsules/3001.json`)

```json
{
  "id": "freebtc",
  "port": 3001,
  "tasks": [
    {
      "cron": "0 * * * *",
      "script": "generated_task.json"
    }
  ]
}
```

---

## 📄 .gitignore

```
node_modules/
logs/
capsules/*.lock
scripts/*.json
```

---

## 📜 License

GPL3 LICENSE SYNOPSIS
TL;DR* Here's what the license entails:

1. Anyone can copy, modify and distribute this software.
2. You have to include the license and copyright notice with each and every distribution.
3. You can use this software privately.
4. You can use this software for commercial purposes.
5. If you dare build your business solely from this code, you risk open-sourcing the whole code base.
6. If you modify it, you have to indicate changes made to the code.
7. Any modifications of this code base MUST be distributed with the same license, GPLv3.
8. This software is provided without warranty.
9. The software author or license can not be held liable for any damages inflicted by the software.

---

## 👤 Author

Architect of behavioral digital systems. Infrastructure optimizer for multi-account ecosystems. Specialist in trusted digital structures within high-risk environments.

> Enso is not just a script — it's a future-ready module for automating consciousness in the world of digital shadows.

````

---

# Resume (English draft)

```markdown
## 📄 Resume

Dmitri Yukhno
Age: 27  
Location: Samar, Ukraine
Contacts: +380677709167 • dokkodo707@gmail.com • Telegram: @Headache707

---

### 🧍‍♂️ About Me

Resilient. Self-made. Systemic. From digging trenches to architecting complex systems — I didn’t just study it, I lived it.  
I’ve been through 20+ lives, official and unofficial. I don’t seek stability — I create momentum.  
I don’t just write code — I build living, breathing systems.

Practicing Zen Buddhism for 8+ years. Not for status. Because silence in the storm is my standard.

I don’t break. I don’t twitch. I create. And I don’t stop.

---

### 🛠 Core Competencies

* System Architecture — end-to-end solutions, automation, backends  
* JavaScript Development — full stack: browser, server, automation  
* Anti-detect & Masking — Dolphin Anty, multi-profiles, fingerprint management  
* Sales & Leadership — fieldwork, team growth, deal closing  
* Physical Labor & Construction — solid foundation: concrete, tools, people  
* Automation & Intelligence — autonomous agents and bots building  
* Adaptability — 20+ jobs, zero burnout. I don’t look for roles — I become indispensable.

---

### 🧱 Selected Experience

#### 🔧 Laborer → Foreman

*Construction Sites | 2012–2017*  
- Started at 16 with a shovel  
- By 19, seasoned workers listened to me.

#### 💼 Salesperson → Export Department Manager

*Retail, B2B | 2017–2019*  
- From cold calls to revenue records  
- Led sales teams, trained and coached warriors.

#### 👨‍💻 Freelance Developer, System Architect

*Automation, gray/white projects | 2019–present*  
- Built anti-detect bots and capsules in JavaScript  
- Created autoclick systems with time logic and behavior masking  
- Used Dolphin Anty, Puppeteer, Node.js, SQLite

#### ⚙️ Creator, Entrepreneur

*Microprojects, SaaS, Consulting | ongoing*  
- Solo operator: code, test, deploy, monetize  
- No investors. No noise. Only results.

---

### 🌐 Skills & Tools

* Languages: JavaScript, Node.js, HTML, CSS, Bash  
* Tools: Dolphin Anty, Puppeteer, SQLite, Express, REST API  
* DevOps: Scraping, bot farms, profile orchestration, cron scripts  
* Mindset: cold logic, Zen rhythm, calm under pressure

---

### 📚 Education

Lyceum graduate — with respect and warmth.  
Translator diploma. But deeply trained by life, labor, and silence.

---

### 🧘 Noteworthy Facts

* 8+ years practicing Zen Buddhism — not for show, but foundation  
* Repelled a pack of stray dogs by staring down the alpha — walked away unharmed  
* Worked in white, gray, and dark zones — always with balance  
* This resume might not be sterile. But my character is steel.

---

### 🚪 Closing

I’m not here to impress.  
I’m here to work.  
If you need a cold executor, a steady mind, and systems that don’t break —  
I’m ready.
