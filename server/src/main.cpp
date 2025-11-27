#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>

#define SENSOR_PIN 36

const char* SSID = "Velocity Wi-Fi";
const char* PASSWORD = "nrurnzni";

const int dryCal = 3500;
const int wetCal = 1400;


AsyncWebServer server(80);

void setup(){
    Serial.begin(9600);
    analogSetAttenuation(ADC_11db);

    WiFi.begin(SSID, PASSWORD);
    while(WiFi.status() != WL_CONNECTED){
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    server.on("/moisture", HTTP_GET, [](AsyncWebServerRequest *request){
        int raw = analogRead(SENSOR_PIN);
        int percent = map(raw, dryCal, wetCal, 0, 100);
        percent = constrain(percent, 0, 100);

        String json = "{";
        json += "\"raw\":" + String(raw) + ",";
        json += "\"percent\":" + String(percent);
        json += "}";

        request->send(200, "application/json", json);
    });

    server.begin();
    Serial.println("Server started!");


}

void loop(){
    delay(500);
}