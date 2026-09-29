import { PlantBackground } from '@/components/PlantBackground';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantsContext';
import { useRouter } from 'expo-router';
import { Check, Pencil, Plus, Sprout } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlantsScreen() {
  const router = useRouter();
  const { plants, selectedPlant, selectPlant } = usePlants();

  return (
    <PlantBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <View>
              <Text style={styles.title}>Your plants</Text>
              <Text style={styles.subtitle}>Choose the plant connected to the sensor.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/plant-setup')} style={styles.iconButton}>
              <Plus size={20} color={Colors.text} />
            </Pressable>
          </View>
          {plants.map((plant) => {
            const selected = plant.id === selectedPlant?.id;
            return (
              <Pressable key={plant.id} onPress={() => { selectPlant(plant.id); router.back(); }} style={[styles.row, selected && styles.rowSelected]}>
                <Sprout size={22} color={selected ? Colors.primary : Colors.icon} />
                <View style={styles.rowCopy}>
                  <Text style={styles.name}>{plant.name}</Text>
                  <Text style={styles.detail}>{plant.type} · {plant.thirsty}% - {plant.watered}%</Text>
                </View>
                {selected && <Check size={20} color={Colors.primary} />}
                <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${plant.name}`} onPress={() => router.push({ pathname: '/plant-setup', params: { id: plant.id } })}>
                  <Pencil size={18} color={Colors.icon} />
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </PlantBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 12 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text },
  subtitle: { marginTop: 5, color: Colors.textSecondary },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: Colors.cardBackground, borderWidth: 1, borderColor: Colors.border, borderRadius: 8 },
  rowSelected: { borderColor: Colors.primary },
  rowCopy: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: Colors.text },
  detail: { marginTop: 4, color: Colors.textSecondary },
});