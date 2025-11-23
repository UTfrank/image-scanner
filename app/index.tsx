import Camera from "@/components/camera";
import FileUpload from "@/components/FIleUpload";
import { useImageTools } from "@/hooks/useImageHook";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { clearImage, setPdfUri } from "@/redux/slices/imageSlice";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import Foundation from "@expo/vector-icons/Foundation";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { File, Paths } from "expo-file-system";
import { useImageManipulator } from "expo-image-manipulator";
import * as Sharing from "expo-sharing";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%"], []);

  const [filename, setFilename] = useState("");
  const { originalUri, compressedUri, pdfUri } = useAppSelector(
    (state) => state.image
  );
  const context = useImageManipulator(originalUri || "");
  const { convertToPdf } = useImageTools(context);
  const openRenameSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleConvertPdf = async () => {
    try {
      setLoading(true);
      const pdfUri = await convertToPdf();
      dispatch(setPdfUri(pdfUri || ""));
      Alert.alert("Success", "Image successfully converted");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("Error converting to PDF:", err);
    }
  };

  const handleSavePdf = async (fileName: string) => {
    if (!fileName || fileName === "") {
      Alert.alert("Error", "Please enter a fileName.");
      return;
    }

    if (!pdfUri) {
      Alert.alert("Error", "No PDF to save. Please convert the image first.");
      return;
    }

    try {
      const newName = fileName.replace(/\s+/g, "_") + ".pdf";

      const cacheDir = Paths.cache?.uri || Paths.document?.uri;
      const renamedFileUri = `${cacheDir}/${newName}`;

      const sourceFile = new File(pdfUri);
      const renamedFile = new File(renamedFileUri);

      if (await renamedFile.exists) {
        await renamedFile.delete();
      }

      await sourceFile.copy(renamedFile);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(renamedFile.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Save ${newName}`,
          UTI: "com.adobe.pdf",
        });
        Alert.alert("Success!", "PDF is ready to download");
      }

      bottomSheetRef.current?.close();
    } catch (error) {
      console.error("Error saving PDF:", error);
      Alert.alert("Error", "Failed to save PDF. Please try again.");
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

                {compressedUri && (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.button}
                    onPress={openRenameSheet}
                  >
                    <Feather name="download" size={24} color="black" />
                    <Text>Download</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Save PDF As</Text>

          <TextInput
            placeholder="Enter filename"
            value={filename}
            onChangeText={setFilename}
            style={styles.sheetInput}
          />

          <View style={styles.sheetButtons}>
            <TouchableOpacity
              style={styles.sheetCancel}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetSave}
              onPress={() => handleSavePdf(filename || "")}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
  sheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 25,
  },
  sheetButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 12,
  },
  sheetCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sheetSave: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
