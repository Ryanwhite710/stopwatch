import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DeleteDatabaseProps {
  onPress: () => void;
}

const DeleteDatabaseButton: React.FC<DeleteDatabaseProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.deleteDatabaseButton, style]}>
      <FontAwesome name="trash" size={20} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deleteDatabaseButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 15,
  },
});

export default DeleteDatabaseButton;
