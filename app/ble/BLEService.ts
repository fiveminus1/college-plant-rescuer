import { NativeModules } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

export const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
export const MOISTURE_UUID = "12345678-1234-1234-1234-1234567890ac";
export const LED_UUID = "12345678-1234-1234-1234-1234567890ad";
export const THRESHOLD_UUID = "12345678-1234-1234-1234-1234567890ae";

const deviceName = "ESP32-MoistureSensor";

function decodeAscii(value: string | null): string {
  return value ? atob(value) : "";
}

function encodeAscii(value: string): string {
  return btoa(value);
}

function parsePercent(value: string | null): number | null {
  const parsed = Number(decodeAscii(value));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

class BLEService {
  manager: BleManager | null;
  device: Device | null = null;

  constructor() {
    this.manager = NativeModules.BlePlx ? new BleManager() : null;
  } 

  async scanForDevice(onFound?: (device: Device) => void): Promise<Device> {
    if (!this.manager) throw new Error("Bluetooth is unavailable");

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager?.stopDeviceScan();
        reject(new Error("Sensor not found"));
      }, 10000);

      this.manager?.startDeviceScan(null, null, (err, scannedDevice) => {
        if (err) {
          clearTimeout(timeout);
          this.manager?.stopDeviceScan();
          reject(err);
          return;
        }

        if (scannedDevice?.name === deviceName || scannedDevice?.localName === deviceName) {
          clearTimeout(timeout);
          this.manager?.stopDeviceScan();
          onFound?.(scannedDevice);
          resolve(scannedDevice);
        }
      });
    });
  }

  async connect(device: Device){
    if (!this.manager) return null;

    this.device = await device.connect();
    await this.device.discoverAllServicesAndCharacteristics();
    return this.device;
  }

  onDisconnected(callback: (error: Error | null, device: Device | null) => void): Subscription | null {
    return this.device?.onDisconnected(callback) ?? null;
  }

  async readMoisture(): Promise<number | null> {
    if (!this.device) return null;
    const characteristic = await this.device.readCharacteristicForService(SERVICE_UUID, MOISTURE_UUID);
    return parsePercent(characteristic.value);
  }

  async readLedState(): Promise<boolean | null> {
    if (!this.device) return null;
    const characteristic = await this.device.readCharacteristicForService(SERVICE_UUID, LED_UUID);
    const value = decodeAscii(characteristic.value);
    return value === "1" ? true : value === "0" ? false : null;
  }

  async readThreshold(): Promise<number | null> {
    if (!this.device) return null;
    const characteristic = await this.device.readCharacteristicForService(SERVICE_UUID, THRESHOLD_UUID);
    return parsePercent(characteristic.value);
  }

  async writeThreshold(value: number): Promise<number | null> {
    if (!this.device) return null;
    await this.device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      THRESHOLD_UUID,
      encodeAscii(String(value)),
    );
    return this.readThreshold();
  }

  subscribeToMoisture(callback: (percentage: number) => void) {
    if (!this.device || !this.manager) return null;

    return this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      MOISTURE_UUID,
      (error, characteristic) => {
        if (error) {
          console.warn("Moisture subscription failed", error.message);
          return;
        }

        const percent = parsePercent(characteristic?.value ?? null);
        if (percent !== null) {
          callback(percent);
        }
      }
    );
  }

  subscribeToLed(callback: (isOn: boolean) => void) {
    if (!this.device || !this.manager) return null;

    return this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      LED_UUID,
      (error, characteristic) => {
        if (error) {
          console.warn("LED subscription failed", error.message);
          return;
        }

        const value = decodeAscii(characteristic?.value ?? null);
        if (value === "0" || value === "1") callback(value === "1");
      },
    );
  }

  destroy(){
    this.manager?.stopDeviceScan();
    this.manager?.destroy();
    this.manager = NativeModules.BlePlx ? new BleManager() : null;
  }


}

export const bleService = new BLEService(); 