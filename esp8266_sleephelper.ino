/*
 * SleepHelper ESP8266 Controller
 * 
 * ควบคุมอุปกรณ์สำหรับการนอนหลับ:
 * - LED Strip (แสง)
 * - Fan (พัดลม)
 * - DFPlayer Mini (เสียงกล่อม)
 * 
 * Libraries Required (ESP8266):
 * - ESP8266WiFi (builtin with ESP8266 core)
 * - ESPAsyncTCP
 * - ESPAsyncWebServer
 * - DFPlayerMini_Fast
 * - ArduinoJson
 */

#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <DFPlayerMini_Fast.h>

// WiFi Configuration - ตั้งค่าแล้วสำหรับ IP 172.20.10.7
const char* ssid = "____.plxng";
const char* password = "pleng1209";

// Hardware Configuration
const int LED_PIN = D1;           // LED Strip (PWM)
const int FAN_PIN = D2;           // Fan control (PWM)
const int DFPLAYER_TX = D5;       // DFPlayer TX
const int DFPLAYER_RX = D6;       // DFPlayer RX

// Web Server
AsyncWebServer server(80);

// DFPlayer Mini
SoftwareSerial dfplayerSerial(DFPLAYER_RX, DFPLAYER_TX);
DFPlayerMini_Fast audioPlayer; // renamed to avoid namespace conflict with dfplayer::

// Device States
struct DeviceState {
  int lightLevel = 0;        // 0-3
  int fanSpeed = 0;          // 0-5
  int currentTrack = 1;      // 1-10
  int volume = 15;           // 0-30
  bool isPlaying = false;
  bool lightMode = true;     // true = fixed, false = timer
  bool fanMode = true;       // true = fixed, false = timer
  bool soundMode = true;     // true = loop, false = timer
};

DeviceState state;

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌙 SleepHelper ESP8266 Starting...");
  
  // Initialize hardware
  setupHardware();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize DFPlayer
  setupDFPlayer();
  
  // Setup web server
  setupWebServer();
  
  Serial.println("✅ SleepHelper ESP8266 Ready!");
  Serial.print("📡 Web server running at: http://");
  Serial.println(WiFi.localIP());
  Serial.println("🌐 Access web interface at: http://" + WiFi.localIP().toString());
  Serial.println("🎵 Ready to control: LED Strip, Fan, DFPlayer Mini");
  Serial.println("📊 API endpoints: /status, /light, /fan, /play, /pause, /volume");
}

void loop() {
  // Update tasks (no DFPlayer loop required for DFPlayerMini_Fast)
  
  // Update hardware outputs
  updateHardware();
  
  delay(100);
}

void setupHardware() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  
  // Initialize with off state
  analogWrite(LED_PIN, 0);
  analogWrite(FAN_PIN, 0);
  
  Serial.println("🔧 Hardware initialized");
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("📶 Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✅ WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("RSSI: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

void setupDFPlayer() {
  dfplayerSerial.begin(9600);
  
  if (!audioPlayer.begin(dfplayerSerial)) {
    Serial.println("❌ DFPlayer Mini not found!");
  } else {
    Serial.println("✅ DFPlayer Mini initialized");
    audioPlayer.volume(state.volume);
    audioPlayer.stop();
  }
}

void setupWebServer() {
  // CORS headers helper function
  auto addCORS = [](AsyncWebServerResponse *res) {
    res->addHeader("Access-Control-Allow-Origin", "*");
    res->addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res->addHeader("Access-Control-Allow-Headers", "Content-Type");
    res->addHeader("Access-Control-Allow-Private-Network", "true");
  };

  // Preflight OPTIONS handlers (CORS)
  auto handleOptions = [addCORS](AsyncWebServerRequest *req){
    auto *res = req->beginResponse(204);
    addCORS(res);
    req->send(res);
  };
  server.on("/status",   HTTP_OPTIONS, handleOptions);
  server.on("/light",    HTTP_OPTIONS, handleOptions);
  server.on("/fan",      HTTP_OPTIONS, handleOptions);
  server.on("/play",     HTTP_OPTIONS, handleOptions);
  server.on("/pause",    HTTP_OPTIONS, handleOptions);
  server.on("/stop",     HTTP_OPTIONS, handleOptions);
  server.on("/next",     HTTP_OPTIONS, handleOptions);
  server.on("/previous", HTTP_OPTIONS, handleOptions);
  server.on("/volume",   HTTP_OPTIONS, handleOptions);

  // Status endpoint - แสดงข้อมูลครบถ้วน
  server.on("/status", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    String json = "{";
    json += "\"status\":\"ok\",";
    json += "\"timestamp\":" + String(millis()) + ",";
    json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"heap\":" + String(ESP.getFreeHeap()) + ",";
    json += "\"playing\":" + String(state.isPlaying ? "true" : "false") + ",";
    json += "\"track\":" + String(state.currentTrack) + ",";
    json += "\"volume\":" + String(state.volume) + ",";
    json += "\"light\":" + String(state.lightLevel) + ",";
    json += "\"fan\":" + String(state.fanSpeed) + ",";
    json += "\"uptime\":" + String(millis() / 1000);
    json += "}";
    
    auto *res = req->beginResponse(200, "application/json", json);
    addCORS(res);
    req->send(res);
    
    Serial.println("📊 Status requested - " + String(millis()));
  });

  // Light control endpoints - PWM control
  server.on("/light", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    if (req->hasParam("level")) {
      int level = req->getParam("level")->value().toInt();
      level = constrain(level, 0, 3);
      
      // Convert level to PWM (0-255)
      int pwmValue = map(level, 0, 3, 0, 255);
      analogWrite(LED_PIN, pwmValue);
      
      state.lightLevel = level;
      
      Serial.print("💡 Light level set to: ");
      Serial.print(level);
      Serial.print(" (PWM: ");
      Serial.print(pwmValue);
      Serial.println(")");
      
      String json = "{\"status\":\"ok\",\"level\":" + String(level) + ",\"pwm\":" + String(pwmValue) + "}";
      auto *res = req->beginResponse(200, "application/json", json);
      addCORS(res);
      req->send(res);
    } else {
      req->send(400, "application/json", "{\"error\":\"Missing level parameter\"}");
    }
  });

  // Fan control endpoints - PWM control
  server.on("/fan", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    if (req->hasParam("speed")) {
      int speed = req->getParam("speed")->value().toInt();
      speed = constrain(speed, 0, 5);
      
      // Convert speed to PWM (0-255)
      int pwmValue = map(speed, 0, 5, 0, 255);
      analogWrite(FAN_PIN, pwmValue);
      
      state.fanSpeed = speed;
      
      Serial.print("🌀 Fan speed set to: ");
      Serial.print(speed);
      Serial.print(" (PWM: ");
      Serial.print(pwmValue);
      Serial.println(")");
      
      String json = "{\"status\":\"ok\",\"speed\":" + String(speed) + ",\"pwm\":" + String(pwmValue) + "}";
      auto *res = req->beginResponse(200, "application/json", json);
      addCORS(res);
      req->send(res);
    } else {
      req->send(400, "application/json", "{\"error\":\"Missing speed parameter\"}");
    }
  });

  // Music control endpoints - รองรับ /play?track=X
  server.on("/play", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    if (req->hasParam("track")) {
      int track = req->getParam("track")->value().toInt();
      track = constrain(track, 1, 10);
      state.currentTrack = track;
      
      audioPlayer.play(track);
      state.isPlaying = true;
      
      Serial.print("🎵 Playing track: ");
      Serial.println(track);
      
      String json = "{\"status\":\"ok\",\"track\":" + String(track) + ",\"playing\":true}";
      auto *res = req->beginResponse(200, "application/json", json);
      addCORS(res);
      req->send(res);
    } else {
      // Play current track
      audioPlayer.start();
      state.isPlaying = true;
      
      Serial.println("▶️ Resuming playback");
      
      String json = "{\"status\":\"ok\",\"track\":" + String(state.currentTrack) + ",\"playing\":true}";
      auto *res = req->beginResponse(200, "application/json", json);
      addCORS(res);
      req->send(res);
    }
  });


  server.on("/pause", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    audioPlayer.pause();
    state.isPlaying = false;
    
    Serial.println("⏸️ Music paused");
    
    auto *res = req->beginResponse(200, "application/json", "{\"status\":\"ok\",\"playing\":false}");
    addCORS(res);
    req->send(res);
  });

  server.on("/stop", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    audioPlayer.stop();
    state.isPlaying = false;
    state.currentTrack = 1;
    
    Serial.println("⏹️ Music stopped");
    
    auto *res = req->beginResponse(200, "application/json", "{\"status\":\"ok\",\"playing\":false}");
    addCORS(res);
    req->send(res);
  });

  server.on("/next", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    state.currentTrack++;
    if (state.currentTrack > 10) state.currentTrack = 1;
    
    audioPlayer.play(state.currentTrack);
    state.isPlaying = true;
    
    Serial.print("⏭️ Next track: ");
    Serial.println(state.currentTrack);
    
    String json = "{\"status\":\"ok\",\"track\":" + String(state.currentTrack) + "}";
    auto *res = req->beginResponse(200, "application/json", json);
    addCORS(res);
    req->send(res);
  });

  server.on("/previous", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    state.currentTrack--;
    if (state.currentTrack < 1) state.currentTrack = 10;
    
    audioPlayer.play(state.currentTrack);
    state.isPlaying = true;
    
    Serial.print("⏮️ Previous track: ");
    Serial.println(state.currentTrack);
    
    String json = "{\"status\":\"ok\",\"track\":" + String(state.currentTrack) + "}";
    auto *res = req->beginResponse(200, "application/json", json);
    addCORS(res);
    req->send(res);
  });

  server.on("/volume", HTTP_GET, [addCORS](AsyncWebServerRequest *req){
    if (req->hasParam("level")) {
      int level = req->getParam("level")->value().toInt();
      level = constrain(level, 0, 30);
      
      audioPlayer.volume(level);
      state.volume = level;
      
      Serial.print("🔊 Volume set to: ");
      Serial.print(level);
      Serial.println(" (DFPlayer range 0-30)");
      
      String json = "{\"status\":\"ok\",\"level\":" + String(level) + "}";
      auto *res = req->beginResponse(200, "application/json", json);
      addCORS(res);
      req->send(res);
    } else {
      req->send(400, "application/json", "{\"error\":\"Missing level parameter\"}");
    }
  });

  // 404 handler
  server.onNotFound([](AsyncWebServerRequest *req){
    req->send(404, "application/json", "{\"error\":\"Endpoint not found\"}");
  });

  server.begin();
  Serial.println("🌐 Web server started");
}

void updateHardware() {
  // Update LED strip (PWM 0-255)
  int ledBrightness = map(state.lightLevel, 0, 3, 0, 255);
  analogWrite(LED_PIN, ledBrightness);
  
  // Update fan speed (PWM 0-255)
  int fanPWM = map(state.fanSpeed, 0, 5, 0, 255);
  analogWrite(FAN_PIN, fanPWM);
}

/*
 * Track List (DFPlayer folder structure):
 * ไฟล์เพลงอยู่ใน root directory ของ MicroSD Card
 * 
 * /0001.mp3 - ฝนตก (Rain sounds)
 * /0002.mp3 - คลื่นทะเล (Ocean waves)
 * /0003.mp3 - เพลงกล่อม (Lullaby)
 * /0004.mp3 - เพลงบำบัด (Therapy music)
 * /0005.mp3 - บทธัมจักรกัปปวัตนสูตร (Dharma chant)
 * /0006.mp3 - รวมบทมงคล (Mongkol chants)
 * /0007.mp3 - ขันทิเบต (Tibetan bells)
 * /0008.mp3 - 432Hz+528Hz (Healing frequencies)
 * /0009.mp3 - เสียงเปียโน (Piano sounds)
 * /0010.mp3 - โมสาร์ทกล่อมนาน (Mozart lullaby)
 */
