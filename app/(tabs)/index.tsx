import colors from '../constants/colors'; 
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StopwatchWithLap() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [processes, setProcesses] = useState<Record<string, {process: string; instance: number; process_step: string; time: number; note: string }[]>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lapIdRef = useRef(0);
  const [currentProcess, setCurrentProcess] = useState('Default Process');
  const [currentStep, setCurrentStep] = useState(''); // Process step input
  const [currentNote, setCurrentNote] = useState(''); // Note input
  const database = useSQLiteContext();

  const startStopwatch = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 10); // time incremented every 10ms
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
    stopStopwatch();
    setTime(0);
    setProcesses({});
    lapIdRef.current = 0;
  };

  const recordLap = () => {
    if (!currentStep) {
      alert('Please enter a process step.');
      return;
    }

    // Ensure instance increments for each process
    const updatedInstance = (processes[currentProcess]?.length ?? 0) + 1;
    
    // Add new lap data
    setProcesses(prevProcesses => {
      const updatedLaps = prevProcesses[currentProcess] || [];
      return {
        ...prevProcesses,
        [currentProcess]: [
          ...updatedLaps,
          {
            process: currentProcess,
            instance: updatedInstance,
            process_step: currentStep,
            time,
            note: currentNote,
          },
        ],
      };
    });

    // Clear step and note inputs after recording lap
    setCurrentStep('');
    setCurrentNote('');
  };

  const handleSave = async () => {
    try {
      const laps = processes[currentProcess];
      if (laps.length === 0) {
        alert('No laps to save.');
        return;
      }

      for (const lap of laps) {
        const { process, instance, process_step, time, note } = lap;
        
        await database.runAsync(
          "INSERT INTO timestudies (process, instance, process_step, time, note) VALUES (?, ?, ?, ?, ?)",
          [process, instance, process_step, time, note]
        );
      }
      alert('Data saved successfully!');
    } catch (error) {
      console.error("Error saving laps:", error);
      alert('Failed to save data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.timer}>{`${(time / 3600000).toFixed(0)}:${((time / 60000) % 60).toFixed(0)}'${((time / 1000) % 60).toFixed(0)}.${(time % 1000).toFixed(0)}`}</Text>
      
      {/* Process name input */}
      <TextInput
        style={styles.processNameInput}
        value={currentProcess}
        onChangeText={setCurrentProcess}
        placeholder="Enter Process Name"
        placeholderTextColor="#ccc"
      />
      
      {/* Process step input */}
      <TextInput
        style={styles.processNameInput}
        value={currentStep}
        onChangeText={setCurrentStep}
        placeholder="Enter Process Step"
        placeholderTextColor="#ccc"
      />

      {/* Notes input */}
      <TextInput
        style={styles.processNameInput}
        value={currentNote}
        onChangeText={setCurrentNote}
        placeholder="Enter Note"
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

      {/* Render recorded laps */}
      {Object.keys(processes).map(process => (
        <View key={process} style={styles.processSection}>
          <Text style={styles.processTitle}>{process}</Text>
          <FlatList
            data={processes[process]}
            keyExtractor={(item) => item.instance.toString()}
            renderItem={({ item }) => (
              <View style={styles.lapItem}>
                <Text>{`Instance: ${item.instance}, Step: ${item.process_step}, Time: ${item.time}`}</Text>
                <Text>{`Note: ${item.note}`}</Text>
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  timer: { fontSize: 48, color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  processNameInput: { color: colors.textPrimary, fontSize: 18, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 5, marginBottom: 20, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', marginBottom: 20, justifyContent: 'center' },
  button: { margin: 10, padding: 10, backgroundColor: colors.primary, borderRadius: 5 },
  buttonReset: { margin: 10, padding: 10, backgroundColor: colors.danger, borderRadius: 5 },
  buttonLap: { margin: 10, padding: 10, backgroundColor: colors.secondary, borderRadius: 5 },
  buttonText: { color: colors.textPrimary, fontSize: 18 },
  processSection: { marginBottom: 20 },
  processTitle: { fontSize: 22, color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  lapItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lapBackground, padding: 10, marginVertical: 5, borderRadius: 5 },
});
