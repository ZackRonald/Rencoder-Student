import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login"); // Navigate after delay
    }, 6000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/splash-icon.gif")} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 200,
    height: 200,
  },
});
