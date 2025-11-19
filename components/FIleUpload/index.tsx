import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

const FileUpload = () => {
  const handlePickDocument = async () => {
    try{
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      const file = new File(result.assets[0]);
      console.log(file.textSync());
    } catch (err) {
      console.log("Error picking document: ", err);
    }
  }
  return (
    <TouchableOpacity activeOpacity={0.5} style={styles.button} onPress={handlePickDocument}>
      <Text>Select File</Text>
    </TouchableOpacity>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  button: {
    gap: 8,
    marginBottom: 8,
    backgroundColor: "aqua",
    padding: 12,
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
});
