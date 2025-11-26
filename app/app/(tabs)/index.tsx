import { Heading1 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MoistureData {
  rawValue: number;
}

const API_URL = '';

export default function HomeScreen() {
  const [moistureData, setMoistureData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMoistureData = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        const data = await res.json();
        setMoistureData(data);
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
    <SafeAreaView >
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Current moisture data:
      </Text>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
