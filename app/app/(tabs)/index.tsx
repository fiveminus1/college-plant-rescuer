import { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flower2 } from 'lucide-react-native';
import * as Progress from 'react-native-progress';


interface MoistureData {
  raw: number;
  percent: number;
}

const API_URL = 'http://10.5.170.54/moisture';

export default function HomeScreen() {
  const [moistureValue, setMoistureValue] = useState<number>(0);
  const [moisturePercent, setMoisturePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMoistureData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json() as MoistureData;
      setMoistureValue(data.raw);
      setMoisturePercent(data.percent);
    } catch (e) {
      if (e instanceof Error){
        setError(e.message);
      }
      else{
        throw e;
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMoistureData();
  }, []);

  if(loading){
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if(error){
    return (
      <SafeAreaView>
        <Text>Error: {error}</Text>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <Flower2 size={150} style={{ marginBottom: 20 }}/>
      
      <Progress.Bar progress={moisturePercent / 100} width={200} color={
        moisturePercent < 30 ? 'red' : moisturePercent > 50 ? '#019CE0' : 'orange'
      }/>

      {moisturePercent < 30 && (
        <Text style={{ color: 'red', fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>
          Water soon
        </Text>
      )}

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 30 }}>
        Current moisture data: {moistureValue} 
      </Text>

      <TouchableOpacity style={styles.button} onPress={fetchMoistureData}>
        <Text style={styles.buttonText}>Fetch moisture data</Text>

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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})