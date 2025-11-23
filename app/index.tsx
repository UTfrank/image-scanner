import Camera from "@/components/camera";
import FileUpload from "@/components/FIleUpload";
import OnboardingView from "@/components/Onboarding";
import { useImageTools } from "@/hooks/useImageHook";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { clearImage, setPdfUri } from "@/redux/slices/imageSlice";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import Foundation from "@expo/vector-icons/Foundation";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { File, Paths } from "expo-file-system";
import { useImageManipulator } from "expo-image-manipulator";
import { Link } from "expo-router";
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
  const [filenameError, setFilenameError] = useState("");
  const {
    hasSeenOnboarding,
    loading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding();

  const { originalUri, compressedUri, pdfUri } = useAppSelector(
    (state) => state.image
  );
  const context = useImageManipulator(originalUri || "");
  const { convertToPdf } = useImageTools(context);
  const openRenameSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleFilenameChange = (text: string) => {
    // Comprehensive validation
    const invalidChars = /[\/\\:*?"<>|#%&{}$!'@+`=\[\]\n\r\t\x00-\x1f\x7f]/;
    const invalidPattern = /^\.|\.{2,}|\.$/; // starts with dot, consecutive dots, ends with dot
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i; // Windows reserved names

    if (!text) {
      setFilenameError("");
    } else if (invalidChars.test(text)) {
      setFilenameError(
        "Invalid characters detected. Use only letters, numbers, spaces, - and _"
      );
    } else if (invalidPattern.test(text)) {
      setFilenameError(
        "Filename cannot start/end with dot or have consecutive dots"
      );
    } else if (reservedNames.test(text.trim())) {
      setFilenameError("This filename is reserved by the system");
    } else if (text.trim().length === 0) {
      setFilenameError("Filename cannot be only whitespace");
    } else if (text.length > 255) {
      setFilenameError("Filename is too long (max 255 characters)");
    } else {
      setFilenameError("");
    }

    setFilename(text);
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

      const cacheDir = Paths.cache;
      const renamedFile = new File(cacheDir, newName);
      // const renamedFile = new File(renamedFileUri);

      const sourceFile = new File(pdfUri);

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

      setFilename("");
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error("Error saving PDF:", error);
      Alert.alert("Error", "Failed to save PDF. Please try again.");
    }
  };

  if (onboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingView onComplete={completeOnboarding} />;
  }

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
      <Link
        href="https://hackstacks.com"
        style={{
          padding: 10,
          backgroundColor: "white",
          position: "absolute",
          bottom: 0,
          width: width,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            width: width,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Built by </Text>
          <Image
            source={require("../assets/images/hackstacks.png")}
            style={{ width: 170, height: 20 }}
          />
        </View>
      </Link>
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
            onChangeText={handleFilenameChange}
            style={[
              styles.sheetInput,
              filenameError ? styles.sheetInputError : null,
            ]}
          />

          {filenameError && (
            <Text style={styles.errorText}>{filenameError}</Text>
          )}

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
              disabled={!!filenameError}
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
  sheetInputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -20,
    marginBottom: 20,
  },
  sheetSaveDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
});
