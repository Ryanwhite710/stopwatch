import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';

export default function StopwatchWithLap() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [processes, setProcesses] = useState<Record<string, { id: number; time: number; name: string; note: string }[]>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lapIdRef = useRef(0);
  const [currentProcess, setCurrentProcess] = useState('Default Process');

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
    lapIdRef.current = 0;
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
                  placeholder="Enter lap name"
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
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  buttonReset: {
    margin: 10,
    padding: 10,
    backgroundColor: '#F44336',
    borderRadius: 5,
  },
  buttonLap: {
    margin: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  processSection: {
    marginBottom: 20,
  },
  processTitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  lapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  lapId: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  lapNameInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    padding: 5,
  },
  lapTime: {
    fontSize: 18,
    color: '#fff',
    marginHorizontal: 10,
  },
  lapNoteInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    padding: 5,
  },
});
