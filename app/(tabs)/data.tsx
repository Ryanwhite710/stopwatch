import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DataScreen() {
  const [processes, setProcesses] = useState<Record<string, { instance: number; id: number; time: number; name: string; note: string }[]>>({});

  useEffect(() => {
    const loadData = async () => {
      const savedProcesses = await AsyncStorage.getItem('processes');
      if (savedProcesses) {
        setProcesses(JSON.parse(savedProcesses));
      }
    };
    loadData();
  }, []);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const mins = Math.floor((milliseconds % 3600000) / 60000);
    const secs = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}'${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Saved Process Data</Text>
      {Object.keys(processes).length === 0 ? (
        <Text style={styles.noDataText}>No saved data available</Text>
      ) : (
        Object.keys(processes).map(process => (
          <View key={process} style={styles.processSection}>
            <Text style={styles.processTitle}>{`${process} (Instances: ${new Set(processes[process].map(lap => lap.instance)).size})`}</Text>
            <FlatList
              data={processes[process]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.lapItem}>
                  <Text style={styles.lapId}>{`Instance: ${item.instance} | ID: ${item.id}`}</Text>
                  <Text style={styles.lapName}>{item.name}</Text>
                  <Text style={styles.lapTime}>{formatTime(item.time)}</Text>
                  <Text style={styles.lapNote}>{item.note ? `Note: ${item.note}` : 'No notes'}</Text>
                </View>
              )}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  noDataText: {
    color: '#fff',
    textAlign: 'center',
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
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  lapId: {
    color: '#fff',
    fontSize: 16,
  },
  lapName: {
    color: '#5d8aa8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lapTime: {
    color: '#fff',
    fontSize: 18,
  },
  lapNote: {
    color: '#ccc',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

