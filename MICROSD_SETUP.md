# 🎵 MicroSD Card Setup Guide

## 📁 File Structure สำหรับ DFPlayer Mini

### ✅ โครงสร้างที่ถูกต้อง:
```
MicroSD Card (FAT32 Format)
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

## 🔧 Setup Steps

### 1. Format MicroSD Card
```
- Format: FAT32
- Allocation Unit Size: Default
- Volume Label: SLEEPHELPER (optional)
```

### 2. Copy MP3 Files
```
- Copy ไฟล์เพลงไปยัง root directory ของ MicroSD Card
- ไม่ต้องสร้างโฟลเดอร์ย่อย
- ชื่อไฟล์ต้องเป็น: 0001.mp3, 0002.mp3, ..., 0010.mp3
```

### 3. File Requirements
```
- Format: MP3
- Bitrate: 128kbps หรือต่ำกว่า (แนะนำ 64-96kbps)
- Sample Rate: 44.1kHz หรือต่ำกว่า
- File Size: ไม่เกิน 32MB ต่อไฟล์
- Duration: 5-30 นาที ต่อไฟล์
```

## 🎯 Track Mapping

| Track # | File Name | Web Interface | Description |
|---------|-----------|---------------|-------------|
| 1 | 0001.mp3 | 🌧️ ฝนตก | Rain sounds |
| 2 | 0002.mp3 | 🌊 คลื่นทะเล | Ocean waves |
| 3 | 0003.mp3 | 🎵 เพลงกล่อม | Lullaby |
| 4 | 0004.mp3 | 🎶 เพลงบำบัด | Therapy music |
| 5 | 0005.mp3 | 🙏 บทธัมจักรกัปปวัตนสูตร | Dharma chant |
| 6 | 0006.mp3 | 📿 รวมบทมงคล | Mongkol chants |
| 7 | 0007.mp3 | 🔔 ขันทิเบต | Tibetan bells |
| 8 | 0008.mp3 | 🎯 432Hz+528Hz | Healing frequencies |
| 9 | 0009.mp3 | 🎹 เสียงเปียโน | Piano sounds |
| 10 | 0010.mp3 | 🎼 โมสาร์ทกล่อมนาน | Mozart lullaby |

## 🧪 Testing

### 1. File Verification
```
- ตรวจสอบว่าไฟล์อยู่ใน root directory
- ตรวจสอบชื่อไฟล์: 0001.mp3, 0002.mp3, etc.
- ตรวจสอบขนาดไฟล์: ไม่เกิน 32MB
```

### 2. DFPlayer Test
```
- ใส่ MicroSD Card เข้า DFPlayer Mini
- เชื่อมต่อกับ ESP8266
- ทดสอบผ่าน web interface:
  - เลือกเพลง 1-10
  - กดเล่น/หยุด
  - ปรับระดับเสียง
```

### 3. API Testing
```bash
# Test track selection
curl http://172.20.10.7/play?track=1
curl http://172.20.10.7/play?track=5
curl http://172.20.10.7/play?track=10

# Test volume control
curl http://172.20.10.7/volume?level=15
curl http://172.20.10.7/volume?level=25

# Test play/pause
curl http://172.20.10.7/pause
curl http://172.20.10.7/play
```

## ⚠️ Common Issues

### ❌ ไฟล์ไม่เล่น
1. ตรวจสอบชื่อไฟล์: ต้องเป็น 0001.mp3, 0002.mp3, etc.
2. ตรวจสอบตำแหน่งไฟล์: ต้องอยู่ใน root directory
3. ตรวจสอบ format: ต้องเป็น FAT32
4. ตรวจสอบขนาดไฟล์: ไม่เกิน 32MB

### ❌ เสียงไม่ดัง
1. ตรวจสอบลำโพง
2. ตรวจสอบระดับเสียง DFPlayer (0-30)
3. ตรวจสอบ power supply ของ DFPlayer
4. ตรวจสอบไฟล์ MP3 quality

### ❌ DFPlayer ไม่ตอบสนอง
1. ตรวจสอบการต่อสาย TX/RX
2. ตรวจสอบ power supply
3. ตรวจสอบ MicroSD Card
4. ตรวจสอบ baud rate (9600)

## 🎵 Recommended Audio Sources

### Free Resources
- **Freesound.org**: Sound effects และ ambient sounds
- **YouTube Audio Library**: เพลงฟรีสำหรับใช้งาน
- **Zapsplat**: Sound effects (ต้องสมัครสมาชิก)
- **BBC Sound Effects**: Sound effects ฟรี

### Commercial Resources
- **AudioJungle**: เพลงและ sound effects
- **Pond5**: Audio content
- **Artlist**: Music และ sound effects

### DIY Recording
- ใช้ smartphone บันทึกเสียงธรรมชาติ
- ใช้ software แปลงเป็น MP3 format
- ใช้ Audacity สำหรับ edit audio

## 🔧 Audio Conversion

### Using FFmpeg
```bash
# Convert to MP3 with optimal settings
ffmpeg -i input.wav -codec:a libmp3lame -b:a 96k -ar 44100 output.mp3

# Batch convert multiple files
for i in {1..10}; do
    ffmpeg -i "track_${i}.wav" -codec:a libmp3lame -b:a 96k -ar 44100 "000${i}.mp3"
done
```

### Using Online Converters
- **CloudConvert**: Convert ไฟล์ออนไลน์
- **Online Audio Converter**: ฟรี online converter
- **Convertio**: รองรับหลาย format

## 📊 File Size Optimization

### Recommended Settings
```
- Bitrate: 96kbps (ดีที่สุดสำหรับ DFPlayer)
- Sample Rate: 44.1kHz
- Channels: Stereo หรือ Mono
- Format: MP3
```

### File Size Estimates
```
- 5 นาที @ 96kbps: ~3.6MB
- 10 นาที @ 96kbps: ~7.2MB  
- 15 นาที @ 96kbps: ~10.8MB
- 30 นาที @ 96kbps: ~21.6MB
```

## 🎉 Success Indicators

### ✅ MicroSD Setup สำเร็จเมื่อ:
- [ ] ไฟล์ทั้งหมดอยู่ใน root directory
- [ ] ชื่อไฟล์ถูกต้อง: 0001.mp3 ถึง 0010.mp3
- [ ] DFPlayer อ่านไฟล์ได้
- [ ] เสียงเล่นผ่านลำโพงได้
- [ ] ควบคุมผ่าน web interface ได้
- [ ] ไม่มี error ใน Serial Monitor

### 🎯 Performance Targets
- [ ] ไฟล์โหลดเร็ว (< 2 วินาที)
- [ ] เสียงชัดเจนไม่มี distortion
- [ ] Volume control ทำงานได้
- [ ] Play/Pause responsive
- [ ] ไม่มีเสียงรบกวน

**Happy Audio Setup! 🎵✨**
