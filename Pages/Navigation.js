import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from "axios";
import { useNavigation } from '@react-navigation/native';

function Navigations() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.setItemAsync('status','Inactive') 

      Alert.alert("Success", "Logged out successfully!");

      navigation.replace('Login');
    } catch (error) {
      console.error("Error clearing local storage:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topbar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        <Text style={styles.head}>Settings</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profile')}>
        <MaterialIcons name="person" size={40} color="#8968CD" />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}  onPress={() => navigation.navigate('Payment')}>
        <Ionicons name="card" size={40} color="#8968CD" />
        <Text style={styles.label}>Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={40} color="#8968CD" />
        <Text style={styles.label}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8968CD",
    paddingVertical: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    height: 80,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black"
  },
  topbar: {
    backgroundColor: '#9400D3',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 60,
    justifyContent: "space-between",
    flexDirection:"row",
    alignItems: "center",
  },
  head: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginRight:30
  },
  backButton:{
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
    
  }
});

export default Navigations;
