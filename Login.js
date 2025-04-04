import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text,ScrollView, View, Image, TextInput, Pressable, Dimensions 
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from 'expo-font';
import { storeToken ,storeEmail} from "./utils/auth";  
import axios from "axios";
import React,{useEffect, useState} from 'react';
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { Alert } from 'react-native';




const { width, height } = Dimensions.get("window");



export default function Login() {

  const [studEmail, setStudEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState('');
  const [isOtpGenerated, setIsOtpGenerated] = useState(false);
  const navigation = useNavigation();

  const handleGenerateOtp = async () => {
    try {
        const response = await axios.post('http://192.168.4.60:5000/generateOtp', { studEmail });

        if (response.status === 200) {
            setIsOtpGenerated(true); 
            await storeEmail(studEmail); 
            setMessage("OTP sent to your email!");
            Alert.alert("Success", "OTP has been sent to your email.");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to generate OTP. Please try again.";
        Alert.alert("Error", errorMessage);
        console.error("Generate OTP Error:", errorMessage);
    }
};

const handleVerifyOtp = async () => {
    try {
        const response = await axios.post('http://192.168.4.60:5000/verifyOtp', { email: studEmail, otp });

        if (response.status === 200) {
            setMessage("OTP verified successfully!");
            Alert.alert("Success", "OTP verified!");
            await storeToken(response.data.token);  
            setOtp('');
            navigation.replace("Home");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
        Alert.alert("Error", errorMessage);
        console.error("Verify OTP Error:", errorMessage);
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
        console.error("Error retrieving status:", error);
        navigation.replace("Login");
      }
    };
  
    checkStatus();
  }, []);
  

  
 
  

  return (
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
      />
    </View>
  ) : (
    <View style={styles.inputContainer}>
      <FontAwesome name="lock" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Enter the OTP"
        secureTextEntry
        onChangeText={setOtp}
        value={otp}
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
    backgroundColor: "#5751E1",//8968CD
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
