import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, ScrollView, View, Image, TextInput,
  Pressable, Dimensions
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from 'expo-font';
import { storeToken, storeEmail } from "./utils/auth";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [studEmail, setStudEmail] = useState("");
  const [otp, setOtp] = useState('');
  const [isOtpGenerated, setIsOtpGenerated] = useState(false);
  const navigation = useNavigation();

  const handleGenerateOtp = async () => {
    try {
      const response = await axios.post('http://192.168.1.4:5000/generateOtp', { studEmail });

      if (response.status === 200) {
        setIsOtpGenerated(true);
        await storeEmail(studEmail);
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Check your email for the OTP',
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to generate OTP.";
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://192.168.1.4:5000/verifyOtp', {
        email: studEmail,
        otp,
      });

      if (response.status === 200) {
        await storeToken(response.data.token);
        setOtp('');
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Welcome to Rencoder!',
        });
        navigation.replace("Home");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid OTP.";
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
      });
    }
  };

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('./assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('./assets/Fonts/Poppins/Poppins-Medium.ttf')
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await SecureStore.getItem("status");

        if (status === "Active") {
          navigation.replace("Home");
        } else {
          navigation.navigate("Login");
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Login Check Failed',
          text2: 'Error while checking login status.',
        });
        navigation.replace("Login");
      }
    };

    checkStatus();
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar backgroundColor="#8968CD" barStyle="light-content" />
        <Text style={styles.title}>Welcome to Rencoder Academy</Text>

        <Image source={require("./assets/Images/land.png")} style={styles.profileImage} />

        {!isOtpGenerated ? (
          <View style={styles.inputContainer}>
            <FontAwesome name="user" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email id"
              onChangeText={setStudEmail}
              value={studEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter the OTP"
              onChangeText={setOtp}
              value={otp}
              keyboardType="numeric"
            />
          </View>
        )}

        <Pressable
          style={styles.loginBtn}
          onPress={isOtpGenerated ? handleVerifyOtp : handleGenerateOtp}
        >
          <Text style={styles.loginText}>
            {isOtpGenerated ? "Verify OTP" : "Generate OTP"}
          </Text>
        </Pressable>
      </ScrollView>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05, 
  },
  profileImage: {
    width: width * 0.9,  
    height: height * 0.3, 
    resizeMode: 'contain',
    marginBottom: height * 0.02,
  },
  title: { 
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.05,
    marginBottom: height * 0.02, 
    textAlign: "center",
    color:"#8968CD"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.02,
    borderBottomWidth: 2,
    borderBottomColor: "#8968CD",
  },
  icon: {
    fontSize: width * 0.06, 
    color: "#8968CD",
    marginRight: width * 0.03,
  },
  input: {
    flex: 1, 
    height: height * 0.06, 
    color: "black",
    fontSize: width * 0.04,
    fontFamily: "Poppins-Medium",
  },
  loginBtn: {
    backgroundColor: "#5751E1",
    width: width * 0.6,
    height: height * 0.06, 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 10,
    marginTop: height * 0.03,
  },
  loginText: {
    color: "white",
    fontSize: width * 0.045, 
    fontWeight: "bold",
  },
});
