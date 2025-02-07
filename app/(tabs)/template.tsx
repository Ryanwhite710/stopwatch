import { View, Text, StyleSheet } from 'react-native';

export default function Main() {
  return (
  <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  text: {
  color: '#fff',
},
});
