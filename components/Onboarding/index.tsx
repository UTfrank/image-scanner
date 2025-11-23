import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface OnboardingViewProps {
  onComplete: () => void;
}

const OnboardingView = ({ onComplete }: OnboardingViewProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/nysc.png")}
          style={{ width: 200, height: 200, marginBottom: 20 }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 20, textAlign: "center" }}>Built By Hachstacks</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: width,
    height: height,
  },
  background: {
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
    color: "#000",
  },
  stepsContainer: {
    width: "100%",
    marginBottom: 60,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: "center",
    lineHeight: 40,
    marginRight: 15,
  },
  stepText: {
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingView;
