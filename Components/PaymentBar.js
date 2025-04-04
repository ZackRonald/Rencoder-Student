import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Payment from "../Pages/Payment";
import PaymentHistory from "../Pages/PaymentHistory";
import UpcomingPayment from "../Pages/UpcomingPayment";

const Tab = createBottomTabNavigator();

const PaymentBar = () => {
  return (
    <Tab.Navigator
      initialRouteName="Payment"
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
        name="Payment"
        component={Payment}
        options={{
          title: "Payment",
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="credit-card"
              size={24}
              color={focused ? "#8968CD" : "black"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Payment History"
        component={PaymentHistory}
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="history"
              size={24}
              color={focused ? "#8968CD" : "black"}
            />
          ),
        }}
      />
     <Tab.Screen
        name="Upcoming Payment"
        component={UpcomingPayment}
        options={{
          title: "Upcoming",
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="calendar-check-o"
              size={24}
              color={focused ? "#8968CD" : "black"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default PaymentBar;
