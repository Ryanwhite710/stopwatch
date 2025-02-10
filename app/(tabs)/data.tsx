import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";

export default function TabHome() {
  const [data, setData] = useState<{ process: string; instance: number; process_step: string; time: number; note: string }[]>([]);

  const database = useSQLiteContext();

  // Fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const deleteDatabase = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/timestudies.db`;
    try {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      Alert.alert("Database deleted successfully");
      setData([]); // Optionally clear data after deleting
    } catch (error) {
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

    // Convert time to a number and format it
    const transformedData = result.map(item => ({
      ...item,
      time: parseInt(item.time, 10),  // Convert time from string to number
    }));

    setData(transformedData);
  };

  // Confirm before deleting database
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

  // Format the time to a human-readable format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${milliseconds}`;
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={confirmDeleteDatabase} style={styles.button}>
              <FontAwesome name="trash" size={20} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text>{item.process}</Text>
                <Text>{`Instance: ${item.instance}`}</Text>
                <Text>{`Step: ${item.process_step}`}</Text>
                <Text>{`Time: ${formatTime(item.time)}`}</Text> {/* Format the time */}
                <Text>{`Note: ${item.note}`}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 15,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});
