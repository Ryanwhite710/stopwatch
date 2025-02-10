import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";

export default function TabHome() {
  const [data, setData] = React.useState<
    { id: number; time: number; name: string; note: string }[]
  >([]);
  const database = useSQLiteContext();
  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const loadData = async () => {
    const result = await database.getAllAsync<{
      id: number;
      name: string;
      time: string;
      note: string;
    }>("SELECT * FROM timestudies");
    setData(result);
  };

  return (
    <View>
      <FlatList
        data={data}
        renderItem={({
          item,
        }: {
          item: { id: number; time: number; name: string; note: string }
        }) => (
          <View style={{ padding: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text>{item.id}</Text>
                <Text>{item.time}</Text>
                <Text>{item.name}</Text>
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
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
    alignContent: "flex-end",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});
