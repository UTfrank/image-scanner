import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link } from 'expo-router';

const Camera = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={toggleCameraFacing} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} mirror={true} mode="picture" />
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.button}
        onPress={requestPermission}
      >
        <Text>Camera</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
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
  camera: {
    flex: 1,
  },
});
