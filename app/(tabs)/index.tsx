import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function StopwatchWithLap() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [processes, setProcesses] = useState<Record<string, { instance: number; id: number; time: number; name: string; note: string }[]>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lapIdRef = useRef(0);
  const [currentProcess, setCurrentProcess] = useState('Default Process');
  const processInstanceRef = useRef<Record<string, number>>({});

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        const savedProcesses = await AsyncStorage.getItem('processes');
        if (savedProcesses) {
          setProcesses(JSON.parse(savedProcesses));
        }
      };
      loadData();
    }, [])
  );

  const saveData = async () => {
    await AsyncStorage.setItem('processes', JSON.stringify(processes));
  };

  const startStopwatch = () => {
    if (!processInstanceRef.current[currentProcess]) {
      processInstanceRef.current[currentProcess] = 1;
    }
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
    if (processes[currentProcess]) {
      processInstanceRef.current[currentProcess] += 1;
    }
    saveData();
  };

  const recordLap = () => {
    setProcesses(prevProcesses => {
      const updatedLaps = prevProcesses[currentProcess] || [];
      const newProcesses = {
        ...prevProcesses,
        [currentProcess]: [
          { instance: processInstanceRef.current[currentProcess], id: lapIdRef.current++, time, name: `Lap ${updatedLaps.length + 1}`, note: '' },
          ...updatedLaps,
        ],
      };
      saveData();
      return newProcesses;
    });
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
      </View>
      {Object.keys(processes).map(process => (
        <View key={process} style={styles.processSection}>
          <Text style={styles.processTitle}>{`${process} (Instance ${processInstanceRef.current[process] || 1})`}</Text>
          <FlatList
            data={processes[process]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.lapItem}>
                <Text style={styles.lapId}>{`Instance: ${item.instance} | ID: ${item.id}`}</Text>
                <Text style={styles.lapTime}>{`${(item.time / 3600000).toFixed(0)}:${((item.time / 60000) % 60).toFixed(0)}'${((item.time / 1000) % 60).toFixed(0)}.${(item.time % 1000).toFixed(0)}`}</Text>
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
    backgroundColor: '#25292e',
    padding: 20,
  },
  timer: {
    fontSize: 48,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  processNameInput: {
    color: '#fff',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    padding: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  processTitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  }
});
