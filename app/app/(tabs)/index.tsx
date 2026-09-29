import { PlantBackground } from '@/components/PlantBackground';
import { Colors } from '@/constants/theme';
import { useStreaks } from '@/context/StreaksContext';
import * as ImagePicker from 'expo-image-picker';
import { CircleCheck, ImagePlus, TriangleAlert } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlants } from '../../context/PlantsContext';
import { getPlantVerdict, PlantVerdict } from '../../helpers/verdict';
import { useBLESensor } from '../../hooks/useBLESensor';

function formatAge(timestamp: number | null) {
  if (!timestamp) return 'Never';
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function HomeScreen() {
  const { selectedPlant, updateMoisture, updateLastWatered, addPlantImage } = usePlants();
  const { recordWatering } = useStreaks();
  const hasMoistureReading = selectedPlant?.moisture !== null && selectedPlant?.moisture !== undefined;
  const moisture = selectedPlant?.moisture ?? 0;
  const moistureRange = selectedPlant ? { minMoisture: selectedPlant.thirsty, maxMoisture: selectedPlant.watered } : null;
  const [connectionNoticeVisible, setConnectionNoticeVisible] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [previousVerdict, setPreviousVerdict] = useState<PlantVerdict | undefined>();

  const images = selectedPlant?.images ?? [];
  const hasImages = images.length > 0;

  const choosePlantPhoto = async () => {
    if (!selectedPlant) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await addPlantImage(selectedPlant.id, result.assets[0].uri);
    }
  };

  const saveReading = useCallback((percent: number) => {
    if (selectedPlant) {
      setPreviousVerdict(getPlantVerdict({
        pct: percent,
        thirsty: selectedPlant.thirsty,
        watered: selectedPlant.watered,
        lastWatered: selectedPlant.lastWatered,
        intervalDays: selectedPlant.intervalDays,
        previousVerdict,
      }));
      updateMoisture(selectedPlant.id, percent);
    }
  }, [previousVerdict, selectedPlant, updateMoisture]);

  const saveConfirmedWatering = useCallback(() => {
    if (!selectedPlant) return;
    const timestamp = Date.now();
    setPreviousVerdict('Just watered');
    updateLastWatered(selectedPlant.id, timestamp);
    recordWatering(selectedPlant.id);
  }, [recordWatering, selectedPlant, updateLastWatered]);

  const { status, error, warmingUp } = useBLESensor({
    plant: selectedPlant,
    onReading: saveReading,
    onWaterConfirmed: saveConfirmedWatering,
  });

  const verdict = hasMoistureReading && moistureRange
    ? getPlantVerdict({
        pct: moisture,
        thirsty: moistureRange.minMoisture,
        watered: moistureRange.maxMoisture,
        lastWatered: selectedPlant.lastWatered,
        intervalDays: selectedPlant.intervalDays,
        previousVerdict,
      })
    : null;

  const handleWatered = () => saveConfirmedWatering();

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
                {verdict === 'Water now' ? (
                  <TriangleAlert size={15} color={Colors.accent} />
                ) : (
                  <CircleCheck size={15} color={Colors.primary} />
                )}
                <Text style={[
                  styles.statusText,
                  moisture < moistureRange!.minMoisture && styles.statusTextWarning,
                ]}>
                  {warmingUp ? 'Reading...' : verdict ?? 'Reading...'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.plantStage}>
            <View style={styles.photoControls}>
              {hasImages ? (
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoCarousel}
                  keyExtractor={(item, index) => `${item.uri}-${index}`}
                  onMomentumScrollEnd={(event) => {
                    setActivePhotoIndex(Math.round(event.nativeEvent.contentOffset.x / 240));
                  }}
                  renderItem={({ item }) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="View plant photo"
                      onPress={choosePlantPhoto}
                      style={styles.photoSlide}
                    >
                      <Image source={{ uri: item.uri }} style={styles.plantImage} />
                      <Text style={styles.photoDate}>
                        {new Date(item.addedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </Pressable>
                  )}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add plant photo"
                  onPress={choosePlantPhoto}
                  style={styles.photoButton}
                >
                  <View style={styles.photoPlaceholder}>
                    <ImagePlus size={54} color={Colors.primary} strokeWidth={1.5} />
                    <Text style={styles.photoPlaceholderText}>Add a photo</Text>
                  </View>
                </Pressable>
              )}
              {hasImages && images.length > 1 && (
                <View style={styles.photoDots} accessibilityLabel={`Photo ${activePhotoIndex + 1} of ${images.length}`}>
                  {images.map((image, index) => (
                    <View
                      key={`${image.uri}-dot-${index}`}
                      style={[styles.photoDot, index === activePhotoIndex && styles.photoDotActive]}
                    />
                  ))}
                </View>
              )}
              {hasImages && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add another plant photo"
                  onPress={choosePlantPhoto}
                  style={styles.changePhotoButton}
                >
                  <ImagePlus size={15} color={Colors.primary} />
                  <Text style={styles.changePhotoText}>Add photo</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.moistureCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>Moisture</Text>
                <Text style={styles.moistureValue}>
                  {warmingUp ? 'Reading...' : hasMoistureReading ? `${moisture}%` : '--'}
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
              progress={hasMoistureReading ? Math.max(0, Math.min(1, (moisture - selectedPlant.thirsty) / Math.max(1, selectedPlant.watered - selectedPlant.thirsty))) : 0}
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
                {status === 'connected' ? `Live sensor${verdict ? `: ${verdict}` : ''}` : `${status === 'disconnected' ? 'Disconnected' : 'Connecting'} - last reading ${formatAge(selectedPlant.lastReadingAt)}`}
              </Text>
              <Text style={styles.wateredText}>Last watered: {formatAge(selectedPlant.lastWatered)}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={handleWatered} style={styles.waterButton}>
              <Text style={styles.waterButtonText}>I watered</Text>
            </Pressable>
          </View>
        </View>

        <Snackbar
          visible={(!hasMoistureReading || !!error) && connectionNoticeVisible}
          onDismiss={() => setConnectionNoticeVisible(false)}
          duration={0}
          action={{
            label: 'Dismiss',
            onPress: () => setConnectionNoticeVisible(false),
          }}
        >
          {error ?? 'Waiting for Bluetooth connection to sensor...'}
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
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
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
  photoCarousel: {
    width: 240,
    height: 272,
  },
  photoSlide: {
    width: 240,
    height: 272,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDate: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
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
    marginTop: 18,
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
  photoDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  photoDotActive: {
    width: 16,
    backgroundColor: Colors.primary,
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
  waterButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  waterButtonText: {
    fontWeight: '700',
    color: Colors.text,
  },
})