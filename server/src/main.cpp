#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SENSOR_PIN 36
#define LED_PIN 2

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define MOISTURE_UUID "12345678-1234-1234-1234-1234567890ac"
#define LED_UUID "12345678-1234-1234-1234-1234567890ad"

const char* SSID = "SierraSothoes_EXT";
const char* PASSWORD = "coxuckers";

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

    BLEDevice::init("ESP32-MoistureSensor");
    BLEServer *server = BLEDevice::createServer();
    server->setCallbacks(new MyServiceCallbacks());

    BLEService *service = server->createService(SERVICE_UUID);

    moistureChar = service->createCharacteristic(
      MOISTURE_UUID,
      BLECharacteristic::PROPERTY_NOTIFY
    );

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
    
    char buffer[8];
    sprintf(buffer, "%d", percent);
    moistureChar->setValue(buffer);
    moistureChar->notify();

    Serial.print("Moisture %: ");
    Serial.println(percent);
  }

  if(!deviceConnected && oldDeviceConnected){
    delay(500);
    BLEDevice::startAdvertising();
  }

  oldDeviceConnected = deviceConnected;
  delay(1000);
}