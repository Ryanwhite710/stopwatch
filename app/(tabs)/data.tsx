import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";

interface Lap {
  id: number;
  process: string;
  instance: number;
  process_step: string;
  time: number;
  note: string;
}

// Helper to group laps by process
const groupByProcess = (data: Lap[]): Record<string, Lap[]> => {
  const groups: Record<string, Lap[]> = {};
  data.forEach(lap => {
    if (!groups[lap.process]) {
      groups[lap.process] = [];
    }
    groups[lap.process].push(lap);
  });
  // Optionally, sort each group by id (or another field)
  Object.keys(groups).forEach(process => {
    groups[process].sort((a, b) => a.id - b.id);
  });
  return groups;
};

// Helper to group laps into cycles. Each time we see an instance === 1, we start a new cycle.
const groupCycles = (laps: Lap[]): Record<number, Lap>[] => {
  const cycles: Record<number, Lap>[] = [];
  let currentCycle: Record<number, Lap> | null = null;
  laps.forEach(lap => {
    if (lap.instance === 1) {
      currentCycle = {};
      cycles.push(currentCycle);
    }
    if (!currentCycle) {
      // If no cycle has been started (should not happen if data is valid), create one.
      currentCycle = {};
      cycles.push(currentCycle);
    }
    currentCycle[lap.instance] = lap;
  });
  return cycles;
};

export default function TabHome() {
  const [data, setData] = useState<Lap[]>([]);
  const database = useSQLiteContext();

  // Fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const deleteDatabase = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/timestudies.db`;
    try {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      Alert.alert("Database deleted successfully");
      setData([]);
    } catch (error: any) {
      console.error("Error deleting database:", error);
      Alert.alert("Error deleting database", error.message);
    }
  };

  const loadData = async () => {
    const result = await database.getAllAsync<{
      id: number;
      process: string;
      instance: number;
      process_step: string;
      time: string;  // time is stored as string in the database (milliseconds)
      note: string;
    }>("SELECT * FROM timestudies");

    // Convert time to a number
    const transformedData = result.map(item => ({
      ...item,
      time: parseInt(item.time, 10),
    }));

    setData(transformedData);
  };

  const confirmDeleteDatabase = () => {
    Alert.alert(
      "Delete Database",
      "Are you sure you want to delete the database?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: deleteDatabase, style: "destructive" },
      ]
    );
  };

  // A simple time formatter (if needed elsewhere)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${milliseconds}`;
  };

  // --- TABLE RENDERING LOGIC ---
  // Group data by process.
  const processesGrouped = groupByProcess(data);

  // For each process, we want to render a table. Each table will have:
  // - A header row: "Process" in the first cell, then "Step 1", "Step 2", ... up to the maximum instance in any cycle.
  // - One row per cycle.
  // We determine cycles by grouping laps (sorted by id) into cycles where each new cycle starts when instance === 1.
  const renderProcessTable = (process: string, laps: Lap[]) => {
    const cycles = groupCycles(laps);
    // Determine the maximum instance number (i.e. number of steps) across all cycles.
    let maxInstance = 0;
    cycles.forEach(cycle => {
      const instanceNumbers = Object.keys(cycle).map(key => parseInt(key, 10));
      const cycleMax = Math.max(...instanceNumbers);
      if (cycleMax > maxInstance) maxInstance = cycleMax;
    });

    return (
      <View key={process} style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{process}</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, styles.firstCell]}>Process</Text>
            {Array.from({ length: maxInstance }).map((_, i) => (
              <Text key={i} style={styles.tableHeaderCell}>
                Step {i + 1}
              </Text>
            ))}
          </View>
          {/* Data Rows (one per cycle) */}
          {cycles.map((cycle, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.firstCell]}>{process}</Text>
              {Array.from({ length: maxInstance }).map((_, i) => {
                // instance numbers start at 1
                const lap = cycle[i + 1];
                return (
                  <Text key={i} style={styles.tableCell}>
                    {lap ? lap.time : ""}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={confirmDeleteDatabase} style={styles.button}>
              <FontAwesome name="trash" size={20} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Optionally, you can display a title or summary here */}
      <Text style={styles.title}>Time Study Data</Text>
      {/* Render a table for each process */}
      {Object.keys(processesGrouped).map(process =>
        renderProcessTable(process, processesGrouped[process])
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff",
    padding: 10,
  },
  button: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    textAlign: "center",
  },
  firstCell: {
    flex: 2, // Make the first column wider
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
});
