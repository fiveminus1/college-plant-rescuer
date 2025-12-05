import { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flower2 } from 'lucide-react-native';
import * as Progress from 'react-native-progress';
import { bleService } from '../../ble/BLEService';


export default function HomeScreen() {
  const [moisture, setMoisture] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    bleService.scanForDevice(async (device) => {
      await bleService.connect(device);
      setConnected(true);

      bleService.subscribeToMoisture((percent) => {
        setMoisture(percent);
      });
    });

    return () => bleService.destroy();
  }, []);
  

  return (
    <SafeAreaView style={styles.container}>
      {!connected ? (
        <Text>Connecting...</Text> // @todo: probably loading spinner
      ) : (
        <>
          <Flower2 size={150}/>
           <Progress.Bar 
            progress={moisture / 100} 
            width={200} 
            color={ moisture < 30 ? 'red' : moisture > 50 ? '#019CE0' : 'orange'}
          />
          {(moisture) < 30 && (
            <Text style={{ color: 'red', fontSize: 20, fontWeight: 'bold' }}>
              Water soon
            </Text>
          )}
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 30 }}>
            Moisture: {moisture}% 
          </Text>


          {/** @todo: not sure if we need to keep this? maybe at least move somewhere else */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => bleService.writeLED(moisture < 30 ? "1" : "0")}
          >
            <Text style={styles.buttonText}>Toggle LED</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})