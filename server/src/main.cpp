#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <string>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define SENSOR_PIN 36
#define LED_PIN 2

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define MOISTURE_UUID "12345678-1234-1234-1234-1234567890ac"
#define LED_UUID "12345678-1234-1234-1234-1234567890ad"

// define SSID and password here, deleted for commits/submission


String iothubName = "collegeplantrescuer";
String deviceName = "esp32";
String url = "https://" + iothubName + ".azure-devices.net/devices/" +
deviceName + "/messages/events?api-version=2021-04-12";


const int dryCal = 3500;
const int wetCal = 1400;

BLECharacteristic *moistureChar;
BLECharacteristic *ledChar;

bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServiceCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer){
    deviceConnected = true;
  }
  void onDisconnect(BLEServer* pServer){
    deviceConnected = false;
  }
};

class LEDCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) {
    std::string value = characteristic->getValue();
    if(!value.length()) return;
    if(value == "1"){
      digitalWrite(LED_PIN, HIGH);
    } else if (value == "0"){
      digitalWrite(LED_PIN, LOW);
    }
  }
};


void setup(){
    Serial.begin(9600);
    analogSetAttenuation(ADC_11db);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    // establish BLE
    BLEDevice::init("ESP32-MoistureSensor");
    BLEServer *server = BLEDevice::createServer();
    server->setCallbacks(new MyServiceCallbacks());

    BLEService *service = server->createService(SERVICE_UUID);

    moistureChar = service->createCharacteristic(
      MOISTURE_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_NOTIFY
    );
    moistureChar->addDescriptor(new BLE2902());

    ledChar = service->createCharacteristic(
      LED_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE 
    );
    ledChar->setCallbacks(new LEDCallbacks());
    ledChar->setValue("0");

    service->start();

    BLEAdvertising *advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(SERVICE_UUID);
    advertising->setScanResponse(true);
    server->getAdvertising()->start();

    Serial.println("Moisture Sensor running on BLE");

    // establish Wi-Fi
    WiFi.mode(WIFI_STA);
    delay(1000);
    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
      Serial.print(WiFi.status());
    }

    Serial.println("WiFi connected");
}

void loop(){
  if(deviceConnected){
    int raw = analogRead(SENSOR_PIN);
    int percent = map(raw, dryCal, wetCal, 0, 100);
    percent = constrain(percent, 0, 100);

    if (percent < 30){
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
    
    char bleBuffer[8];
    sprintf(bleBuffer, "%d", percent);
    moistureChar->setValue(bleBuffer);
    moistureChar->notify();

    Serial.print("Moisture %: ");
    Serial.println(percent);

    ArduinoJson::JsonDocument doc;
    doc["rawMoisture"] = raw;
    doc["percent"] = percent;

    char moistureBuffer[256];
    serializeJson(doc, moistureBuffer, sizeof(moistureBuffer));
    
    WiFiClientSecure client;
    client.setCACert(root_ca);

    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", SAS_TOKEN);
    int httpCode = http.POST(moistureBuffer);

    if (httpCode == 204) {
    Serial.println("Moisture sent: " + String(moistureBuffer));
    } else {
    Serial.println("Failed to send moisture. HTTP code: " + String(httpCode));
    }
    http.end();
  }

  if(!deviceConnected && oldDeviceConnected){
    delay(500);
    BLEDevice::startAdvertising();
  }

  oldDeviceConnected = deviceConnected;
  delay(5000); // @future todo: probably adjust this
}