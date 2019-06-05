// Card reader: https://www.instructables.com/id/ESP32-With-RFID-Access-Control/

#include <Arduino.h>

#include <ESPmDNS.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

#include <WiFiClientSecure.h>
#include <WiFiClient.h>

#include "SSD1306.h" // alias for `#include "SSD1306Wire.h"'
#include "esp_wpa2.h"

#include "config.h"

unsigned long lastUIDSendTime = 0;
String serverIpStr;
WiFiClient client;

MFRC522 mfrc522(SS_PIN, RST_PIN);
SSD1306 display(0x3c, OLED_SDA, OLED_SCL);

void print(String s, bool buffer, const uint8_t *font = ArialMT_Plain_10) {
  static String out = "";

  out += s;

  display.setFont(font);

  display.clear();
  display.drawStringMaxWidth(0, 0, 128, out);
  display.display();

  if(!buffer) {
    out = "";
  }
}

void println(String s, bool buffer, const uint8_t *font = ArialMT_Plain_10) {
  print(s + '\n', buffer, font);
}

void initCardReader() {
  mfrc522.PCD_Init();
  println("[Card]\tInitialized", false);
  delay(1000);
}

void connectToWiFi() {
#ifdef WPA2_ENTERPRISE
    const char* ssid = WPA2_SSID;
#else
    const char* ssid = SSID;
#endif

  print("[WiFi]\tConnecting to ", true);
  print(ssid, true);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);

#ifdef WPA2_ENTERPRISE
  esp_wifi_sta_wpa2_ent_set_identity((uint8_t *)EAP_ANONYMOUS_IDENTITY, strlen(EAP_ANONYMOUS_IDENTITY));
  esp_wifi_sta_wpa2_ent_set_username((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
  esp_wifi_sta_wpa2_ent_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
  esp_wpa2_config_t config = WPA2_CONFIG_INIT_DEFAULT(); //set config settings to default
  esp_wifi_sta_wpa2_ent_enable(&config); //set config settings to enable function

  WiFi.begin(ssid);
#else
  WiFi.begin(SSID, PASS);
#endif

  while (WiFi.status() != WL_CONNECTED) {
    print(".", true);
    delay(1500);
  }

  print(" connected to ", true);
  println(ssid, false);
  delay(1000);
}

void connectToServer() {
  client.stop();

  int res = client.connect(SERVER_NAME, SERVER_PORT);
  if (!res) {
        println(" failed", false);
    delay(2000);
  }
  else {
      }
}

String getUIDJson() {
  String out = "{\"uid\":[";

  for(uint8_t i = 0; i < mfrc522.uid.size; i++) {
    out += String(mfrc522.uid.uidByte[i]);

    if(i != mfrc522.uid.size - 1) {
      out += ',';
    }
  }

  out += "]}";

  return out;
}

bool writePoints() {
  client.flush();

  String UIDJSONString = getUIDJson();
  
  println("Sending card data", false);
  delay(2000);

    
  client.println("POST http://" SERVER_NAME "/api/esp/writePoints HTTP/1.0");
  client.println("Host: " SERVER_NAME);
  client.println("Content-Type: application/json");
  client.println("Content-Length: " + String(UIDJSONString.length()));
  client.println("Connection: keep-alive");
  client.println();
  client.println(UIDJSONString);
  client.println();
  
    unsigned long timeBefore = millis();
  while(!client.available()) {
        delay(500);

    if((unsigned long) millis() - timeBefore > WAIT_FOR_HEADERS_TIMEOUT) {
            return false;
    }
  }

  while(client.available()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
            break;
    }
  }

    String recv = "";
  while (client.available()) {
    char c = client.read();
    recv += c;
  }
  
  DynamicJsonDocument json(2048);
  deserializeJson(json, recv);

  if(json["error"].isNull()) {
    display.clear();
    display.setFont(ArialMT_Plain_24);
    display.drawString(0, 0, "OK");
    display.setFont(ArialMT_Plain_16);
    display.drawString(0, 40, json["login"]);
    display.display();
    
    delay(3000);
    return true;
  }

  String error = json["error"];
  println(error, false);
  delay(3000);

  return false;
}

bool readCardUID() {
  if (!mfrc522.PICC_IsNewCardPresent()) {
		return false;
	}

	if (!mfrc522.PICC_ReadCardSerial()) {
		return false;
	}

  return true;
}

bool uidEqualsTo(uint8_t uid[10], uint8_t length) {
  if(mfrc522.uid.size != length) {
    return false;
  }

  for(uint8_t i = 0; i < length; i++) {
    if(mfrc522.uid.uidByte[i] != uid[i]) {
      return false;
    }
  }

  return true;
}

void writePointsIfCardIsPresent() {
  static uint8_t lastUIDBytes[MAX_UID_SIZE] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
  static uint8_t lastUIDLength = 0;
  static bool printed = false;

  bool read = readCardUID();

  if(!read) { // card not present or is unreadable
    if(printed == false) {
      println("Place card", false, ArialMT_Plain_16);
      printed = true;
    }
    return;
  }

  printed = false;
  println("Card detected", false);

  if(uidEqualsTo(lastUIDBytes, lastUIDLength)) { // multiple card uid write
    println("[Reader] Card already loaded", false);
    delay(2000);
    return;
  }

  connectToServer();
  if (!client.connected())
  {
    println("Not connected", false);
    delay(2000);
    return;
  }

  if(!writePoints()) {
    return;
  }

  // remember info about last card
  memset(lastUIDBytes, 0, MAX_UID_SIZE);
  memcpy(lastUIDBytes, mfrc522.uid.uidByte, mfrc522.uid.size);
  lastUIDLength = mfrc522.uid.size;
}

void setup() {  
	display.init();
  display.flipScreenVertically();
  display.setColor(WHITE);
  
  SPI.begin();
  delay(1000);

  initCardReader();
  connectToWiFi();
}

void loop() {
  writePointsIfCardIsPresent();
}
