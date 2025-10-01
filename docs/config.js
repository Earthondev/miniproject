// ESP8266 Configuration
// IP Address ของ ESP8266 ที่เชื่อมต่อแล้ว
let ESP8266_IP = '172.20.10.7';

// Base URL สำหรับการเชื่อมต่อ ESP8266
let ESP_BASE_URL = `http://${ESP8266_IP}`;

// Web Deployment Configuration
const WEB_DEPLOYMENT = {
  // ตรวจสอบว่าเป็น web deployment หรือไม่
  isWeb: window.location.protocol === 'https:' || window.location.hostname !== 'localhost',
  
  // Demo mode สำหรับการแสดงผลเมื่อไม่มี ESP8266
  demoMode: false,
  
  // ข้อมูลสำหรับ demo
  demoData: {
    connected: true,
    lightLevel: 0,
    fanSpeed: 0,
    currentTrack: 1,
    volume: 15,
    isPlaying: false
  }
};

// การตั้งค่าอื่นๆ
const CONFIG = {
    // เวลาหมดอายุสำหรับการเชื่อมต่อ (มิลลิวินาที)
    CONNECTION_TIMEOUT: 8000,
    
    // ช่วงเวลาการตรวจสอบการเชื่อมต่อ (มิลลิวินาที)
    CONNECTION_CHECK_INTERVAL: 10000,
    
    // จำนวนครั้งสูงสุดในการลองเชื่อมต่อ
    MAX_RETRY_ATTEMPTS: 3,
    
    // ระดับเสียงเริ่มต้น
    DEFAULT_VOLUME: 50,
    
    // ระดับเสียงสูงสุดของ DFPlayer (0-30)
    DFPLAYER_MAX_VOLUME: 30
};

// ตรวจสอบว่าการตั้งค่า IP ถูกต้องหรือไม่
// Override from localStorage if available
try {
  const savedIp = localStorage.getItem('esp8266_ip');
  const savedDemo = localStorage.getItem('demo_mode');
  if (savedIp) {
    ESP8266_IP = savedIp;
    ESP_BASE_URL = `http://${ESP8266_IP}`;
  }
  if (savedDemo !== null) {
    WEB_DEPLOYMENT.demoMode = savedDemo === 'true';
  }
} catch (e) {
  // ignore storage errors
}

if (!ESP8266_IP || ESP8266_IP === 'YOUR_ESP8266_IP_HERE') {
    console.warn('⚠️ กรุณาตั้งค่า IP Address ของ ESP8266 ในไฟล์ config.js!');
}
