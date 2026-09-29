import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Subscription } from 'react-native-ble-plx';
import { bleService } from '@/ble/BLEService';
import { Plant } from '@/context/PlantsContext';

export type BLEStatus = 'idle' | 'scanning' | 'connecting' | 'warming' | 'connected' | 'disconnected' | 'error';

interface UseBLESensorOptions {
  plant: Plant | null;
  onReading: (value: number) => void;
  onWaterConfirmed: () => void;
}

export function useBLESensor({ plant, onReading, onWaterConfirmed }: UseBLESensorOptions) {
  const [status, setStatus] = useState<BLEStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ledOn, setLedOn] = useState<boolean | null>(null);
  const [warmingUp, setWarmingUp] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(() => undefined);
  const mounted = useRef(true);
  const onReadingRef = useRef(onReading);
  const onWaterConfirmedRef = useRef(onWaterConfirmed);
  const plantRef = useRef(plant);

  useEffect(() => {
    onReadingRef.current = onReading;
    onWaterConfirmedRef.current = onWaterConfirmed;
    plantRef.current = plant;
  }, [onReading, onWaterConfirmed, plant]);

  const connect = useCallback(async () => {
    const currentPlant = plantRef.current;
    if (!currentPlant || !mounted.current) return;

    let moistureSubscription: Subscription | null = null;
    let ledSubscription: Subscription | null = null;
    let disconnectSubscription: Subscription | null = null;

    try {
      setError(null);
      setStatus('scanning');
      const device = await bleService.scanForDevice();
      if (!mounted.current) return;
      setStatus('connecting');
      await bleService.connect(device);

      const threshold = Math.round(currentPlant.thirsty + 0.15 * (currentPlant.watered - currentPlant.thirsty));
      const currentThreshold = await bleService.readThreshold();
      if (currentThreshold !== threshold) {
        const confirmedThreshold = await bleService.writeThreshold(threshold);
        if (confirmedThreshold !== threshold) throw new Error('Sensor rejected the threshold');
      }

      const initialMoisture = await bleService.readMoisture();
      setLedOn(await bleService.readLedState());
      if (initialMoisture !== null) {
        onReadingRef.current(initialMoisture);
        if (currentPlant.moisture !== null && initialMoisture - currentPlant.moisture >= 15) {
          Alert.alert('Did you water this plant?', undefined, [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => onWaterConfirmedRef.current() },
          ]);
        }
      }

      if (!mounted.current) return;
      setWarmingUp(true);
      setStatus('warming');
      const warmupTimer = setTimeout(() => {
        if (mounted.current) {
          setWarmingUp(false);
          setStatus('connected');
        }
      }, 25000);

      moistureSubscription = bleService.subscribeToMoisture((value) => onReadingRef.current(value));
      ledSubscription = bleService.subscribeToLed(setLedOn);
      disconnectSubscription = bleService.onDisconnected(() => {
        clearTimeout(warmupTimer);
        moistureSubscription?.remove();
        ledSubscription?.remove();
        disconnectSubscription?.remove();
        if (mounted.current) {
          setWarmingUp(false);
          setStatus('disconnected');
          reconnectTimer.current = setTimeout(connectRef.current, 2000);
        }
      });
    } catch (connectionError) {
      if (!mounted.current) return;
      const message = connectionError instanceof Error ? connectionError.message : 'Could not connect to sensor';
      setError(message.includes('permission') ? 'Bluetooth permission denied' : message);
      setStatus(message === 'Sensor not found' ? 'error' : 'disconnected');
      reconnectTimer.current = setTimeout(connectRef.current, 5000);
    }
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    mounted.current = true;
    const initialConnection = setTimeout(() => void connect(), 0);
    return () => {
      mounted.current = false;
      clearTimeout(initialConnection);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      bleService.destroy();
    };
  }, [connect, plant?.id, plant?.thirsty, plant?.watered]);

  return { status, error, ledOn, warmingUp };
}