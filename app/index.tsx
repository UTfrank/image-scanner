import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Camera from "@/components/camera";
import FileUpload from "@/components/FIleUpload";

const height = Dimensions.get("window").height;
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Camera />
        <FileUpload />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: height,
  },
});
