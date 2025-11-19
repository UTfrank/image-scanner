import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const FileUpload = () => {
  return (
    <TouchableOpacity activeOpacity={0.5} style={styles.button}>
      <Text>Upload File</Text>
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
