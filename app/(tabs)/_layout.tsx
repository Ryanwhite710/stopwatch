import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";


const loadDatabase = async () => {
  const dbName = 'time_studies.db';
  const dbAsset = require('../../data/time_studies.db');
  const dbUri = Asset.fromModule(dbAsset).url;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
  
  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
};



export default function TabLayout() {
  const [dbLoaded, setDbLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  }, []);

  if (!dbLoaded)
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size={"large"} />
        <Text>Loading Database...</Text>
      </View>
    );
  return (
    <Tabs.Suspense
        screenOptions={{
          tabBarActiveTintColor:'#5d8aa8',
          tabBarStyle: {
            backgroundColor: '#25292e'
          },
          headerStyle: {
            backgroundColor: '#25292e'
          },
          headerTintColor: '#fff',
        }}
      >
      <SQLiteProvider database="time_studies.db" useSuspense>
        <Tabs.Screen name="index" options={{
            title: 'Stop Watch',
            tabBarIcon: ({color, focused}) => (
            <Ionicons name={focused ? 'timer' : 'timer-outline'} color={color} size={24} />
            )
          }} />
        <Tabs.Screen name="data" options={{
            title: 'Data',
            tabBarIcon: ({color, focused}) => (
            <AntDesign name={focused ? 'table' : 'database'} color={color} size={24} />
            )
          }} />
      </SQLiteProvider>
    </Tabs.Suspense>
  );
}
