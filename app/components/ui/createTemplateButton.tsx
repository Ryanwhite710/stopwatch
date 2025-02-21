import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';


interface createTemplateProps {
  onPress: () => void;
}

const CreateTemplateButton: React.FC<createTemplateProps> = ({ onPress }) => {
  return (
  <TouchableOpacity onPress={onPress} style={styles.createTemplateButton}>
    <Ionicons name="create-outline" size={20} color="white"/>
  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createTemplateButton: {
    margin: 10, 
    padding: 10, 
    backgroundColor: colors.primary, 
    borderRadius: 5,
  }
})


export default CreateTemplateButton;
