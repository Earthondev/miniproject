// SleepHelper - Personal Sleep Comfort Assistant
// JavaScript Application - Web Deployment Ready

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// Web Deployment Detection
const isWebDeployment = window.location.protocol === 'https:' || 
                       (window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1');

console.log('🌐 Web Deployment Mode:', isWebDeployment);

// Settings persistence
function loadSettings() {
    try {
        const savedIp = localStorage.getItem('esp8266_ip');
        const savedDemo = localStorage.getItem('demo_mode');
        if (savedIp) {
            window.ESP8266_IP = savedIp;
            window.ESP_BASE_URL = `http://${savedIp}`;
        }
        if (savedDemo !== null) {
            WEB_DEPLOYMENT.demoMode = savedDemo === 'true';
        }
        // Reflect into UI if elements exist
        const ipInput = document.getElementById('espIpInput');
        const demoCheckbox = document.getElementById('demoModeCheckbox');
        if (ipInput) ipInput.value = window.ESP8266_IP || '';
        if (demoCheckbox) demoCheckbox.checked = !!WEB_DEPLOYMENT.demoMode;
    } catch (e) {
        console.warn('Failed to load settings:', e.message);
    }
}

function saveSettings() {
    try {
        const ipInput = document.getElementById('espIpInput');
        const demoCheckbox = document.getElementById('demoModeCheckbox');
        if (ipInput) {
            const ip = ipInput.value.trim();
            const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
            const ipError = document.getElementById('ipError');
            if (!ipRegex.test(ip)) {
                if (ipError) ipError.style.display = 'block';
                showStatus('รูปแบบ IP ไม่ถูกต้อง', 2500);
                return;
            }
            if (ipError) ipError.style.display = 'none';
            if (ip) {
                localStorage.setItem('esp8266_ip', ip);
                window.ESP8266_IP = ip;
                window.ESP_BASE_URL = `http://${ip}`;
            }
        }
        if (demoCheckbox) {
            const demo = !!demoCheckbox.checked;
            localStorage.setItem('demo_mode', String(demo));
            WEB_DEPLOYMENT.demoMode = demo;
        }
        const saved = document.getElementById('settingsSaved');
        if (saved) {
            saved.style.display = 'inline';
            setTimeout(() => saved.style.display = 'none', 1200);
        }
        showStatus('บันทึกการตั้งค่าแล้ว');
        // Re-run connection check quickly
        checkESPConnection();
    } catch (e) {
        showStatus('บันทึกการตั้งค่าล้มเหลว');
        console.error(e);
    }
}

// Global state management
const appState = {
    currentPage: 'landing',
    light: { level: 0, mode: 'fixed', timer: null },
    fan: { speed: 0, mode: 'fixed', timer: null },
    sound: { type: '', volume: 50, mode: 'loop', timer: null },
    music: { 
        isPlaying: false, 
        currentTrack: -1, 
        playlist: [
            { id: 'rain', name: '🌧️ ฝนตก' },
            { id: 'ocean', name: '🌊 คลื่นทะเล' },
            { id: 'lullaby', name: '🎵 เพลงกล่อม' },
            { id: 'therapy', name: '🎶 เพลงบำบัด' },
            { id: 'dhamma', name: '🙏 บทธัมจักรกัปปวัตนสูตร' },
            { id: 'mongkol', name: '📿 รวมบทมงคล' },
            { id: 'tibet', name: '🔔 ขันทิเบต' },
            { id: 'frequency', name: '🎯 432Hz+528Hz' },
            { id: 'piano', name: '🎹 เสียงเปียโน' },
            { id: 'mozart', name: '🎼 โมสาร์ทกล่อมนาน' }
        ]
    },
    esp8266Connected: false
};

// ESP8266 Communication Functions
async function sendToESP(endpoint, params = {}) {
    try {
        // โหมดสาธิต: จำลองการตอบกลับเมื่อเปิด demoMode เท่านั้น (short-circuit)
        if (typeof WEB_DEPLOYMENT !== 'undefined' && WEB_DEPLOYMENT.demoMode) {
            console.log('🌐 Web Demo Mode: Simulating ESP8266 response');
            return simulateESPResponse(endpoint, params);
        }

        // ตรวจสอบ IP Address ก่อน (เฉพาะค่าว่างเท่านั้น)
        if (!ESP8266_IP) {
            console.warn('⚠️ กรุณาตั้งค่า IP Address ของ ESP8266!');
            updateConnectionStatus('disconnected', 'ยังไม่ได้ตั้งค่า IP Address');
            return null;
        }
        
        const url = new URL(`${ESP_BASE_URL}/${endpoint}`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
        
        console.log(`🔗 Sending request to: ${url.toString()}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.CONNECTION_TIMEOUT);
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // อ่าน JSON response จริง
        const data = await response.json();
        appState.esp8266Connected = (data.status === 'ok');
        
        console.log('✅ ESP8266 response:', data);
        return data;
        
    } catch (error) {
        console.error('❌ ESP8266 connection error:', error);
        appState.esp8266Connected = false;
        
        if (error.name === 'AbortError') {
            console.log('⏰ Request timeout - ESP8266 may be offline');
            updateConnectionStatus('disconnected', 'หมดเวลาการเชื่อมต่อ (8 วินาที)');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('🌐 Network error - ESP8266 unreachable');
            updateConnectionStatus('disconnected', `ไม่พบ ESP8266 ที่ ${ESP8266_IP}`);
        } else if (error.message.includes('CORS') || error.message.includes('blocked')) {
            console.log('🔒 CORS/Security error - ESP8266 needs CORS headers');
            updateConnectionStatus('disconnected', 'ESP8266 ต้องตั้งค่า CORS headers');
        } else if (error.message.includes('Mixed Content') || error.message.includes('https')) {
            console.log('🔐 Mixed Content error - HTTPS to HTTP blocked');
            updateConnectionStatus('disconnected', 'ปัญหา Mixed Content (HTTPS→HTTP)');
        } else {
            console.log('❓ Other error:', error.message);
            updateConnectionStatus('disconnected', `ข้อผิดพลาด: ${error.message}`);
        }
        
        return null;
    }
}

// จำลองการตอบกลับจาก ESP8266 สำหรับ web demo
function simulateESPResponse(endpoint, params = {}) {
    console.log('🎭 Simulating ESP8266 response for:', endpoint, params);
    
    // จำลองการตอบกลับตาม endpoint
    switch (endpoint) {
        case 'status':
            return {
                status: 'ok',
                timestamp: Date.now(),
                rssi: -45,
                heap: 32768,
                playing: appState.music.isPlaying,
                track: appState.music.currentTrack + 1,
                volume: Math.round((appState.sound.volume / 100) * CONFIG.DFPLAYER_MAX_VOLUME),
                light: appState.light.level,
                fan: appState.fan.speed,
                uptime: Math.floor(Date.now() / 1000)
            };
            
        case 'play':
            appState.music.isPlaying = true;
            appState.music.currentTrack = (params.track || 1) - 1;
            return { status: 'playing', track: params.track };
            
        case 'pause':
        case 'stop':
            appState.music.isPlaying = false;
            return { status: 'stopped' };
            
        case 'light':
            appState.light.level = params.level || 0;
            return { level: appState.light.level };
            
        case 'fan':
            appState.fan.speed = params.speed || 0;
            return { speed: appState.fan.speed };
            
        case 'volume':
            appState.sound.volume = Math.round((params.level / CONFIG.DFPLAYER_MAX_VOLUME) * 100);
            return { volume: params.level };
            
        case 'selectTrack':
            appState.music.currentTrack = (params.track || 1) - 1;
            return { track: params.track };
            
        case 'next':
            appState.music.currentTrack = Math.min(appState.music.currentTrack + 1, appState.music.playlist.length - 1);
            return { track: appState.music.currentTrack + 1 };
            
        case 'previous':
            appState.music.currentTrack = Math.max(appState.music.currentTrack - 1, 0);
            return { track: appState.music.currentTrack + 1 };
            
        default:
            return { status: 'demo_mode' };
    }
}

// ฟังก์ชันทดสอบการเชื่อมต่อแบบตรงไปตรงมา
async function pingESP() {
    try {
        console.log(`🏓 Testing ESP8266 connection at ${ESP8266_IP}...`);
        
        // ใช้ fetch ตรงๆ ไปที่ /status endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`http://${ESP8266_IP}/status`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            return data.status === 'ok';
        } else {
            console.log(`HTTP ${response.status}: ${response.statusText}`);
            return false;
        }
        
    } catch (error) {
        console.error('Ping failed:', error.message);
        return false;
    }
}

async function checkESPConnection() {
    updateConnectionStatus('checking', 'กำลังตรวจสอบการเชื่อมต่อ...');
    
    // ถ้าเปิด demoMode ให้ใช้ demo mode (ไม่ทำ network calls จริง)
    if (typeof WEB_DEPLOYMENT !== 'undefined' && WEB_DEPLOYMENT.demoMode) {
        console.log('🌐 Web Demo Mode: Simulating ESP8266 connection');
        updateConnectionStatus('connected', 'โหมดสาธิต (Demo Mode)');
        showStatus('โหมดสาธิต - ไม่ต้องเชื่อมต่อ ESP8266');
        return true;
    }
    
    // ใช้ sendToESP เป็นหลัก (อ่าน JSON ได้จริง)
    const result = await sendToESP('status');
    if (result && result.status === 'ok') {
        const statusMsg = result.rssi ? `เชื่อมต่อสำเร็จ (RSSI: ${result.rssi}dBm)` : 'เชื่อมต่อสำเร็จ';
        updateConnectionStatus('connected', statusMsg);
        showStatus('เชื่อมต่อ ESP8266 สำเร็จ');
        return true;
    } else {
        // ถ้า sendToESP ไม่ได้ ลอง ping แบบง่าย
        console.log('sendToESP failed, trying simple ping...');
        const pingResult = await pingESP();
        if (pingResult) {
            updateConnectionStatus('connected', 'เชื่อมต่อสำเร็จ (ping only)');
            showStatus('เชื่อมต่อ ESP8266 สำเร็จ (จำกัด)');
            return true;
        } else {
            updateConnectionStatus('disconnected', 'ไม่สามารถเชื่อมต่อได้');
            return false;
        }
    }
}

function updateConnectionStatus(status, message) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    // Only target control area (do NOT disable Settings UI)
    const controls = document.querySelectorAll('.controls-container .btn, .controls-container .music-btn, .controls-container .slider, .controls-container .dropdown');
    
    // Remove all status classes
    statusDot.classList.remove('connected', 'disconnected');
    
    // Add appropriate class and update text
    if (status === 'connected') {
        statusDot.classList.add('connected');
        statusText.textContent = message;
        statusText.style.color = '#4caf50';
        controls.forEach(el => el.disabled = false);
    } else if (status === 'disconnected') {
        statusDot.classList.add('disconnected');
        statusText.textContent = message;
        statusText.style.color = '#f44336';
        controls.forEach(el => el.disabled = true);
    } else {
        // checking status
        statusText.textContent = message;
        statusText.style.color = '#37474f';
        controls.forEach(el => el.disabled = true);
    }
}

function startConnectionMonitoring() {
    // Check connection every 10 seconds
    setInterval(async () => {
        if (appState.currentPage === 'control') {
            await checkESPConnection();
        }
    }, CONFIG.CONNECTION_CHECK_INTERVAL);
}

// Page navigation functions
function goToControlPage() {
    const landingPage = document.getElementById('landingPage');
    const controlPage = document.getElementById('controlPage');
    
    landingPage.classList.remove('active');
    setTimeout(() => {
        landingPage.style.display = 'none';
        controlPage.style.display = 'flex';
        setTimeout(() => {
            controlPage.classList.add('active');
            appState.currentPage = 'control';
            showStatus('เข้าสู่โหมดควบคุมสภาพแวดล้อม');
        }, 50);
    }, 250);
}

function goToLandingPage() {
    const landingPage = document.getElementById('landingPage');
    const controlPage = document.getElementById('controlPage');
    
    controlPage.classList.remove('active');
    setTimeout(() => {
        controlPage.style.display = 'none';
        landingPage.style.display = 'flex';
        setTimeout(() => {
            landingPage.classList.add('active');
            appState.currentPage = 'landing';
        }, 50);
    }, 250);
}

// Status bar functions
function showStatus(message, duration = 3000) {
    const statusBar = document.getElementById('statusBar');
    const statusText = document.getElementById('statusText');
    
    statusText.textContent = message;
    statusBar.classList.add('show');
    
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, duration);
}

// Light Control Functions
function setLightLevel(button, level) {
    const buttons = button.parentElement.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    appState.light.level = level;
    
    const levelText = level === 0 ? 'ปิด' : `ระดับ ${level}`;
    showStatus(`แสง: ${levelText}`);
    
    console.log('Light level set to:', level);
}

function toggleLightMode(toggle) {
    toggle.classList.toggle('active');
    const timerDiv = document.getElementById('lightTimer');
    
    if (toggle.classList.contains('active')) {
        timerDiv.style.display = 'none';
        appState.light.mode = 'fixed';
        showStatus('แสง: โหมดคงที่');
    } else {
        timerDiv.style.display = 'flex';
        appState.light.mode = 'timer';
        showStatus('แสง: โหมดตั้งเวลา');
    }
}

// Fan Control Functions
function setFanSpeed(button, speed) {
    const buttons = button.parentElement.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const fanIcon = document.querySelector('.fan-icon');
    
    if (speed == 0) {
        fanIcon.classList.remove('spinning');
        appState.fan.speed = 0;
        showStatus('พัดลม: ปิด');
    } else {
        fanIcon.classList.add('spinning');
        fanIcon.style.animationDuration = `${2 - (speed * 0.3)}s`;
        appState.fan.speed = speed;
        showStatus(`พัดลม: ความเร็ว ${speed}`);
    }
    
    console.log('Fan speed set to:', speed);
}

function toggleFanMode(toggle) {
    toggle.classList.toggle('active');
    const timerDiv = document.getElementById('fanTimer');
    
    if (toggle.classList.contains('active')) {
        timerDiv.style.display = 'none';
        appState.fan.mode = 'fixed';
        showStatus('พัดลม: โหมดคงที่');
    } else {
        timerDiv.style.display = 'flex';
        appState.fan.mode = 'timer';
        showStatus('พัดลม: โหมดตั้งเวลา');
    }
}

// Music Player Functions
async function selectSound(sound) {
    appState.sound.type = sound;
    
    if (sound) {
        // Find track index in playlist
        const trackIndex = appState.music.playlist.findIndex(track => track.id === sound);
        if (trackIndex !== -1) {
            appState.music.currentTrack = trackIndex;
            updateNowPlaying();
            
            // Send to ESP8266 - track numbers start from 1
            await sendToESP('selectTrack', { track: trackIndex + 1 });
            
            showStatus(`เลือกเพลง: ${appState.music.playlist[trackIndex].name}`);
            console.log(`Selected track ${trackIndex + 1}: ${sound}`);
        }
    } else {
        appState.music.currentTrack = -1;
        updateNowPlaying();
        await sendToESP('stop');
    }
}

async function togglePlayPause() {
    if (appState.music.currentTrack === -1) {
        showStatus('กรุณาเลือกเพลงก่อน');
        return;
    }

    appState.music.isPlaying = !appState.music.isPlaying;
    
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const nowPlaying = document.getElementById('nowPlaying');
    
    if (appState.music.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        nowPlaying.classList.add('playing');
        
        // Send play command to ESP8266
        await sendToESP('play', { track: appState.music.currentTrack + 1 });
        
        showStatus(`กำลังเล่น: ${appState.music.playlist[appState.music.currentTrack].name}`);
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        nowPlaying.classList.remove('playing');
        
        // Send pause command to ESP8266
        await sendToESP('pause');
        
        showStatus('หยุดเล่นเพลง');
    }
    
    console.log('Music', appState.music.isPlaying ? 'playing' : 'paused');
}

async function previousTrack() {
    if (appState.music.playlist.length === 0) return;
    
    if (appState.music.currentTrack <= 0) {
        appState.music.currentTrack = appState.music.playlist.length - 1;
    } else {
        appState.music.currentTrack--;
    }
    
    updateTrackSelection();
    updateNowPlaying();
    
    // Send previous command to ESP8266
    await sendToESP('previous');
    
    if (appState.music.isPlaying) {
        showStatus(`กำลังเล่น: ${appState.music.playlist[appState.music.currentTrack].name}`);
    } else {
        showStatus(`เลือกเพลง: ${appState.music.playlist[appState.music.currentTrack].name}`);
    }
    
    console.log('Previous track:', appState.music.playlist[appState.music.currentTrack].name);
}

async function nextTrack() {
    if (appState.music.playlist.length === 0) return;
    
    if (appState.music.currentTrack >= appState.music.playlist.length - 1) {
        appState.music.currentTrack = 0;
    } else {
        appState.music.currentTrack++;
    }
    
    updateTrackSelection();
    updateNowPlaying();
    
    // Send next command to ESP8266
    await sendToESP('next');
    
    if (appState.music.isPlaying) {
        showStatus(`กำลังเล่น: ${appState.music.playlist[appState.music.currentTrack].name}`);
    } else {
        showStatus(`เลือกเพลง: ${appState.music.playlist[appState.music.currentTrack].name}`);
    }
    
    console.log('Next track:', appState.music.playlist[appState.music.currentTrack].name);
}

function updateTrackSelection() {
    const soundSelect = document.getElementById('soundSelect');
    if (appState.music.currentTrack >= 0) {
        soundSelect.value = appState.music.playlist[appState.music.currentTrack].id;
        appState.sound.type = appState.music.playlist[appState.music.currentTrack].id;
    }
}

function updateNowPlaying() {
    const nowPlaying = document.getElementById('nowPlaying');
    const trackName = nowPlaying.querySelector('.track-name');
    
    if (appState.music.currentTrack >= 0) {
        trackName.textContent = appState.music.playlist[appState.music.currentTrack].name;
    } else {
        trackName.textContent = 'ไม่ได้เลือกเพลง';
        nowPlaying.classList.remove('playing');
    }
}

async function updateVolume(value) {
    document.getElementById('volumeValue').textContent = `${value}%`;
    appState.sound.volume = parseInt(value);
    
    // Convert percentage to DFPlayer volume (0-30)
    const dfVolume = Math.round((parseInt(value) / 100) * CONFIG.DFPLAYER_MAX_VOLUME);
    await sendToESP('volume', { level: dfVolume });
    
    showStatus(`ระดับเสียง: ${value}%`);
    console.log('Volume set to:', value + '%', 'DFPlayer volume:', dfVolume);
}

function toggleSoundMode(toggle) {
    toggle.classList.toggle('active');
    const timerDiv = document.getElementById('soundTimer');
    
    if (toggle.classList.contains('active')) {
        timerDiv.style.display = 'none';
        appState.sound.mode = 'loop';
        showStatus('เสียงกล่อม: โหมดวนซ้ำ');
    } else {
        timerDiv.style.display = 'flex';
        appState.sound.mode = 'timer';
        showStatus('เสียงกล่อม: โหมดตั้งเวลา');
    }
}

// Timer Functions
function setTimer(button, device, minutes) {
    const buttons = button.parentElement.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const deviceNames = {
        'light': 'แสง',
        'fan': 'พัดลม',
        'sound': 'เสียงกล่อม'
    };
    
    const timeText = minutes < 60 ? `${minutes} นาที` : `${minutes/60} ชั่วโมง`;
    
    // Clear existing timer if any
    if (appState[device].timer) {
        clearTimeout(appState[device].timer);
    }
    
    // Set new timer
    appState[device].timer = setTimeout(() => {
        if (device === 'light') {
            // Turn off light
            const offButton = document.querySelector('.card:nth-child(1) .btn');
            setLightLevel(offButton, 0);
        } else if (device === 'fan') {
            // Turn off fan
            const offButton = document.querySelector('.card:nth-child(2) .btn');
            setFanSpeed(offButton, 0);
        } else if (device === 'sound') {
            // Stop sound
            document.getElementById('soundSelect').value = '';
            appState.sound.type = '';
        }
        
        showStatus(`${deviceNames[device]}: ปิดอัตโนมัติ (หมดเวลา)`);
    }, minutes * 60 * 1000);
    
    showStatus(`${deviceNames[device]}: ตั้งเวลา ${timeText}`);
    console.log(`${device} timer set to ${minutes} minutes`);
}

// Test connection function
async function testConnection() {
    console.log('Manual connection test initiated');
    showStatus('กำลังทดสอบการเชื่อมต่อ ESP8266...');
    const connected = await checkESPConnection();
    
    // ถ้าเชื่อมต่อไม่ได้ แสดงคู่มือแก้ไขปัญหา
    if (!connected) {
        setTimeout(() => {
            showTroubleshootingGuide();
        }, 2000);
    }
}

// Show troubleshooting guide
function showTroubleshootingGuide() {
    const guide = document.getElementById('troubleshootingGuide');
    guide.style.display = 'block';
    guide.scrollIntoView({ behavior: 'smooth' });
    showStatus('แสดงคู่มือแก้ไขปัญหาการเชื่อมต่อ');
}

// Close troubleshooting guide
function closeTroubleshootingGuide() {
    const guide = document.getElementById('troubleshootingGuide');
    guide.style.display = 'none';
}

// Network diagnostics
async function runNetworkDiagnostics() {
    console.log('🔍 Running network diagnostics...');
    
    const diagnostics = {
        browserSupport: typeof fetch !== 'undefined',
        currentURL: window.location.href,
        userAgent: navigator.userAgent,
        onlineStatus: navigator.onLine,
        espIP: ESP8266_IP,
        timestamp: new Date().toISOString()
    };
    
    console.table(diagnostics);
    
    // Test different connection methods
    const tests = [
        { name: 'Fetch API', method: () => sendToESP('status') },
        { name: 'Image Ping', method: () => pingESP() },
        { name: 'XMLHttpRequest', method: () => testXHR() }
    ];
    
    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const result = await test.method();
            console.log(`✅ ${test.name}: ${result ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }
}

// Test XMLHttpRequest as fallback (สำหรับบราวเซอร์เก่า)
function testXHR() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        
        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText);
                resolve(data.status === 'ok');
            } catch (e) {
                resolve(xhr.status === 200);
            }
        };
        xhr.onerror = () => reject(new Error('XHR failed'));
        xhr.ontimeout = () => reject(new Error('XHR timeout'));
        
        try {
            xhr.open('GET', `http://${ESP8266_IP}/status`, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send();
        } catch (error) {
            reject(error);
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 SleepHelper App initialized');
    showStatus('ยินดีต้อนรับสู่ SleepHelper', 2000);
    // Load persisted settings
    loadSettings();
    
    // Run network diagnostics
    await runNetworkDiagnostics();
    
    // Start connection monitoring
    startConnectionMonitoring();
    
    // Initial ESP8266 connection check
    setTimeout(async () => {
        console.log('🔍 Starting initial ESP8266 connection check...');
        const connected = await checkESPConnection();
        
        if (!connected) {
            console.log('❌ Initial connection failed - showing troubleshooting tips');
            setTimeout(() => {
                if (appState.currentPage === 'control') {
                    showStatus('💡 คลิก 🔄 เพื่อดูคู่มือแก้ไขปัญหา', 5000);
                }
            }, 3000);
        }
    }, 3000);
});
