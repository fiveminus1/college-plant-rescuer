import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Menu, Portal, TextInput } from 'react-native-paper';
import { Colors } from '@/constants/theme';
import { PLANT_TYPES, PlantType } from '@/constants/plants';

interface CreatePlantDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (name: string, type: PlantType) => void;
}

export function CreatePlantDialog({
  visible,
  onDismiss,
  onCreate,
}: CreatePlantDialogProps) {
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState<PlantType>('Cactus');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  const closeDialog = () => {
    setTypeMenuVisible(false);
    setPlantName('');
    setPlantType('Cactus');
    onDismiss();
  };

  const handleCreate = () => {
    const trimmedName = plantName.trim();

    if (!trimmedName) return;

    onCreate(trimmedName, plantType);
    closeDialog();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={closeDialog} style={styles.dialog}>
        <Dialog.Title>Create a plant</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Plant name"
            value={plantName}
            onChangeText={setPlantName}
            mode="outlined"
            autoFocus
            style={styles.nameInput}
          />

          <Menu
            visible={typeMenuVisible}
            onDismiss={() => setTypeMenuVisible(false)}
            anchor={
              <Pressable
                accessibilityRole="button"
                onPress={() => setTypeMenuVisible(true)}
                style={styles.select}
              >
                <View>
                  <Text style={styles.selectLabel}>Plant type</Text>
                  <Text style={styles.selectValue}>{PLANT_TYPES[plantType].label}</Text>
                </View>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </Pressable>
            }
          >
            {(Object.keys(PLANT_TYPES) as PlantType[]).map((type) => (
              <Menu.Item
                key={type}
                title={PLANT_TYPES[type].label}
                onPress={() => {
                  setPlantType(type);
                  setTypeMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={closeDialog}>Cancel</Button>
          <Button mode="contained" onPress={handleCreate} disabled={!plantName.trim()}>
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    marginHorizontal: 20,
  },
  nameInput: {
    marginBottom: 16,
  },
  select: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  selectValue: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});