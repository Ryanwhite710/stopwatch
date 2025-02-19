import { StyleSheet } from 'react-native';
import colors from '../constants/colors';


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    padding: 10,
  },
  reference: { 
    color: colors.textPrimary, 
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  timer: {
    fontSize: 48,
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  processNameInput: { 
    color: colors.textPrimary, 
    fontSize: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    padding: 5, 
    marginBottom: 20, 
    textAlign: 'center',
  },
  buttonContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    justifyContent: 'center',
  },
  deleteButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 15,
  },
  exportButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
    marginRight: 15,
  },
  button: { 
    margin: 10, 
    padding: 10, 
    backgroundColor: colors.primary, 
    borderRadius: 5,
  },
  buttonReset: { 
    margin: 10, 
    padding: 10, 
    backgroundColor: colors.danger, 
    borderRadius: 5,
  },
  buttonLap: { 
    margin: 10, 
    padding: 10, 
    backgroundColor: colors.secondary, 
    borderRadius: 5,
  },
  buttonText: { 
    color: colors.textPrimary, 
    fontSize: 18,
  },
  lapBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  lapText: {
    fontSize: 14,
    color: "#333",
  },
  processSection: { 
    marginBottom: 20,
    maxHeight: 500,
    overflow: 'scroll',
  },
  processTitle: { 
    fontSize: 18, 
    color: colors.textPrimary, 
    marginBottom: 10, 
    textAlign: 'center',
  },
  processStep: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  lapItem: { 
    flexDirection: 'column', // Stack details vertically.
    alignItems: 'flex-start', // Align text to the left.
    backgroundColor: colors.lapBackground, 
    padding: 10,
    marginVertical: 5, 
    borderRadius: 5,
    width: '100%', // Full width.
  },
  lapItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    flexWrap: 'wrap',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineInput: {
    fontSize: 14,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flex: 1,
    marginLeft: 5,
  },
});

export default styles;
