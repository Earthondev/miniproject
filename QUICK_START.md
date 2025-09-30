# 🚀 SleepHelper Quick Start Guide

## ⚡ เริ่มใช้งานได้ใน 5 นาที!

### ✅ สิ่งที่คุณมีแล้ว:
- ✅ ESP8266 NodeMCU
- ✅ WiFi: `____.plxng` (เชื่อมต่อแล้ว)
- ✅ IP Address: `172.20.10.5`
- ✅ Web Interface: http://172.20.10.5

## 🔧 ขั้นตอนการ Deploy

### 1. Upload Arduino Code
```bash
# เปิด Arduino IDE
# เปิดไฟล์: esp8266_sleephelper.ino
# เลือก Board: "NodeMCU 1.0 (ESP-12E Module)"
# เลือก Port: COM port ของ ESP8266
# กด Upload (Ctrl+U)
```

### 2. ติดตั้ง Libraries (ถ้ายังไม่มี)
```
Tools → Manage Libraries → ค้นหา:
- ESPAsyncWebServer
- DFPlayerMini_Fast  
- ArduinoJson
```

### 3. เชื่อมต่อฮาร์ดแวร์
```
ESP8266 D1 → LED Strip (ผ่าน 220Ω resistor)
ESP8266 D2 → Fan Relay Module
ESP8266 D5 → DFPlayer RX
ESP8266 D6 → DFPlayer TX
ESP8266 3.3V → DFPlayer VCC
ESP8266 GND → DFPlayer GND
```

### 4. เตรียม MicroSD Card
```
Format: FAT32
ตำแหน่งไฟล์: Root directory ของ MicroSD Card
ไฟล์: 0001.mp3, 0002.mp3, 0003.mp3, ..., 0010.mp3
```

### 5. ทดสอบการทำงาน
```
1. เปิด Serial Monitor (115200 baud)
2. ดู IP address: 172.20.10.5
3. เปิดเว็บ: http://172.20.10.5
4. ทดสอบควบคุมอุปกรณ์
```

## 🎯 API Endpoints ที่พร้อมใช้

### Status Check
```bash
curl http://172.20.10.5/status
```

### Light Control
```bash
curl http://172.20.10.5/light?level=2  # ระดับ 0-3
```

### Fan Control  
```bash
curl http://172.20.10.5/fan?speed=3    # ความเร็ว 0-5
```

### Music Control
```bash
curl http://172.20.10.5/play?track=1   # เล่นเพลง 1-10
curl http://172.20.10.5/pause          # หยุดชั่วคราว
curl http://172.20.10.5/volume?level=15 # ระดับเสียง 0-30
```

## 🌐 Web Interface

### เปิดเว็บแอป
```bash
# วิธีที่ 1: เปิดไฟล์ index.html โดยตรง
open index.html

# วิธีที่ 2: ใช้ local server (แนะนำ)
npm run dev
```

### เข้าถึงผ่านมือถือ
```
URL: http://172.20.10.2:8000
(ใช้ IP ของคอมพิวเตอร์ในเครือข่าย)
```

## 🎵 เพลงที่รองรับ

| Track | ไฟล์ | ชื่อเพลง |
|-------|------|----------|
| 1 | 0001.mp3 | 🌧️ ฝนตก |
| 2 | 0002.mp3 | 🌊 คลื่นทะเล |
| 3 | 0003.mp3 | 🎵 เพลงกล่อม |
| 4 | 0004.mp3 | 🎶 เพลงบำบัด |
| 5 | 0005.mp3 | 🙏 บทธัมจักรกัปปวัตนสูตร |
| 6 | 0006.mp3 | 📿 รวมบทมงคล |
| 7 | 0007.mp3 | 🔔 ขันทิเบต |
| 8 | 0008.mp3 | 🎯 432Hz+528Hz |
| 9 | 0009.mp3 | 🎹 เสียงเปียโน |
| 10 | 0010.mp3 | 🎼 โมสาร์ทกล่อมนาน |

## 🔍 การแก้ไขปัญหาแบบเร็ว

### ESP8266 ไม่ตอบสนอง
```bash
# ตรวจสอบ IP
ping 172.20.10.5

# ตรวจสอบ Serial Monitor
# ควรเห็น: "✅ SleepHelper ESP8266 Ready!"
```

### เว็บแอปไม่เชื่อมต่อ
```bash
# ตรวจสอบ config.js
const ESP8266_IP = '172.20.10.5';

# เปิด Developer Tools (F12)
# ดู Console logs
```

### DFPlayer ไม่เล่นเสียง
```bash
# ตรวจสอบการต่อสาย
ESP8266 D5 → DFPlayer RX
ESP8266 D6 → DFPlayer TX

# ตรวจสอบไฟล์ใน MicroSD
# ต้องมี: 0001.mp3, 0002.mp3, ...
```

## 📱 การใช้งานบนมือถือ

### เปิดเว็บแอปบนมือถือ
1. เชื่อมต่อ WiFi เดียวกับ ESP8266
2. เปิดเบราว์เซอร์
3. ไปที่: http://172.20.10.2:8000
4. ใช้งานได้เหมือนคอมพิวเตอร์

### ควบคุมด้วยเสียง (ถ้าต้องการ)
- ใช้ Siri/Google Assistant
- บอก: "เปิดเว็บ 172.20.10.2:8000"
- หรือสร้าง Shortcut บนมือถือ

## 🎨 การปรับแต่ง

### เปลี่ยนสี Theme
แก้ไขใน `styles.css`:
```css
/* เปลี่ยนสีหลัก */
background: linear-gradient(135deg, #81d4fa, #ce93d8);
```

### เพิ่มเพลงใหม่
1. เพิ่มไฟล์ .mp3 ใน MicroSD
2. อัพเดต playlist ใน `app.js`
3. แก้ไข Arduino code

### เปลี่ยนภาษา
แก้ไขข้อความใน `index.html` และ `app.js`

## 🚀 Advanced Features

### OTA Update (ถ้าต้องการ)
```bash
# เข้าถึง OTA interface
http://172.20.10.5/update

# อัพโหลด firmware ใหม่ผ่านเว็บ
```

### Remote Access (ถ้าต้องการ)
```bash
# ใช้ ngrok หรือ similar service
ngrok http 172.20.10.5

# เข้าถึงจากภายนอกเครือข่าย
```

## 📊 Monitoring & Logs

### Serial Monitor
```
🌙 SleepHelper ESP8266 Starting...
✅ DFPlayer Mini connected!
✅ WiFi connected!
📡 IP address: 172.20.10.5
✅ SleepHelper ESP8266 Ready!
📊 Status requested - 12345
💡 Light level set to: 2 (PWM: 170)
🌀 Fan speed set to: 3 (PWM: 153)
🎵 Playing track: 1
```

### Web Interface Logs
เปิด Developer Tools (F12) → Console:
```
🚀 SleepHelper App initialized
🔍 Running network diagnostics...
✅ ESP8266 response: {status: "ok", rssi: -45, ...}
💡 Light level set to: 2
🌀 Fan speed set to: 3
🎵 Selected track 1: rain
```

## 🎉 พร้อมใช้งาน!

ตอนนี้ SleepHelper พร้อมใช้งานแล้ว! 🌙✨

### สิ่งที่สามารถทำได้:
- ✅ ควบคุมแสง LED Strip (0-3 ระดับ)
- ✅ ควบคุมพัดลม (0-5 ระดับ)
- ✅ เล่นเพลงกล่อมหลับ 10 แบบ
- ✅ ตั้งเวลาปิดอัตโนมัติ
- ✅ ใช้งานบนมือถือและคอมพิวเตอร์
- ✅ Real-time status monitoring

### ขั้นตอนต่อไป:
1. เชื่อมต่อฮาร์ดแวร์ตาม wiring diagram
2. เตรียมไฟล์เพลงใน MicroSD
3. Upload Arduino code
4. เปิดเว็บแอปและทดสอบ!

**Happy Sleeping! 🌙✨**
