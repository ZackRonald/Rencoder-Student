import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFonts } from 'expo-font';

const Navbar = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/Fonts/Poppins/Poppins-Medium.ttf')
  });

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position:"relative",
     
      width:"100%"
      }}
    >
      <Text style={{ color: "#8968CD", fontSize: 20, fontFamily: "Poppins-Medium" }}>
        Rencoder
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate("Navi")}>  
      <FontAwesome name="cog" size={30} color="#8968CD"/>
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;
