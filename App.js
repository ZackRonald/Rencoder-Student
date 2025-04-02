import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Login";  
import ScrollBar from "./Components/ScrollBar";  
import Profile from "./Pages/Profile";  
import Course from "./Pages/CourseDetials";  
import Upcoming from "./Pages/Upcoming";
import  Navi from "./Pages/Navigation";
import Payment  from "./Pages/Payment"; 
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={ScrollBar} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Navi" component={Navi} />
        <Stack.Screen name="Course" component={Course} />
        <Stack.Screen name="Upcoming" component={Upcoming} />
        <Stack.Screen name="Payment" component={Payment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
