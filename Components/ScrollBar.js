import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import HomeScreen from "../Pages/HomeScreen";
import Upcoming from "../Pages/Upcoming";
import Course from "../Pages/CourseDetials";


const Tab = createBottomTabNavigator();

const ScrollBar = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          elevation: 10,
          shadowOpacity: 0.1,
          height: 60,
        },
        tabBarActiveTintColor: "#8968CD",
        tabBarInactiveTintColor: "black",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="home" size={24} color={focused ? "#8968CD" : "black"} />
          ),
        }}
      />
      <Tab.Screen
        name="Course"
        component={Course}
        options={{
          title: "Course",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="book" size={24} color={focused ? "#8968CD" : "black"} />
          ),
        }}
      />
      <Tab.Screen
        name="Upcoming"
        component={Upcoming}
        options={{
          title: "Upcoming",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="calendar" size={24} color={focused ? "#8968CD" : "black"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ScrollBar;
