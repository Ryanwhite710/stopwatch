import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, ScrollView, } from 'react-native';
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";
import { Stack } from 'expo-router';
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import styles from '../constants/colors'


export default function StudyTemplate() {
  return (
    <SafeAreaProvider>
      <SafeAreaView styles={styles.processStep}>
        <View>
          <Stack.Screen 
            options={{
              headerLeft: () => (
                <TouchableOpacity onPress={undefined} styles={styles.button}>
                  <FontAwesome name="trash" size={20} color="white"/>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={undefined} styles={styles.button}>
                  <Ionicons name="create-outline" size={20} color="white"/>
                </TouchableOpacity>
              ),
            }}
          />
          <Text>Hellow</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
