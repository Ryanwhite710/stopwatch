import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";



export default function TabLayout() {
  return (
    <Tabs
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
      <Tabs.Screen name="template" options={{
          title: 'Templates',
          tabBarIcon: ({color, focused}) => (
          <MaterialCommunityIcons name={focused ? 'form-textbox' : 'form-select'} color={color} size={24} />
          )
        }} />
    </Tabs>
  );
}
