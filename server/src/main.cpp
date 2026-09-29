#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <Preferences.h>
#include <string>

#define SENSOR_PIN 36
#define LED_PIN 2

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define MOISTURE_UUID "12345678-1234-1234-1234-1234567890ac"
#define LED_UUID "12345678-1234-1234-1234-1234567890ad"
#define THRESHOLD_UUID "12345678-1234-1234-1234-1234567890ae"

const int dryCal = 3279;
const int wetCal = 1104;
int ledThreshold = 32;

BLECharacteristic *moistureChar;
BLECharacteristic *ledChar;
BLECharacteristic *thresholdChar;
Preferences preferences;

bool deviceConnected = false;
bool ledState = false;
float smoothed = 0;
float readings[5];
int readingIndex = 0;
int readingCount = 0;
unsigned long lastSample = 0;

int medianReading() {
  int samples[10];
  for (int i = 0; i < 10; i++) {
    samples[i] = analogRead(SENSOR_PIN);
  }

  for (int i = 1; i < 10; i++) {
    int sample = samples[i];
    int j = i - 1;
    while (j >= 0 && samples[j] > sample) {
      samples[j + 1] = samples[j];
      j--;
    }
    samples[j + 1] = sample;
  }
  return (samples[4] + samples[5]) / 2;
}

void updateLed() {
  int offThreshold = min(ledThreshold + 5, 100);
  bool nextState = ledState;
  if (!ledState && smoothed < ledThreshold) {
    nextState = true;
  } else if (ledState && smoothed > offThreshold) {
    nextState = false;
  }

  if (nextState != ledState) {
    ledState = nextState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    ledChar->setValue(ledState ? "1" : "0");
    if (deviceConnected) {
      ledChar->notify();
    }
    Serial.printf("LED: %s\n", ledState ? "ON" : "OFF");
  }
}

void takeSample() {
  int raw = medianReading();
  float percent = constrain((dryCal - raw) * 100.0f / (dryCal - wetCal), 0.0f, 100.0f);
  readings[readingIndex] = percent;
  readingIndex = (readingIndex + 1) % 5;
  if (readingCount < 5) {
    readingCount++;
  }

  smoothed = 0;
  for (int i = 0; i < readingCount; i++) {
    smoothed += readings[i];
  }
  smoothed /= readingCount;

  char moistureBuffer[8];
  snprintf(moistureBuffer, sizeof(moistureBuffer), "%d", (int)(smoothed + 0.5f));
  moistureChar->setValue(moistureBuffer);
  if (readingCount == 5) {
    updateLed();
  }
  Serial.printf("raw: %d, percent: %.2f, smoothed: %.2f\n", raw, percent, smoothed);
}

class MyServiceCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer){
    deviceConnected = true;
    Serial.println("BLE connected");
  }
  void onDisconnect(BLEServer* pServer){
    deviceConnected = false;
    Serial.println("BLE disconnected");
    BLEDevice::startAdvertising();
  }
};

class ThresholdCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
    String value = characteristic->getValue();
#else
    std::string rawValue = characteristic->getValue();
    String value = String(rawValue.c_str());
#endif
    bool valid = value.length() >= 1 && value.length() <= 3;
    for (unsigned int i = 0; valid && i < value.length(); i++) {
      valid = isDigit(value[i]);
    }

    int newThreshold = valid ? value.toInt() : -1;
    if (!valid || newThreshold < 0 || newThreshold > 100) {
      Serial.println("Rejected threshold write");
      return;
    }

    Serial.printf("Accepted threshold write: %d\n", newThreshold);
    if (newThreshold != ledThreshold) {
      ledThreshold = newThreshold;
      preferences.putUChar("threshold", ledThreshold);
    }
    thresholdChar->setValue(String(ledThreshold).c_str());
    updateLed();
  }
};


void setup(){
    Serial.begin(9600);
    analogSetAttenuation(ADC_11db);

    pinMode(LED_PIN, OUTPUT);
    preferences.begin("plant-rescuer", false);
    ledThreshold = preferences.getUChar("threshold", 32);
    if (ledThreshold > 100) {
      ledThreshold = 32;
    }
    Serial.printf("Loaded threshold: %d\n", ledThreshold);

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
      BLECharacteristic::PROPERTY_NOTIFY
    );
    ledChar->addDescriptor(new BLE2902());
    ledChar->setValue("0");

    thresholdChar = service->createCharacteristic(
      THRESHOLD_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE
    );
    thresholdChar->setCallbacks(new ThresholdCallbacks());
    thresholdChar->setValue(String(ledThreshold).c_str());

    service->start();

    BLEAdvertising *advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(SERVICE_UUID);
    advertising->setScanResponse(true);
    server->getAdvertising()->start();

    Serial.println("Moisture Sensor running on BLE");

    for (int i = 0; i < 5; i++) {
      takeSample();
    }
}

void loop(){
  unsigned long interval = deviceConnected ? 5000UL : 30000UL;
  if (millis() - lastSample >= interval) {
    lastSample = millis();
    takeSample();
    if (deviceConnected) {
      moistureChar->notify();
    }
  }
}