import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

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
        title: 'Main',
        tabBarIcon: ({color, focused}) => (
        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        )
      }} />
    </Tabs>
  );
}
