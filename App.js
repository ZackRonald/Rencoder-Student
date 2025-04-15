import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Login";  
import ScrollBar from "./Components/ScrollBar";  
import Profile from "./Pages/Profile";  
import Course from "./Pages/CourseDetials";  
import Upcoming from "./Pages/Upcoming";
import  Navi from "./Pages/Navigation";
import PaymentBar from "./Components/PaymentBar";
import Payment  from "./Pages/Payment"; 
import PaymentHistory from "./Pages/PaymentHistory";
import Toast from 'react-native-toast-message';
import Certificate from "./Pages/Certificate";
const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={ScrollBar} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Certificate" component={Certificate} />
          <Stack.Screen name="Navi" component={Navi} />
          <Stack.Screen name="Course" component={Course} />
          <Stack.Screen name="Upcoming" component={Upcoming} />
          <Stack.Screen name="Payment" component={PaymentBar} />
          <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
        </Stack.Navigator>
      </NavigationContainer>

      <Toast /> 
    </>
  );
}

