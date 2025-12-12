import { PlantStreakCard } from "@/components/PlantStreakCard";
import { Colors } from "@/constants/theme";
import { usePlants } from "@/context/PlantsContext";
import { useStreaks } from "@/context/StreaksContext";
import { useUser } from "@/context/UserContext";
import { getLongestStreak } from "@/helpers/streaks";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen(){
    const { user } = useUser();
    const { getAllStreaks, hasWateredToday } = useStreaks();

    const { plants } = usePlants();

    const allStreaks = getAllStreaks();

    const longestStreak = getLongestStreak(allStreaks);
    const plantWithLongest = plants.find(p => p.id === longestStreak.plantId);


    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.userName}>{user?.name || "Placeholder Name"}</Text>
                </View>

                {longestStreak && longestStreak.longestStreak > 0 ? (
                    <View style={styles.bestPlantSection}>
                        <Text style={styles.sectionTitle}>Best Performing Plant</Text>
                        <PlantStreakCard
                            plantName={plantWithLongest!.name}
                            plantType={plantWithLongest!.type}
                            currentStreak={longestStreak.currentStreak}
                            longestStreak={longestStreak.longestStreak}
                            totalWaterings={longestStreak.totalWaterings}
                            lastWatered={longestStreak.lastWatered}
                            wateredToday={hasWateredToday(plantWithLongest!.id)} 
                            showWaterButton={false}
                        />
                    </View>
                ): (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Start watering your plants to build streaks!
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.background,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bestPlantSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
