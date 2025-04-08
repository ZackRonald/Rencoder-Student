import React, { useEffect, useState,useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,TouchableOpacity } from "react-native";
import axios from "axios";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


import { useFocusEffect } from "@react-navigation/native";

const PaymentHistory = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPaymentHistory(); // Replace with your function
    }, [])
  );

  const fetchPaymentHistory = async () => {
    try {
      const studEmail = "oswald@gmail.com"; 
      const response = await axios.get(`http://192.168.194.158:5000/history?studEmail=${studEmail}`);
      setCourses(response.data);
      console.log(response.data[0]);
      
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#8968CD" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Navi')}>
                        <Ionicons name="arrow-back" size={28} color="#8968CD" />
                    </TouchableOpacity>
                    <Text style={styles.topBarText}>History</Text>
                </View>
  
      {courses.filter((course) => course.paymentHistory.length > 0).length === 0 ? (
        <Text style={styles.noData}>No payment history available.</Text>
      ) : (
        courses
          .filter((course) => course.paymentHistory.length > 0) // Only show courses with transactions
          .map((course, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{course.stack} - {course.courseID}</Text>
              <Text style={styles.text}><Text style={styles.label}>Start Date:</Text> {course.startDate}</Text>
              <Text style={styles.text}><Text style={styles.label}>Course Price:</Text> ${course.coursePrice}</Text>
              <Text style={styles.text}><Text style={styles.label}>Payment Type:</Text> {course.paymentType}</Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Due Amount:</Text> 
                <Text style={course.dueAmount === 0 ? styles.paid : styles.due}> ${course.dueAmount}</Text>
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Status:</Text> 
                <Text style={course.paymentStatus === "Paid" ? styles.paid : styles.pending}>
                  {course.paymentStatus}
                </Text>
              </Text>
  
              <View style={styles.divider} />
              <Text style={styles.subtitle}>Payment Transactions:</Text>
  
              {course.paymentHistory.map((transaction, tIndex) => (
                <View key={tIndex} style={styles.paymentRow}>
                  <Text style={styles.paymentText}>Paid: ${transaction.amountPaid}</Text>
                  <Text style={styles.paymentText}>Date: {transaction.date}</Text>
                </View>
              ))}
            </View>
          ))
      )}
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    
    backgroundColor: "#8968CD", // Keeping as is
  },
  topBar: { 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: "space-between", 
    backgroundColor: '#fff', 
    height: 70,
    marginBottom: 60,
    top: 0
  },
  
  topBarText: { fontSize: 24, 
    fontWeight: 'bold',
     color: '#8968CD',
     fontFamily: 'Poppins-Bold',  
     right:20
     },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.12)", // Keeping as is
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 16,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    width: "90%",
    alignSelf: "center",
     // Better for Android shadows
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
    letterSpacing: 0.8,
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
    color: "#ddd",
    lineHeight: 20,
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
 paid: {
  color: "#2ECC71", // Soft green
  fontWeight: "bold",
},

due: {
  color: "#E74C3C", // Softer red, not too harsh
  fontWeight: "bold",
},

pending: {
  color: "#F1C40F",
  fontWeight: "bold",
},
divider: {
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#fff",
    letterSpacing: 0.7,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  noTransactions: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#bbb",
  },
  noData: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#ddd",
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
    alignSelf: "center",
  },
});


export default PaymentHistory;
