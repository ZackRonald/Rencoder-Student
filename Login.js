import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text,ScrollView, View, Image, TextInput, Pressable, Dimensions 
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from 'expo-font';
import { storeToken } from "./utils/auth";  
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
  const navigation = useNavigation();
  const handleLogin = async () => {
    try {
      console.log("Attempting login...");
      const response = await axios.post("http://192.168.194.158:5000/login", { studEmail, password });
      console.log("Server Response:", response.data);
  
      if (response.data.token) {
        console.log("Entered Token Verification");
  
        await storeToken(response.data.token, studEmail);
  
        navigation.replace("Home");
        setMessage("Logged in successfully!");
      } else {
        setMessage("Login failed, no token received");
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setMessage(errorMessage);
      Alert.alert("Login Error", errorMessage);
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
      
      <View style={styles.inputContainer}>
        <FontAwesome name="user" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Enter your email id" onChangeText={setStudEmail} value={studEmail} />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Enter your password" secureTextEntry onChangeText={setPassword} value={password} />
      </View>

      <Pressable style={styles.loginBtn}>
        <Text style={styles.loginText}  onPress={handleLogin}>Login</Text>
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
