import { useSQLiteContext } from "expo-sqlite";
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import colors from '../constants/colors'; 
import style from '../constants/StyleSheet';

export default function StopwatchWithLap() {
  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Input state for current lap
  const [currentProcess, setCurrentProcess] = useState('Default Process');
  const [currentStep, setCurrentStep] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  
  // SQLite database context
  const database = useSQLiteContext();
  
  // Lap state is stored as a record keyed by process name.
  // Each lap has a "saved" flag (false when new, true after saving).
  const [processes, setProcesses] = useState<Record<string, {
    process: string;
    instance: number;
    process_step: string;
    time: number;
    note: string;
    saved?: boolean;
  }[]>>({});
  
  // Determine if all laps for the current process have been saved.
  const allLapsSaved = processes[currentProcess]?.every(lap => lap.saved) || false;
  
  // Helper: Format time in a chronograph style: HH:MM:SS.mmm
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };
  
  // Stopwatch control functions
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
    stopStopwatch();
    setTime(0);
    setProcesses({});
    // Reset the instance counter if needed.
  };

  // Record a new lap for the current process.
  const recordLap = () => {
    // Increment the instance number for the current process.
    const updatedInstance = (processes[currentProcess]?.length ?? 0) + 1;
    
    // Add the new lap with "saved: false".
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
            saved: false,
          },
        ],
      };
    });

    // Clear the process step and note inputs.
    setCurrentStep('');
    setCurrentNote('');
  };

  // Save unsaved laps to the database.
  const handleSave = async () => {
    try {
      const laps = processes[currentProcess];
      if (!laps || laps.length === 0) {
        alert('No laps to save.'); StyleSheet,
        return;
      }

      // Update unsaved laps.
      const updatedLaps = [];
      for (const lap of laps) {
        if (!lap.saved) {
          await database.runAsync(
            "INSERT INTO timestudies (process, instance, process_step, time, note) VALUES (?, ?, ?, ?, ?)",
            [lap.process, lap.instance, lap.process_step, lap.time, lap.note]
          );
          updatedLaps.push({ ...lap, saved: true });
        } else {
          updatedLaps.push(lap);
        }
      }

      // Update state so that saved laps are marked as such.
      setProcesses(prevProcesses => ({
        ...prevProcesses, StyleSheet,
        [currentProcess]: updatedLaps,
      }));

      alert('Data saved successfully!');
    } catch (error) {
      console.error("Error saving laps:", error);
      alert('Failed to save data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.timer}>
        {formatTime(time)}
      </Text>
      
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

      {/* Note input */}
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
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.button}
          disabled={allLapsSaved}  // Disable if all laps are saved.
        >
          <Text style={styles.buttonText}>{allLapsSaved ? 'Saved' : 'Save'}</Text>
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
                <Text style={styles.lapItemText}>{`Instance: ${item.instance}`}</Text>
                
                {/* Inline editing for Process Step */}
                <View style={styles.inlineContainer}>
                  <Text style={styles.lapItemText}>Process Step: </Text>
                  <TextInput
                    style={styles.inlineInput}
                    value={item.process_step}
                    onChangeText={(text) => {
                      const updatedProcesses = { ...processes };
                      updatedProcesses[process] = updatedProcesses[process].map(lap =>
                        lap.instance === item.instance ? { ...lap, process_step: text } : lap
                      );
                      setProcesses(updatedProcesses);
                    }}
                    placeholder="Enter Process Step"
                    placeholderTextColor="#ccc"
                  />
                </View>
                <Text style={styles.lapItemText}>{`Time: ${item.time}`}</Text>
                
                {/* Inline editing for Note */}
                <View style={styles.inlineContainer}>
                  <Text style={styles.lapItemText}>Note: </Text>
                  <TextInput
                    style={styles.inlineInput}
                    value={item.note}
                    onChangeText={(text) => {
                      const updatedProcesses = { ...processes };
                      updatedProcesses[process] = updatedProcesses[process].map(lap =>
                        lap.instance === item.instance ? { ...lap, note: text } : lap
                      );
                      setProcesses(updatedProcesses);
                    }}
                    placeholder="Enter Note"
                    placeholderTextColor="#ccc"
                  />
                </View>
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}
