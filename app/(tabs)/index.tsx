import colors from '../constants/colors'; // Adjust the import path if needed
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StopwatchWithLap() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [processes, setProcesses] = useState<Record<string, { id: number; time: number; name: string; note: string }[]>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lapIdRef = useRef(0);
  const [currentProcess, setCurrentProcess] = useState('Default Process');
  const [dataSaved, setDataSaved] = useState(false);
  const [newData, setNewData] = useState(false);
  const database = useSQLiteContext();

  const startStopwatch = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 10);
    }, 10);
  };

  const stopStopwatch = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    // Check if there are unsaved laps
    if (!dataSaved && newData) {
      // Prompt the user to save the data
      alert('You have unsaved data. Please save before resetting.');
      return; // Do not reset if there are unsaved changes
    }

    // Reset the stopwatch only if there are no unsaved changes
    stopStopwatch();
    setTime(0);
    setProcesses({});
    lapIdRef.current = 0;
    setDataSaved(false);
    setNewData(false);
  };

  const recordLap = () => {
    setProcesses(prevProcesses => {
      const updatedLaps = prevProcesses[currentProcess] || [];
      return {
        ...prevProcesses,
        [currentProcess]: [{ id: lapIdRef.current++, time, name: `Lap ${updatedLaps.length + 1}`, note: '' }, ...updatedLaps],
      };
    });
  };

  const renameLap = (process: string, id: number, newName: string) => {
    setProcesses(prevProcesses => {
      return {
        ...prevProcesses,
        [process]: prevProcesses[process].map(lap => (lap.id === id ? { ...lap, name: newName } : lap)),
      };
    });
  };

  const addNoteToLap = (process: string, id: number, newNote: string) => {
    setProcesses(prevProcesses => {
      return {
        ...prevProcesses,
        [process]: prevProcesses[process].map(lap => (lap.id === id ? { ...lap, note: newNote } : lap)),
      };
    });
  };



  const loadData = async () => {
    const result = await database.getFirstAsync<{
      id: number;
      name: string;
      time: string;
      note: string;
    }>(`SELECT * FROM timestudies WHERE id = ?`, [parseInt(id as string)]);
  };

  const handleSave = async () => {
    try {
      const laps = processes[currentProcess];
      if (laps.length === 0) {
        alert('No laps to save.');
        return;
      }

      for (const lap of laps) {
        const { id, time, name, note } = lap;
        await database.runAsync(
          "INSERT INTO timestudies (id, name, time, note) VALUES (?, ?, ?, ?)",
          [id, name, time, note]
        );
      }
      console.log("All laps saved successfully.");
      setDataSaved(true);
      setNewData(false);
      alert('Data saved successfully!');
      router.back(); // Assuming you want to navigate back after saving
    } catch (error) {
      console.error("Error saving laps:", error);
      alert('Failed to save data.');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await database.runAsync(
        `UPDATE timestudies SET name = ?, time = ?, note = ? WHERE id = ?`,
        [name, time, note, parseInt(id as string)]
      );
      console.log("Item updated successfully:", response?.changes!);
      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.timer}>{`${(time / 3600000).toFixed(0)}:${((time / 60000) % 60).toFixed(0)}'${((time / 1000) % 60).toFixed(0)}.${(time % 1000).toFixed(0)}`}</Text>
      <TextInput
        style={styles.processNameInput}
        value={currentProcess}
        onChangeText={setCurrentProcess}
        placeholder="Enter Process Name"
        placeholderTextColor="#ccc"
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={isRunning ? stopStopwatch : startStopwatch} style={styles.button}>
          <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetStopwatch} style={styles.buttonReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recordLap} style={styles.buttonLap}>
          <Text style={styles.buttonText}>Lap</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
      {Object.keys(processes).map(process => (
        <View key={process} style={styles.processSection}>
          <Text style={styles.processTitle}>{process}</Text>
          <FlatList
            data={processes[process]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.lapItem}>
                <Text style={styles.lapId}>{`ID: ${item.id}`}</Text>
                <TextInput
                  style={styles.lapNameInput}
                  value={item.name}
                  onChangeText={(text) => renameLap(process, item.id, text)}
                  placeholder="Enter Process Step"
                  placeholderTextColor="#ccc"
                />
                <Text style={styles.lapTime}>{`${(item.time / 3600000).toFixed(0)}:${((item.time / 60000) % 60).toFixed(0)}'${((item.time / 1000) % 60).toFixed(0)}.${(item.time % 1000).toFixed(0)}`}</Text>
                <TextInput
                  style={styles.lapNoteInput}
                  value={item.note}
                  onChangeText={(text) => addNoteToLap(process, item.id, text)}
                  placeholder="Enter note"
                  placeholderTextColor="#ccc"
                />
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  timer: {
    fontSize: 48,
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  processNameInput: {
    color: colors.textPrimary,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  buttonReset: {
    margin: 10,
    padding: 10,
    backgroundColor: colors.danger,
    borderRadius: 5,
  },
  buttonLap: {
    margin: 10,
    padding: 10,
    backgroundColor: colors.secondary,
    borderRadius: 5,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  processSection: {
    marginBottom: 20,
  },
  processTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  lapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lapBackground,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  lapId: {
    fontSize: 18,
    color: colors.textPrimary,
    marginRight: 10,
  },
  lapNameInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 5,
  },
  lapTime: {
    fontSize: 18,
    color: colors.textPrimary,
    marginHorizontal: 10,
  },
  lapNoteInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 5,
  },
});
