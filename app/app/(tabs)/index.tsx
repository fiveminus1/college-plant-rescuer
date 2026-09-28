import { PlantBackground } from '@/components/PlantBackground';
import { getPlantTypeConfig } from '@/constants/plants';
import { Colors } from '@/constants/theme';
import { useStreaks } from '@/context/StreaksContext';
import * as ImagePicker from 'expo-image-picker';
import { CircleCheck, ImagePlus, TriangleAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Subscription } from 'react-native-ble-plx';
import { Snackbar } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bleService } from '../../ble/BLEService';
import { usePlants } from '../../context/PlantsContext';

export default function HomeScreen() {
  const { selectedPlant, updateMoisture, updatePlantImage } = usePlants();
  const { recordWatering, hasWateredToday } = useStreaks();
  const hasMoistureReading = selectedPlant?.moisture !== null && selectedPlant?.moisture !== undefined;
  const moisture = selectedPlant?.moisture ?? 0;
  const moistureRange = selectedPlant
    ? getPlantTypeConfig(selectedPlant.type)
    : null;
  const [connectionNoticeVisible, setConnectionNoticeVisible] = useState(true);

  const choosePlantPhoto = async () => {
    if (!selectedPlant) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updatePlantImage(selectedPlant.id, result.assets[0].uri);
    }
  };

  const selectedPlantRef = useRef(selectedPlant);
  const hasRecordedTodayRef = useRef(false);

  useEffect(() => {
    selectedPlantRef.current = selectedPlant;
  }, [selectedPlant]);

  useEffect(() => {
    setConnectionNoticeVisible(true);
  }, [selectedPlant?.id]);

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
            {hasMoistureReading ? (
              <View style={styles.statusRow}>
                {moisture < moistureRange!.minMoisture ? (
                  <TriangleAlert size={15} color={Colors.accent} />
                ) : (
                  <CircleCheck size={15} color={Colors.primary} />
                )}
                <Text style={[
                  styles.statusText,
                  moisture < moistureRange!.minMoisture && styles.statusTextWarning,
                ]}>
                  {moisture < moistureRange!.minMoisture ? 'Needs water' : 'In range'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.plantStage}>
            <View style={styles.photoControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={selectedPlant.imageUri ? 'View plant photo' : 'Add plant photo'}
                onPress={choosePlantPhoto}
                style={styles.photoButton}
              >
                {selectedPlant.imageUri ? (
                  <Image source={{ uri: selectedPlant.imageUri }} style={styles.plantImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <ImagePlus size={54} color={Colors.primary} strokeWidth={1.5} />
                    <Text style={styles.photoPlaceholderText}>Add a photo</Text>
                  </View>
                )}
              </Pressable>
              {selectedPlant.imageUri && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select a different plant photo"
                  onPress={choosePlantPhoto}
                  style={styles.changePhotoButton}
                >
                  <ImagePlus size={15} color={Colors.primary} />
                  <Text style={styles.changePhotoText}>Select photo</Text>
                </Pressable>
              )}
            </View>
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

        <Snackbar
          visible={!hasMoistureReading && connectionNoticeVisible}
          onDismiss={() => setConnectionNoticeVisible(false)}
          duration={Snackbar.DURATION_INDEFINITE}
          action={{
            label: 'Dismiss',
            onPress: () => setConnectionNoticeVisible(false),
          }}
        >
          Waiting for Bluetooth connection to sensor...
        </Snackbar>

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
  photoControls: {
    alignItems: 'center',
  },
  plantImage: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  photoButton: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  photoPlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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