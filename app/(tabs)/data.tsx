import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import * as FileSystem from "expo-file-system";

export default function TabHome() {
  const [data, setData] = React.useState<
    { process: string; instance: number; time: number; process_step: string; note: string }[]
  >([]);

  const database = useSQLiteContext();

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
      time: string;
      note: string;
    }>("SELECT * FROM timestudies");
    setData(result);
  };

  // Function to confirm database deletion
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
        renderItem={({ item }: { item: { process: string; instance: number; time: number; process_step: string; note: string } }) => (
          <View style={{ padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text>{item.process}</Text>
                <Text>{item.instance}</Text>
                <Text>{item.time}</Text>
                <Text>{item.process_step}</Text>
                <Text>{item.note}</Text>
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
