import { Flower2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bleService } from '../../ble/BLEService';
import { usePlants } from '../../context/PlantsContext';


export default function HomeScreen() {
  const { selectedPlant, updateMoisture } = usePlants();

  const moisture = selectedPlant?.moisture ?? 0;
  // const [connected, setConnected] = useState(false);

  useEffect(() => {
    if(!selectedPlant) return;

    bleService.scanForDevice(async (device) => {
      await bleService.connect(device);

      bleService.subscribeToMoisture((percent) => {
        updateMoisture(selectedPlant.id, percent);
      });
    });

    return () => bleService.destroy();
  }, [selectedPlant, updateMoisture, selectedPlant?.id]);

  if(!selectedPlant){
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red' }}>No plant selected</Text>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        {selectedPlant.name}
      </Text>

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