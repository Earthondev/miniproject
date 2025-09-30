# SleepHelper - Personal Sleep Comfort Assistant

🌙 SleepHelper เป็นเว็บแอปพลิเคชันสำหรับควบคุมสภาพแวดล้อมการนอนหลับผ่าน ESP8266 พร้อมระบบเสียงกล่อมหลับ

## ✨ Features

- **แสง (Light Control)**: ควบคุม LED Strip ระดับ 0-3
- **พัดลม (Fan Control)**: ควบคุมความเร็วพัดลม 0-5 ระดับ
- **เสียงกล่อม (Music Player)**: เล่นเพลงกล่อมหลับ 10 แบบ พร้อม DFPlayer Mini
- **ระบบตั้งเวลา**: ตั้งเวลาปิดอัตโนมัติสำหรับทุกอุปกรณ์
- **การเชื่อมต่อ WiFi**: เชื่อมต่อ ESP8266 ผ่านเครือข่ายท้องถิ่น
- **UI/UX สวยงาม**: ออกแบบด้วย Thai language support

## 🛠️ Hardware Requirements

### ESP8266 Setup
- ESP8266 NodeMCU หรือ ESP32
- LED Strip (WS2812B หรือ analog)
- Fan Module (PWM controlled)
- DFPlayer Mini (สำหรับเสียงกล่อม)
- MicroSD Card (สำหรับเก็บไฟล์เสียง)
- Resistors และ jumper wires

### Wiring Diagram
```
ESP8266    |  Component
-----------|------------------
D1         |  LED Strip (PWM)
D2         |  Fan (PWM)
D5         |  DFPlayer TX
D6         |  DFPlayer RX
3.3V       |  DFPlayer VCC
GND        |  DFPlayer GND, LED Strip GND, Fan GND
```

## 📁 Project Structure

```
Miniproject/
├── index.html              # หน้าหลักของเว็บแอป
├── styles.css              # CSS styles
├── app.js                  # JavaScript application logic
├── config.js               # การตั้งค่า IP และ configuration
├── esp8266_sleephelper.ino # Arduino code สำหรับ ESP8266
├── package.json            # Node.js dependencies (optional)
└── README.md               # คู่มือนี้
```

## 🚀 Installation & Setup

### 1. Web Application Setup

1. **Clone หรือดาวน์โหลดโปรเจค**
   ```bash
   git clone <repository-url>
   cd Miniproject
   ```

2. **แก้ไขการตั้งค่า IP Address**
   - เปิดไฟล์ `config.js`
   - เปลี่ยน `ESP8266_IP` เป็น IP ของ ESP8266 ของคุณ
   ```javascript
   const ESP8266_IP = '192.168.1.100'; // เปลี่ยนเป็น IP จริง
   ```

3. **เปิดเว็บแอป**
   - เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์
   - หรือใช้ local server (แนะนำ):
   ```bash
   # ใช้ Python
   python -m http.server 8000
   
   # ใช้ Node.js (ต้องติดตั้ง http-server ก่อน)
   npx http-server
   ```

### 2. ESP8266 Setup

1. **ติดตั้ง Libraries ใน Arduino IDE**
   ```
   - ESPAsyncWebServer
   - DFPlayerMini_Fast
   - ArduinoJson
   ```

2. **แก้ไขการตั้งค่า WiFi**
   - เปิดไฟล์ `esp8266_sleephelper.ino`
   - เปลี่ยน SSID และ password:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

3. **เตรียมไฟล์เสียง**
   - สร้างโฟลเดอร์ `/mp3/01/` ใน MicroSD
   - ใส่ไฟล์เสียงชื่อ `001.mp3` ถึง `010.mp3`
   - ดูรายการเพลงในคอมเมนต์ของ Arduino code

4. **Upload Code**
   - เชื่อมต่อ ESP8266 เข้ากับคอมพิวเตอร์
   - เลือก Board: "NodeMCU 1.0 (ESP-12E Module)"
   - Upload code

5. **ตรวจสอบ IP Address**
   - เปิด Serial Monitor (115200 baud)
   - ดู IP Address ที่แสดง
   - อัพเดต IP ในไฟล์ `config.js`

## 🎵 Music Tracks Setup

ไฟล์เพลงใน MicroSD Card:
```
MicroSD Card Root Directory:
├── 0001.mp3  - 🌧️ ฝนตก (Rain sounds)
├── 0002.mp3  - 🌊 คลื่นทะเล (Ocean waves)
├── 0003.mp3  - 🎵 เพลงกล่อม (Lullaby)
├── 0004.mp3  - 🎶 เพลงบำบัด (Therapy music)
├── 0005.mp3  - 🙏 บทธัมจักรกัปปวัตนสูตร (Dharma chant)
├── 0006.mp3  - 📿 รวมบทมงคล (Mongkol chants)
├── 0007.mp3  - 🔔 ขันทิเบต (Tibetan bells)
├── 0008.mp3  - 🎯 432Hz+528Hz (Healing frequencies)
├── 0009.mp3  - 🎹 เสียงเปียโน (Piano sounds)
└── 0010.mp3  - 🎼 โมสาร์ทกล่อมนาน (Mozart lullaby)
```

## 🔧 API Endpoints

ESP8266 จะเปิด Web Server ที่ endpoints ต่อไปนี้:

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/status` | GET | - | ตรวจสอบสถานะการเชื่อมต่อ |
| `/light` | GET | `level` (0-3) | ควบคุมระดับแสง |
| `/fan` | GET | `speed` (0-5) | ควบคุมความเร็วพัดลม |
| `/selectTrack` | GET | `track` (1-10) | เลือกเพลง |
| `/play` | GET | - | เล่นเพลง |
| `/pause` | GET | - | หยุดเพลงชั่วคราว |
| `/stop` | GET | - | หยุดเพลง |
| `/next` | GET | - | เพลงถัดไป |
| `/previous` | GET | - | เพลงก่อนหน้า |
| `/volume` | GET | `level` (0-30) | ควบคุมระดับเสียง |

## 🔍 Troubleshooting

### ปัญหาการเชื่อมต่อ

1. **ESP8266 ไม่ตอบสนอง**
   - ตรวจสอบ IP Address ใน `config.js`
   - ตรวจสอบ WiFi connection
   - ลอง ping IP ใน Command Prompt

2. **CORS Error**
   - ESP8266 ต้องมี CORS headers (มีอยู่แล้วใน code)
   - ตรวจสอบ browser console

3. **Mixed Content Error**
   - ถ้าเว็บเปิดผ่าน HTTPS แต่ ESP8266 เป็น HTTP
   - แก้ไข: เปิดเว็บผ่าน HTTP ในวงแลน
   - หรือตั้งค่า Chrome flags: `chrome://flags/#block-insecure-private-network-requests`

4. **DFPlayer ไม่ทำงาน**
   - ตรวจสอบการต่อสาย TX/RX
   - ตรวจสอบไฟล์เสียงใน MicroSD
   - ตรวจสอบ volume level (0-30)

### การแก้ไขปัญหาเพิ่มเติม

1. **เปิด Developer Tools** (F12) ดู Console logs
2. **ตรวจสอบ Network tab** ดู HTTP requests
3. **ลองใช้ Postman** ทดสอบ API endpoints โดยตรง

## 🎨 Customization

### เปลี่ยนสี Theme
แก้ไขในไฟล์ `styles.css`:
```css
/* เปลี่ยนสีหลัก */
background: linear-gradient(135deg, #81d4fa, #ce93d8);
```

### เพิ่มเพลงใหม่
1. เพิ่มไฟล์เสียงใน MicroSD
2. อัพเดต playlist ในไฟล์ `app.js`
3. แก้ไข Arduino code เพื่อรองรับ track เพิ่มเติม

### เปลี่ยนภาษา
แก้ไขข้อความในไฟล์ `index.html` และ `app.js`

## 📱 Mobile Support

SleepHelper รองรับการใช้งานบนมือถือ:
- Responsive design
- Touch-friendly controls
- Mobile-optimized UI

## 🤝 Contributing

1. Fork โปรเจค
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. สร้าง Pull Request

## 📄 License

MIT License - ดูไฟล์ LICENSE สำหรับรายละเอียด

## 🙏 Credits

- **Font**: Google Fonts - Prompt
- **Icons**: Material Design Icons
- **Libraries**: ESPAsyncWebServer, DFPlayerMini_Fast, ArduinoJson

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Troubleshooting section
2. เปิด Issue ใน GitHub
3. ดู Arduino Serial Monitor สำหรับ debug info

---

**Happy Sleeping! 🌙✨**
