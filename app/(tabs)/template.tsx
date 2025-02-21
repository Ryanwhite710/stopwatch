import { View, StyleSheet, Text, FlatList, TextInput, ScrollView, } from 'react-native';
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";
import { Stack } from 'expo-router';
import Ionicons from "@expo/vector-icons/Ionicons";
import styles from '../constants/colors';
import React, { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import DeleteDatabaseButton from '../components/ui/deleteDatabaseButton'
import CreateTemplateButton from '../components/ui/createTemplateButton'

export default function StudyTemplate() {

  const [currentProcess, setCurrentProcess] = useState('');
  const [currentProcessStep, currentProcessStep] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  const database = useSQLiteContext();
  


  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.processStep}>
          <Stack.Screen 
            options={{
              headerLeft: () => (
                <DeleteDatabaseButton onPress={undefined}/>
              ),
              headerRight: () => (
                <CreateTemplateButton onPress={undefined}/>
              ),
            }}
          />
        <View>
          <Text>Hello</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
