import { useAppDispatch } from "@/redux/hook";
import { setOriginalImage } from "@/redux/slices/imageSlice";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FileUpload = () => {
  const dispatch = useAppDispatch();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      dispatch(setOriginalImage(result.assets[0].uri));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.button}
        onPress={handlePickImage}
      >
        <Feather name="upload" size={16} color="black" />
        <Text>Select File</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  button: {
    columnGap: 8,
    marginVertical: 8,
    backgroundColor: "#efefef",
    padding: 12,
    borderRadius: 6,
    display: "flex",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
