import { PlantBackground } from '@/components/PlantBackground';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantsContext';
import { useBLESensor } from '@/hooks/useBLESensor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useState } from 'react';

export default function PlantSetupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { plants, addPlant, updatePlant, deletePlant, updateMoisture } = usePlants();
  const plant = id ? plants.find((item) => item.id === id) ?? null : null;
  const [name, setName] = useState(plant?.name ?? '');
  const [interval, setInterval] = useState(plant?.intervalDays?.toString() ?? '');
  const [thirsty, setThirsty] = useState(plant?.thirsty?.toString() ?? '0');
  const [watered, setWatered] = useState(plant?.watered?.toString() ?? '100');
  const { status } = useBLESensor({
    plant,
    onReading: (value) => plant && updateMoisture(plant.id, value),
    onWaterConfirmed: () => undefined,
  });

  const currentValue = plant?.moisture === null || !plant ? 'No live reading' : `${plant.moisture}%`;
  const save = async () => {
    const thirstyValue = Number(thirsty);
    const wateredValue = Number(watered);
    if (!name.trim() || !Number.isInteger(thirstyValue) || !Number.isInteger(wateredValue) || thirstyValue < 0 || wateredValue > 100 || thirstyValue >= wateredValue) return;
    const plantId = plant?.id ?? await addPlant(name.trim(), 'Cactus');
    if (!plantId) return;
    await updatePlant(plantId, {
      name: name.trim(),
      intervalDays: interval ? Number(interval) : null,
      thirsty: thirstyValue,
      watered: wateredValue,
    });
    router.back();
  };

  const remove = () => Alert.alert('Delete plant?', `This removes ${plant?.name ?? name} from the app.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { if (plant) await deletePlant(plant.id); router.replace('/'); } },
  ]);

  return (
    <PlantBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{id ? 'Edit plant' : 'Set up plant'}</Text>
        <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
        <TextInput label="Interval in days (optional)" value={interval} onChangeText={setInterval} keyboardType="numeric" mode="outlined" style={styles.input} />
        <Text style={styles.note}>Calibration values are tied to this device. Re-measure them if the sensor changes.</Text>
        <View style={styles.measureRow}>
          <View style={styles.measureCopy}>
            <Text style={styles.label}>Thirsty</Text>
            <Text style={styles.value}>{thirsty}%</Text>
          </View>
          <Button mode="outlined" onPress={() => plant?.moisture !== null && plant && setThirsty(String(plant.moisture))} disabled={!plant || plant.moisture === null}>Set as thirsty</Button>
        </View>
        <View style={styles.measureRow}>
          <View style={styles.measureCopy}>
            <Text style={styles.label}>Watered</Text>
            <Text style={styles.value}>{watered}%</Text>
          </View>
          <Button mode="outlined" onPress={() => plant?.moisture !== null && plant && setWatered(String(plant.moisture))} disabled={!plant || plant.moisture === null}>Set as watered</Button>
        </View>
        <Text style={styles.sensor}>Sensor: {status} · Current reading: {currentValue}</Text>
        <Button mode="contained" onPress={save}>Save plant</Button>
        <Pressable onPress={remove} style={styles.deleteButton}><Text style={styles.deleteText}>Delete plant</Text></Pressable>
      </ScrollView>
    </PlantBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: Colors.background },
  note: { color: Colors.textSecondary, lineHeight: 20 },
  measureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  measureCopy: { gap: 3 },
  label: { color: Colors.textSecondary },
  value: { fontSize: 20, fontWeight: '700', color: Colors.text },
  sensor: { color: Colors.textSecondary, fontSize: 12 },
  deleteButton: { alignItems: 'center', padding: 12 },
  deleteText: { color: Colors.accent, fontWeight: '700' },
});