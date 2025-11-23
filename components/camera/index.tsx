import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useAppDispatch } from "@/redux/hook";
import { setOriginalImage } from "@/redux/slices/imageSlice";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Camera = () => {
  const dispatch = useAppDispatch();

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      dispatch(setOriginalImage(result.assets[0].uri));
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.button}
      onPress={takePhoto}
    >
      <Text>
        <Feather name="camera" size={20} color="#060606" />
      </Text>
    </TouchableOpacity>
  );
};

export default Camera;

const styles = StyleSheet.create({
  button: {
    gap: 8,
    marginVertical: 8,
    backgroundColor: "#EFEFEF",
    padding: 12,
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: 50
  },
});
