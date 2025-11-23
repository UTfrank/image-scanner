import Camera from "@/components/camera";
import FileUpload from "@/components/FIleUpload";
import { useImageTools } from "@/hooks/useImageHook";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { clearImage } from "@/redux/slices/imageSlice";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import Foundation from "@expo/vector-icons/Foundation";
import { useImageManipulator } from "expo-image-manipulator";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const { originalUri, compressedUri, pdfUri } = useAppSelector(
    (state) => state.image
  );
  const context = useImageManipulator(originalUri || "");
  const { convertToPdf } = useImageTools(context);

  const handleConvertPdf = async () => {
    try {
      setLoading(true);
      const pdfUri = await convertToPdf();
      Alert.alert("Success", "Image successfully converted");
      console.log("PDF saved at:", pdfUri);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("Error converting to PDF:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/vector-bg.jpg")}
        style={{ position: "absolute", width: width, height: height }}
        resizeMode="cover"
      />
      <View
        style={{
          // height: 500,
          width: width - 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderRadius: 12,
          backgroundColor: "#fff",
          boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          Convert your NIN to PDF
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            columnGap: 8,
            alignItems: "center",
          }}
        >
          <FileUpload />
          <Camera />
        </View>
        {originalUri && (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 10,
              borderRadius: 12,
              position: "relative",
            }}
          >
            {originalUri && (
              <Image
                source={{ uri: originalUri }}
                style={{ width: 290, height: 300, borderRadius: 6 }}
              />
            )}

            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                height: 40,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: 290,
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.deleteButton}
                  onPress={() => dispatch(clearImage())}
                >
                  <EvilIcons name="trash" size={24} color="red" />
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.button}
                  onPress={handleConvertPdf}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size={20} />
                      <Text>Converting...</Text>
                    </>
                  ) : (
                    <>
                      <Foundation
                        name="page-export-pdf"
                        size={24}
                        color="black"
                      />
                      <Text>Convert</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.button}
                  // onPress={() => setFile(null)}
                >
                  <Feather name="download" size={24} color="black" />
                  <Text>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    backgroundColor: "#fff",
    position: "relative",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    columnGap: 6,
    // padding: 4,
    width: 90,
  },
  deleteButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 6,
    width: 90,
  },
});
