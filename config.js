// ESP8266 Configuration
// IP Address ของ ESP8266 ที่เชื่อมต่อแล้ว
const ESP8266_IP = '172.20.10.5';

// Base URL สำหรับการเชื่อมต่อ ESP8266
const ESP_BASE_URL = `http://${ESP8266_IP}`;

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
if (!ESP8266_IP || ESP8266_IP === 'YOUR_ESP8266_IP_HERE') {
    console.warn('⚠️ กรุณาตั้งค่า IP Address ของ ESP8266 ในไฟล์ config.js!');
}
