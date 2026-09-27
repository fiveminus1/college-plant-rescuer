import { CircleCheck, Flower2, Sprout, TriangleAlert, Wifi } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bleService } from '../../ble/BLEService';
import { usePlants } from '../../context/PlantsContext';
import { useStreaks } from '@/context/StreaksContext';
import { Subscription } from 'react-native-ble-plx';
import { PlantBackground } from '@/components/PlantBackground';
import { getPlantTypeConfig } from '@/constants/plants';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const { selectedPlant, updateMoisture } = usePlants();
  const { recordWatering, hasWateredToday } = useStreaks();
  const hasMoistureReading = selectedPlant?.moisture !== null && selectedPlant?.moisture !== undefined;
  const moisture = selectedPlant?.moisture ?? 0;
  const moistureRange = selectedPlant
    ? getPlantTypeConfig(selectedPlant.type)
    : null;

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
  }, [updateMoisture]);

  useEffect(() => {
    if(!selectedPlant) return;

    const alreadyWatered = hasWateredToday(selectedPlant.id);

    if (
      moistureRange &&
      hasMoistureReading &&
      moisture >= moistureRange.maxMoisture &&
      !alreadyWatered &&
      !hasRecordedTodayRef.current
    ) {
      recordWatering(selectedPlant.id);
      hasRecordedTodayRef.current = true;
    }

    if(!alreadyWatered)
      hasRecordedTodayRef.current = false;
  }, [hasMoistureReading, moisture, moistureRange, selectedPlant, recordWatering, hasWateredToday]);

  if(!selectedPlant){
    return (
      <PlantBackground>
        <SafeAreaView style={styles.container}>
          <Text style={{ color: 'red' }}>No plant selected</Text>
        </SafeAreaView>
      </PlantBackground>
    );
  }
  

  return (
    <PlantBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.plantName}>{selectedPlant.name}</Text>
            <Text style={styles.plantType}>{selectedPlant.type}</Text>
            <View style={[
              styles.statusRow,
            ]}>
              {!hasMoistureReading ? (
                <Wifi size={15} color={Colors.textSecondary} />
              ) : moisture < moistureRange!.minMoisture ? (
                <TriangleAlert size={15} color={Colors.accent} />
              ) : (
                <CircleCheck size={15} color={Colors.primary} />
              )}
              <Text style={[
                styles.statusText,
                hasMoistureReading && moisture < moistureRange!.minMoisture && styles.statusTextWarning,
              ]}>
                {!hasMoistureReading
                  ? 'Waiting'
                  : moisture < moistureRange!.minMoisture
                    ? 'Needs water'
                    : 'In range'}
              </Text>
            </View>
          </View>

          <View style={styles.plantStage}>
            {selectedPlant.type === 'Cactus' ? (
              <Sprout size={150} color={Colors.primary} strokeWidth={1.5} />
            ) : (
              <Flower2 size={150} color={Colors.primary} strokeWidth={1.5} />
            )}
          </View>

          <View style={styles.moistureCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>Moisture</Text>
                <Text style={styles.moistureValue}>
                  {hasMoistureReading ? `${moisture}%` : '--'}
                </Text>
              </View>
              <View style={styles.targetCopy}>
                <Text style={styles.cardLabel}>Target range</Text>
                <Text style={styles.targetValue}>
                  {moistureRange!.minMoisture}% - {moistureRange!.maxMoisture}%
                </Text>
              </View>
            </View>

            <Progress.Bar
              progress={hasMoistureReading ? moisture / 100 : 0}
              width={null}
              height={10}
              borderRadius={5}
              borderWidth={0}
              color={
                !hasMoistureReading
                  ? Colors.border
                  : moisture < moistureRange!.minMoisture
                    ? Colors.accent
                    : Colors.primary
              }
              unfilledColor={Colors.border}
            />

            <View style={styles.cardFooter}>
              <Text style={styles.helperText}>
                {!hasMoistureReading
                  ? 'Waiting for the sensor to report'
                  : moisture < moistureRange!.minMoisture
                    ? 'Water soon to keep your plant thriving'
                    : 'Your plant is comfortable right now'}
              </Text>
              {hasWateredToday(selectedPlant.id) && (
                <Text style={styles.wateredText}>Watered today</Text>
              )}
            </View>
          </View>
        </View>

      </SafeAreaView>
    </PlantBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  heading: {
    paddingTop: 8,
  },
  plantName: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: Colors.text,
  },
  plantType: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusTextWarning: {
    color: Colors.accent,
  },
  plantStage: {
    flex: 1,
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moistureCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  moistureValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: Colors.text,
  },
  targetCopy: {
    alignItems: 'flex-end',
  },
  targetValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  wateredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#438A51',
  },
})