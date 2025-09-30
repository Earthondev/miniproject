# 🔌 SleepHelper ESP8266 Wiring Guide

## 📋 Hardware Components Required

### ESP8266 NodeMCU
- **VCC**: 3.3V (บางครั้งใช้ 5V ได้)
- **GND**: Ground
- **D1**: LED Strip control (PWM)
- **D2**: Fan control (PWM)
- **D5**: DFPlayer RX (ESP8266 TX)
- **D6**: DFPlayer TX (ESP8266 RX)
- **D4**: Status LED (Built-in LED)

### DFPlayer Mini
- **VCC**: 3.3V หรือ 5V (แนะนำ 5V สำหรับเสียงดัง)
- **GND**: Ground
- **RX**: เชื่อมกับ D5 (ESP8266 TX)
- **TX**: เชื่อมกับ D6 (ESP8266 RX)
- **SPK+**: ลำโพง ขั้วบวก
- **SPK-**: ลำโพง ขั้วลบ

### LED Strip (WS2812B หรือ Analog)
- **VCC**: 5V (ผ่าน Power Supply)
- **GND**: Ground
- **Data**: เชื่อมกับ D1 (ผ่าน 220Ω resistor)

### Fan Control
- **Relay Module**: เชื่อมกับ D2
- **Fan**: เชื่อมกับ Relay Module

## 🔗 Wiring Diagram

```
ESP8266 NodeMCU          DFPlayer Mini
┌─────────────┐         ┌─────────────┐
│ VCC   3.3V  │─────────│ VCC         │
│ GND   GND   │─────────│ GND         │
│ D5    TX    │─────────│ RX          │
│ D6    RX    │─────────│ TX          │
│ D1    PWM   │─────────│             │
│ D2    PWM   │─────────│             │
└─────────────┘         └─────────────┘
         │                       │
         │                       │
         ▼                       ▼
    ┌─────────┐             ┌─────────┐
    │ LED     │             │ Speaker │
    │ Strip   │             │ SPK+    │
    │         │             │ SPK-    │
    └─────────┘             └─────────┘
         │
         ▼
    ┌─────────┐
    │ Fan     │
    │ Relay   │
    │ Module  │
    └─────────┘
```

## ⚡ Power Requirements

### ESP8266
- **3.3V**: 200-300mA
- **5V**: ผ่าน USB หรือ external supply

### DFPlayer Mini
- **5V**: 100-200mA (แนะนำใช้ external supply)
- **3.3V**: ใช้งานได้แต่เสียงอาจเบา

### LED Strip
- **5V**: ขึ้นอยู่กับจำนวน LED
- **WS2812B**: ~60mA per LED
- **Analog LED**: ขึ้นอยู่กับความยาว

### Fan
- **12V/24V**: ขึ้นอยู่กับชนิดพัดลม
- **AC Fan**: ต้องใช้ Relay module

## 🛠️ Connection Steps

### 1. ESP8266 Power
```
ESP8266 VCC → 3.3V supply
ESP8266 GND → Ground rail
```

### 2. DFPlayer Mini Connection
```
ESP8266 D5 (TX) → DFPlayer RX
ESP8266 D6 (RX) → DFPlayer TX
ESP8266 3.3V    → DFPlayer VCC
ESP8266 GND     → DFPlayer GND
```

### 3. Speaker Connection
```
DFPlayer SPK+ → Speaker Positive
DFPlayer SPK- → Speaker Negative
```

### 4. LED Strip Connection
```
ESP8266 D1 → LED Strip Data (ผ่าน 220Ω resistor)
5V Supply  → LED Strip VCC
Ground     → LED Strip GND
```

### 5. Fan Control
```
ESP8266 D2 → Relay Module IN
Relay COM  → Fan Positive
Relay NO   → Power Supply Positive
Fan Negative → Power Supply Negative
```

## 🎵 MicroSD Card Setup

### File Structure
```
MicroSD Card Root Directory:
├── 0001.mp3  - ฝนตก (Rain sounds)
├── 0002.mp3  - คลื่นทะเล (Ocean waves)
├── 0003.mp3  - เพลงกล่อม (Lullaby)
├── 0004.mp3  - เพลงบำบัด (Therapy music)
├── 0005.mp3  - บทธัมจักรกัปปวัตนสูตร (Dharma chant)
├── 0006.mp3  - รวมบทมงคล (Mongkol chants)
├── 0007.mp3  - ขันทิเบต (Tibetan bells)
├── 0008.mp3  - 432Hz+528Hz (Healing frequencies)
├── 0009.mp3  - เสียงเปียโน (Piano sounds)
└── 0010.mp3  - โมสาร์ทกล่อมนาน (Mozart lullaby)
```

### File Requirements
- **Format**: MP3
- **Bitrate**: 128kbps หรือต่ำกว่า
- **Sample Rate**: 44.1kHz หรือต่ำกว่า
- **File Size**: ไม่เกิน 32MB ต่อไฟล์
- **SD Card**: FAT32 format
- **Location**: ไฟล์อยู่ใน root directory ของ MicroSD Card
- **Naming**: ต้องใช้ชื่อไฟล์ 0001.mp3, 0002.mp3, ..., 0010.mp3

## 🔧 Testing Steps

### 1. Upload Code
```cpp
// เปลี่ยน WiFi credentials
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
```

### 2. Check Serial Monitor
```
🌙 SleepHelper ESP8266 Starting...
✅ DFPlayer Mini connected!
✅ WiFi connected!
📡 IP address: 172.20.10.5
✅ SleepHelper ESP8266 Ready!
```

### 3. Test Web Interface
- เปิด http://172.20.10.5
- ทดสอบ API endpoints:
  - http://172.20.10.5/status
  - http://172.20.10.5/light?level=2
  - http://172.20.10.5/fan?speed=3
  - http://172.20.10.5/play?track=1

### 4. Hardware Test
- LED Strip: ควรสว่างตามระดับที่ตั้ง
- Fan: ควรหมุนตามความเร็วที่ตั้ง
- Speaker: ควรเล่นเพลงตามที่เลือก

## ⚠️ Safety Notes

1. **Power Supply**: ใช้ power supply ที่เหมาะสมกับอุปกรณ์
2. **Grounding**: เชื่อม ground ให้ครบทุกอุปกรณ์
3. **Voltage Levels**: ตรวจสอบ voltage ก่อนเชื่อมต่อ
4. **Current Limits**: ไม่เกินขีดจำกัดของ ESP8266
5. **Heat Management**: ระบายความร้อนให้เหมาะสม

## 🐛 Troubleshooting

### ESP8266 ไม่เชื่อมต่อ WiFi
- ตรวจสอบ SSID และ password
- ตรวจสอบ signal strength
- ลองรีสตาร์ท ESP8266

### DFPlayer ไม่เล่นเสียง
- ตรวจสอบการต่อสาย TX/RX
- ตรวจสอบไฟล์ใน MicroSD
- ตรวจสอบ volume level
- ตรวจสอบลำโพง

### LED Strip ไม่ทำงาน
- ตรวจสอบ power supply
- ตรวจสอบการต่อสาย data
- ตรวจสอบ resistor 220Ω

### Fan ไม่หมุน
- ตรวจสอบ relay module
- ตรวจสอบ power supply ของพัดลม
- ตรวจสอบการต่อสาย

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Serial Monitor
2. ดู error messages ใน web interface
3. ตรวจสอบ wiring ตาม diagram
4. ทดสอบ hardware ทีละชิ้น
