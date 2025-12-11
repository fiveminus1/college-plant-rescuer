import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { usePlants } from "../context/PlantsContext";

const PlantSelector = () => {
  const { plants, selectPlant } = usePlants();
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 30 }}>
        Select Plant
      </Text>

      {plants.map(plant => (
        <TouchableOpacity
          key={plant.id}
          style={{
            padding: 20,
            backgroundColor: "#eee",
            borderRadius: 12,
            marginBottom: 15,
          }}
          onPress={() => {
            selectPlant(plant.id);
            router.back();
          }}
        >
          <Text style={{ fontSize: 20 }}>{plant.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PlantSelector;