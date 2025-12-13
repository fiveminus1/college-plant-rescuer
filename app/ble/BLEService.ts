import { BleManager, Device } from "react-native-ble-plx";

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const MOISTURE_UUID = "12345678-1234-1234-1234-1234567890ac";

const deviceName = "ESP32-MoistureSensor"

class BLEService {
  manager: BleManager;
  device: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  } 

  async scanForDevice(onFound: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (err, scannedDevice) => {
      if(err) return console.error(err);

      if(scannedDevice?.name === deviceName){
        this.manager.stopDeviceScan();
        onFound(scannedDevice);
      }
    });

    setTimeout(() => this.manager.stopDeviceScan(), 10000);
  }

  async connect(device: Device){
    this.device = await device.connect();
    await this.device.discoverAllServicesAndCharacteristics();
    return this.device;
  }

  subscribeToMoisture(callback: (percentage: number) => void) {
    if(!this.device)
      return;

    return this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      MOISTURE_UUID,
      (error, characteristic) => {
        if(error) {
          console.log("Subscription error:", error);
          return;
        }

        if(!characteristic || !characteristic.value){
          console.log("Null characteristic or empty value");
          return;
        }

        const decoded = atob(characteristic.value || "");
        const percent = parseInt(decoded, 10);

        if(!isNaN(percent)){
          callback(percent);
        }
      }
    );
  }

  destroy(){
    this.manager.destroy();
  }


}

export const bleService = new BLEService(); 