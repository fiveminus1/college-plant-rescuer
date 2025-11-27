import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flower2 } from 'lucide-react-native';
import * as Progress from 'react-native-progress';


interface MoistureData {
  raw: number;
  percent: number;
}

const API_URL = 'https://mocki.io/v1/bbddd701-942d-4a96-a1b6-178e1f759f21';

export default function HomeScreen() {
  const [moistureValue, setMoistureValue] = useState<number>(0);
  const [moisturePercent, setMoisturePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
      
      <Progress.Bar progress={moisturePercent / 100} width={200}/>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 30 }}>
        Current moisture data: {moistureValue} 
      </Text>

      
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})