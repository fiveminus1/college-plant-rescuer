import { Avatar } from "@/components/Avatar";
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
                    <Avatar 
                        name={user?.name || "S"}
                        color={Colors.primary}
                    />
                    <Text style={styles.userName}>{user?.name || "Placeholder Name"}</Text>
                </View>

                {longestStreak && longestStreak.longestStreak > 0 && (
                    <View style={styles.bestPlantSection}>
                        <Text style={styles.sectionTitle}>Most Watered Plant</Text>
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
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 32,
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
});