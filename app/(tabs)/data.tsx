import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function TabHome() {
  const [data, setData] = useState<{ 
    process: string; 
    instance: number; 
    process_step: string; 
    time: number; 
    note: string 
  }[]>([]);

  const database = useSQLiteContext();

  // Fetch data when the screen is focused.
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
      process: string;
      instance: number;
      process_step: string;
      time: string;  // time is stored as string in the database (milliseconds)
      note: string;
    }>("SELECT * FROM timestudies");

    // Convert time from string to a number.
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

  // Format the time in a human-readable format.
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${milliseconds}`;
  };

  // Export the data as a JSON file, then prompt the share dialog.
  const exportJSON = async () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const fileUri = `${FileSystem.documentDirectory}export.json`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData, { encoding: FileSystem.EncodingType.UTF8 });
      
      // Check if sharing is available.
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Export Successful", `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Error exporting JSON:", error);
      Alert.alert("Export Failed", "Could not save the file.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={confirmDeleteDatabase} style={styles.button}>
              <FontAwesome name="trash" size={20} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={exportJSON} style={styles.exportButton}>
              <MaterialCommunityIcons name="export-variant" size={20} color="white"/>
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={data.sort((a, b) => a.process.localeCompare(b.process))}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={localStyles.lapBox}>
            <Text style={localStyles.lapText}>{`Process: ${item.process}`}</Text>
            <Text style={localStyles.lapText}>{`Instance: ${item.instance}`}</Text>
            <Text style={localStyles.lapText}>{`Step: ${item.process_step}`}</Text>
            <Text style={localStyles.lapText}>{`Time: ${item.time}`}</Text>
            <Text style={localStyles.lapText}>{`Note: ${item.note}`}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // BUTTON STYLE: For the trash icon button in the header.
  button: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 15,
  },
  // BUTTON TEXT STYLE: Used for any button text.
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  // EXPORT BUTTON STYLE: A larger button for exporting JSON.
  exportButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
    marginRight: 15,
  },
});

const localStyles = StyleSheet.create({
  lapBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  lapText: {
    fontSize: 14,
    color: "#333",
  },
});
