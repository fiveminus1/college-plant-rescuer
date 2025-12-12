import { Flower2 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bleService } from '../../ble/BLEService';
import { usePlants } from '../../context/PlantsContext';
import { useStreaks } from '@/context/StreaksContext';
import { Subscription } from 'react-native-ble-plx';

const MOISTURE_THRESHOLD = 50;

export default function HomeScreen() {
  const { selectedPlant, updateMoisture } = usePlants();
  const { recordWatering, hasWateredToday } = useStreaks();
  const moisture = selectedPlant?.moisture ?? 0;

  const selectedPlantRef = useRef(selectedPlant);
  const hasRecordedTodayRef = useRef(false);

  useEffect(() => {
    selectedPlantRef.current = selectedPlant;
  }, [selectedPlant]);

  useEffect(() => {
    let subscription: Subscription | undefined;

    bleService.scanForDevice(async (device) => {
      await bleService.connect(device);

      subscription = bleService.subscribeToMoisture((percent) => {
        const currentPlantRef = selectedPlantRef.current;
        
        if(currentPlantRef)
          updateMoisture(currentPlantRef.id, percent);
      });
    });

    return () => {
      subscription?.remove?.();
      bleService.destroy();
    };
  }, []);

  useEffect(() => {
    if(!selectedPlant) return;

    const alreadyWatered = hasWateredToday(selectedPlant.id);

    if (
      moisture >= MOISTURE_THRESHOLD &&
      !alreadyWatered &&
      !hasRecordedTodayRef.current
    ) {
      recordWatering(selectedPlant.id);
      hasRecordedTodayRef.current = true;
    }

    if(!alreadyWatered)
      hasRecordedTodayRef.current = false;
  }, [moisture, selectedPlant, recordWatering, hasWateredToday]);

  if(!selectedPlant){
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red' }}>No plant selected</Text>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      {hasWateredToday(selectedPlant.id) && (
        <Text style={{ color: '#4CAF50', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
          ✓ Watered today
        </Text>
      )}
      
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