const express = require('express');
const app = express();

app.use(express.json());

// หน่วยความจำชั่วคราวเก็บข้อมูล IP ผูกกับ Guest Account
const activeSessions = new Map();

// หน้าเว็บ HTML UI ดีไซน์ใหม่ สไตล์ Hyper! X Store
const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HYPER! X STORE - Guest UID Activator</title>
<style>
:root {
  --bg-color: #050507;
  --card-bg: linear-gradient(145deg, #121014, #09080a);
  --accent-red: #ff2a2a;
  --accent-glow: rgba(255, 42, 42, 0.25);
  --border-color: #261f22;
  --text-main: #f5f5f7;
  --text-muted: #8e8e93;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg-color); color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between;
}
header {
  padding: 42px 20px 30px; text-align: center;
  background: radial-gradient(circle at top, #3a0d0d 0%, #0c090a 60%, var(--bg-color) 100%);
  border-bottom: 1px solid var(--border-color);
}
.logo {
  font-size: 38px; font-weight: 900; font-style: italic; letter-spacing: 2px;
  text-shadow: 0 0 20px var(--accent-glow);
}
.logo span { color: var(--accent-red); }
.sub { color: var(--text-muted); font-size: 11px; letter-spacing: 5px; margin-top: 6px; font-weight: 700; }

main { max-width: 600px; width: 100%; margin: 24px auto; padding: 0 16px; flex: 1; }
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color); border-radius: 22px;
  padding: 24px; margin-bottom: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
}
.label { font-size: 11px; letter-spacing: 3px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; }
h1 { font-size: 28px; margin: 10px 0; font-weight: 800; }
p { color: var(--text-muted); line-height: 1.6; font-size: 13px; margin-bottom: 16px; }

textarea {
  width: 100%; height: 160px; background: #030304; color: #00ff88;
  border: 1px solid #2a2225; border-radius: 14px; padding: 14px;
  font: 12px/1.5 monospace; resize: vertical; outline: none;
  transition: all 0.3s ease;
}
textarea:focus { border-color: var(--accent-red); box-shadow: 0 0 12px var(--accent-glow); }

.buttons { display: flex; gap: 10px; margin-top: 14px; }
button {
  flex: 1; padding: 15px; border-radius: 12px;
  border: 1px solid #33282b; background: #1a1619; color: white;
  font-size: 14px; font-weight: 800; cursor: pointer; transition: 0.2s;
}
button.primary { background: var(--accent-red); border: none; box-shadow: 0 4px 20px var(--accent-glow); }
button.primary:active { transform: scale(0.97); }
button:active { transform: scale(0.97); }

.statusrow {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 18px; padding-top: 14px; border-top: 1px solid #1c1719;
  color: var(--text-muted); font-size: 12px; flex-wrap: wrap; gap: 8px;
}
.pill { background: #09080a; border: 1px solid #241d20; padding: 8px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
.dot { height: 8px; width: 8px; background: #30d158; border-radius: 50%; box-shadow: 0 0 8px #30d158; display: inline-block; }

.result-header { display: flex; justify-content: space-between; align-items: center; }
.badge { background: #221b1d; color: #ff8585; border: 1px solid #3d2528; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
.resultbox {
  background: #030304; border: 1px dashed #2c2225; border-radius: 16px;
  padding: 20px; margin-top: 14px; min-height: 120px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.resultbox h2 { font-size: 18px; margin: 8px 0 4px; }
.resultbox p { font-size: 12px; margin: 0; }
.icon-status { font-size: 24px; margin-bottom: 4px; }

footer { text-align: center; color: #555; font-size: 10px; padding: 20px; letter-spacing: 2px; border-top: 1px solid #111; }
</style>
</head>
<body>

<header>
 <div class="logo">HYPER! <span>X STORE</span></div>
 <div class="sub">EXCLUSIVE GAMING UTILITY</div>
</header>

<main>
 <section class="card">
  <div class="label">SECURE PANEL</div>
  <h1>Activate UID</h1>
  <p>วางโค้ด JSON ข้อมูล Guest ของคุณเพื่อผูก ID เข้ากับเครือข่าย IP ปัจจุบันทันที</p>

  <div class="label">CREDENTIALS JSON</div>
  <textarea id="jsonInput" placeholder='{"guest_account_info":{"com.garena.msdk.guest_uid":"xxxx","com.garena.msdk.guest_password":"xxxx"}}'></textarea>

  <div class="buttons">
   <button class="primary" onclick="activateSession()">⚡ ACTIVATE NOW</button>
   <button onclick="deactivateSession()">RESET</button>
  </div>

  <div class="statusrow">
   <span class="pill">🌐 YOUR IP: <span id="clientIp" style="color:#fff; font-family:monospace;">Loading...</span></span>
   <span class="pill"><span class="dot"></span> SERVER ONLINE</span>
  </div>
 </section>

 <section class="card">
  <div class="result-header">
   <div class="label">SYSTEM STATUS</div>
   <span class="badge" id="statusBadge">STANDBY</span>
  </div>
  <div class="resultbox">
   <div class="icon-status" id="statusIcon">🛡️</div>
   <h2 id="statusTitle">พร้อมใช้งานระบบ</h2>
   <p id="statusDesc">กรอกข้อมูล JSON ด้านบนแล้วกดปุ่ม Activate เพื่อเริ่มเชื่อมต่อ</p>
  </div>
 </section>
</main>

<footer>HYPER! X STORE © 2026 · SECURE BACKEND RUNNING</footer>

<script>
// ดึง IP จริงของผู้ใช้งาน
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => { document.getElementById('clientIp').textContent = data.ip; })
    .catch(() => { document.getElementById('clientIp').textContent = 'RESTRICTED'; });

function updateUI(badgeText, icon, title, desc, isError = false) {
    document.getElementById('statusBadge').textContent = badgeText;
    document.getElementById('statusBadge').style.color = isError ? '#ff453a' : '#30d158';
    document.getElementById('statusBadge').style.borderColor = isError ? '#512323' : '#1e3d23';
    document.getElementById('statusIcon').textContent = icon;
    document.getElementById('statusTitle').textContent = title;
    document.getElementById('statusDesc').textContent = desc;
}

async function activateSession() {
    const rawVal = document.getElementById('jsonInput').value.trim();
    if(!rawVal) {
        updateUI('WARNING', '⚠️', 'ข้อมูลว่างเปล่า', 'กรุณาวาง JSON ข้อมูล Guest ก่อนกดเปิดใช้งาน', true);
        return;
    }
    try {
        const parsedData = JSON.parse(rawVal);
        const res = await fetch('/api/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedData)
        });
        const result = await res.json();
        if(result.success) {
            updateUI('SUCCESS', '🚀', 'ผูก UID สำเร็จ!', 'ระบบได้บันทึกและเชื่อมต่อไอดีเข้ากับ IP ของคุณเรียบร้อยแล้ว');
        } else {
            updateUI('FAILED', '❌', 'เกิดข้อผิดพลาด', result.message, true);
        }
    } catch(err) {
        updateUI('ERROR', '💥', 'JSON ไม่ถูกต้อง', 'รูปแบบโครงสร้าง JSON ไม่ถูกต้อง ตรวจสอบเครื่องหมายปีกกาให้ครบถ้วน', true);
    }
}

async function deactivateSession() {
    try {
        const res = await fetch('/api/deactivate', { method: 'POST' });
        const result = await res.json();
        document.getElementById('jsonInput').value = '';
        updateUI('RESET', '🔄', 'รีเซ็ตสำเร็จ', result.message);
    } catch(e) {
        updateUI('ERROR', '❌', 'เชื่อมต่อล้มเหลว', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้', true);
    }
}
</script>
</body>
</html>`;

// Routing หน้าแรก
app.get('/', (req, res) => {
    res.send(htmlContent);
});

// API สำหรับกด Activate
app.post('/api/activate', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const body = req.body;

    if (!body || !body.guest_account_info) {
        return res.status(400).json({ success: false, message: 'โครงสร้าง JSON ขาดก้อน guest_account_info' });
    }

    const uid = body.guest_account_info['com.garena.msdk.guest_uid'];
    const password = body.guest_account_info['com.garena.msdk.guest_password'];

    if (!uid || !password) {
        return res.status(400).json({ success: false, message: 'ไม่พบ UID หรือ Password ในชุดข้อมูล' });
    }

    activeSessions.set(clientIp, { uid, password, updated: new Date() });
    console.log(`[ACTIVATED] IP: ${clientIp} -> UID: ${uid}`);
    res.json({ success: true, message: 'Bind IP and UID successfully.' });
});

// API ดึงข้อมูลไปใช้งานต่อ
app.get('/api/get-account', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const session = activeSessions.get(clientIp);
    if (session) {
        res.json({ active: true, session });
    } else {
        res.json({ active: false, message: 'ยังไม่มีการเปิดใช้งานไอดีสำหรับ IP นี้' });
    }
});

// API สำหรับรีเซ็ต
app.post('/api/deactivate', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    activeSessions.delete(clientIp);
    res.json({ success: true, message: 'ล้างข้อมูลเซสชันเรียบร้อยแล้ว' });
});

const PORT = process.env.PORT || 6071;
app.listen(PORT, () => {
    console.log(`Hyper! X Store Server is running on port ${PORT}`);
});
