#!/usr/bin/env node

// Test script สำหรับทดสอบ ESP8266 connection
const ESP8266_IP = '172.20.10.7';

async function testESP8266() {
    console.log('🔍 Testing ESP8266 connection...');
    console.log(`📡 Target IP: ${ESP8266_IP}`);
    console.log('');

    const endpoints = [
        { name: 'Status', url: `/status` },
        { name: 'Light Level 1', url: `/light?level=1` },
        { name: 'Fan Speed 2', url: `/fan?speed=2` },
        { name: 'Play Track 1', url: `/play?track=1` },
        { name: 'Volume 15', url: `/volume?level=15` }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🧪 Testing ${endpoint.name}...`);
            const response = await fetch(`http://${ESP8266_IP}${endpoint.url}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name}: Success`);
                console.log(`   Response: ${JSON.stringify(data)}`);
            } else {
                console.log(`❌ ${endpoint.name}: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
        console.log('');
    }

    // Network diagnostics
    console.log('🔍 Network Diagnostics:');
    console.log(`   Browser: ${typeof fetch !== 'undefined' ? 'Fetch API available' : 'Fetch API not available'}`);
    console.log(`   Target IP: ${ESP8266_IP}`);
    console.log(`   Test URL: http://${ESP8266_IP}/status`);
    console.log('');
    console.log('💡 Tips:');
    console.log('   1. ตรวจสอบว่า ESP8266 เปิดอยู่และเชื่อมต่อ WiFi');
    console.log('   2. ตรวจสอบ Serial Monitor ว่าแสดง IP address');
    console.log('   3. ลอง ping 172.20.10.7 ใน terminal');
    console.log('   4. ตรวจสอบว่า ESP8266 และคอมพิวเตอร์อยู่ใน WiFi เดียวกัน');
}

// Run test
testESP8266().catch(console.error);
