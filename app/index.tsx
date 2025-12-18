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
import { Picker } from "@react-native-picker/picker";
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
import { NIGERIAN_STATES } from "../constants/states";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%", "75%"], []);

  const [state, setState] = useState("");
  const [batch, setBatch] = useState("");
  const [stateCode, setStateCode] = useState("");

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

  const STATE_CODE_REGEX = /^[0-9]{4}$/;
  const BATCH_REGEX = /^[0-9]{2}[A-Za-z]{1}$/;

  const isAlphaNumeric = (value: string) => /^[a-zA-Z0-9]+$/.test(value);

  const isBatchValid = BATCH_REGEX.test(batch);

  const isStateCodeValid = STATE_CODE_REGEX.test(stateCode);

  const handleBatchChange = (text: string) => {
    // Remove non-alphanumeric
    let sanitized = text.replace(/[^a-zA-Z0-9]/g, "");

    // Max length = 3
    sanitized = sanitized.slice(0, 3);

    // Force format while typing
    if (sanitized.length <= 2) {
      // First two must be digits
      sanitized = sanitized.replace(/[^0-9]/g, "");
    } else {
      // Third must be a letter
      sanitized =
        sanitized.slice(0, 2).replace(/[^0-9]/g, "") +
        sanitized
          .slice(2)
          .replace(/[^a-zA-Z]/g, "")
          .toUpperCase();
    }

    setBatch(sanitized);
  };

  const handleStateCodeChange = (text: string) => {
    // Keep digits only
    const digitsOnly = text.replace(/[^0-9]/g, "");

    // Limit to 4 digits
    setStateCode(digitsOnly.slice(0, 4));
  };

  const isFormValid = isBatchValid && isStateCodeValid;


  const errors = {
    state: !state ? "State is required" : null,
    batch: !batch
      ? "Batch is required"
      : !isAlphaNumeric(batch)
      ? "Only letters and numbers allowed"
      : null,
    stateCode: !stateCode
      ? "State code is required"
      : !isAlphaNumeric(stateCode)
      ? "Only letters and numbers allowed"
      : null,
  };

  // const isFormValid = !errors.state && !errors.batch && !errors.stateCode;

  const allowAlphaNumeric = (text: string) =>
    text.replace(/[^a-zA-Z0-9 ]/g, "");

  const sanitize = (value: string) =>
    value
      .trim()
      .replace(/\s+/g, "") // remove spaces
      .replace(/[^a-zA-Z0-9]/g, "");

  const buildFilenamePreview = (
    state: string,
    batch: string,
    stateCode: string
  ) => {
    if (!state || !batch || !stateCode) return "—/—/—.pdf";

    return `${state}/${batch}/${stateCode}.pdf`;
  };

  const buildFinalFilename = (
    state: string,
    batch: string,
    stateCode: string
  ) => `${sanitize(state)}_${sanitize(batch)}_${sanitize(stateCode)}.pdf`;

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

  const handleSavePdf = async () => {
    if (!pdfUri) {
      Alert.alert("Error", "No PDF to save. Please convert the image first.");
      return;
    }

    const newName = buildFinalFilename(state, batch, stateCode);

    if (!newName) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    try {
      // const newName = fileName.replace(/\s+/g, "_") + ".pdf";

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

      setState("");
      setBatch("");
      setStateCode("");
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
                  <Text style={{ color: "red" }}>Reset</Text>
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
                      <Text>Saving...</Text>
                    </>
                  ) : (
                    <>
                      <Foundation
                        name="page-export-pdf"
                        size={24}
                        color="black"
                      />
                      <Text>Save</Text>
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

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>State</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={state} onValueChange={setState}>
                <Picker.Item label="Select State" value="" />
                {NIGERIAN_STATES.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>
            {errors.state && (
              <Text className="text-xs text-red-500 mt-1">{errors.state}</Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Batch</Text>
            <TextInput
              value={batch}
              placeholder="e.g. 25A"
              onChangeText={handleBatchChange}
              style={styles.input}
            />
            {batch.length === 3 && !isBatchValid && (
              <Text style={styles.errorText}>
                Batch must be 2 numbers followed by 1 letter (e.g. 25A)
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>State Code</Text>
            <TextInput
              value={stateCode}
              placeholder="e.g. 0001"
              onChangeText={handleStateCodeChange}
              style={styles.input}
              maxLength={4}
              keyboardType="numeric"
            />
            {stateCode.length > 0 && !isStateCodeValid && (
              <Text style={styles.errorText}>
                State code must be exactly 4 digits (e.g. 0001)
              </Text>
            )}
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Filename Preview</Text>

            <View style={styles.previewBox}>
              <Text style={styles.previewText}>
                {buildFilenamePreview(state, batch, stateCode)}
              </Text>
            </View>
          </View>

          <View style={styles.sheetButtons}>
            <TouchableOpacity
              style={styles.sheetCancel}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetSave}
              onPress={() => handleSavePdf()}
              disabled={!isFormValid}
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
    marginTop: 0,
    marginBottom: 20,
  },
  sheetSaveDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewContainer: {
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  previewBox: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
