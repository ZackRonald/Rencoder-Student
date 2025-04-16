import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from "react-native";
import axios from "axios";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import Loader from "../Components/AnimatedLoader";

const { width, height } = Dimensions.get("window");

const PaymentHistory = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPaymentHistory();
    }, [])
  );

  const fetchPaymentHistory = async () => {
    try {
      const studEmail = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("authToken");

      const response = await axios.get(
        `http://192.168.1.4:5000/history`,
        {
          params: { studEmail },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (history) => {
    setSelectedHistory(history);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </View>
      </Modal>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}  // Hides vertical scrollbar
    showsHorizontalScrollIndicator={false} >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Navi')}>
          <Ionicons name="arrow-back" size={28} color="#8968CD" />
        </TouchableOpacity>
        <Text style={styles.topBarText}>History</Text>
      </View>

      {courses.filter(course => course.paymentHistory.length > 0).length === 0 ? (
        <Text style={styles.noData}>No payment history available.</Text>
      ) : (
        courses
          .filter(course => course.paymentHistory.length > 0)
          .map((course, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{course.stack} - {course.courseID}</Text>
              <Text style={styles.text}><Text style={styles.label}>Start Date:</Text> {course.startDate}</Text>
              <Text style={styles.text}><Text style={styles.label}>Course Price:</Text> ₹{course.coursePrice}</Text>
              <Text style={styles.text}><Text style={styles.label}>Payment Type:</Text> {course.paymentType}</Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Due Amount:</Text>
                <Text style={course.dueAmount === 0 ? styles.paid : styles.due}> ₹{course.dueAmount}</Text>
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Status:</Text>
                <Text style={course.paymentStatus === "Paid" ? styles.paid : styles.pending}>
                  {course.paymentStatus}
                </Text>
              </Text>

              <View style={styles.divider} />
              <Text style={styles.subtitle}>Payment Transactions:</Text>
              <TouchableOpacity onPress={() => openModal(course.paymentHistory)}>
                <Text style={{ color: "#00FFFF", fontWeight: "600" }}>View All Transactions</Text>
              </TouchableOpacity>
            </View>
          ))
      )}

<Modal visible={isModalVisible} transparent={true} animationType="slide">
  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", padding: 20 }}>
    <ScrollView>
      <TouchableOpacity onPress={() => setModalVisible(false)} style={{ alignSelf: 'flex-end' }}>
        <Ionicons name="close-circle" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={[styles.subtitle, { marginBottom: 20 }]}>Transactions</Text>

      {selectedHistory.length > 0 ? (
        <View>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableHeaderText}>Amount</Text>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Transaction ID</Text>
          </View>

          {/* Table Rows */}
          {selectedHistory.map((transaction, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>₹{transaction.amountPaid}</Text>
              <Text style={styles.tableCell}>{transaction.date}</Text>
              <Text style={styles.tableCell}>{transaction.transactionID}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noTransactions}>No transactions found.</Text>
      )}
    </ScrollView>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#8968CD",
    paddingBottom: height * 0.1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    backgroundColor: '#fff',
    height: height * 0.08,
    marginBottom: height * 0.05,
    paddingHorizontal: width * 0.04,
    top: 0,
  },
  topBarText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#8968CD',
    fontFamily: 'Poppins-Bold',
    right: width * 0.05,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: width * 0.05,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: height * 0.02,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    width: width * 0.9,
    alignSelf: "center",
  },
  cardTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.01,
    color: "#fff",
    letterSpacing: 0.8,
  },
  text: {
    fontSize: width * 0.035,
    marginBottom: height * 0.008,
    color: "#ddd",
    lineHeight: height * 0.025,
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  paid: {
    color: "#2ECC71",
    fontWeight: "bold",
  },
  due: {
    color: "#E74C3C",
    fontWeight: "bold",
  },
  pending: {
    color: "#F1C40F",
    fontWeight: "bold",
  },
  divider: {
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: height * 0.015,
  },
  subtitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    marginBottom: height * 0.01,
    color: "#fff",
    letterSpacing: 0.7,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: width * 0.03,
    borderRadius: 8,
    marginTop: height * 0.01,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  paymentText: {
    fontSize: width * 0.035,
    fontWeight: "500",
    color: "#fff",
  },
  noTransactions: {
    fontSize: width * 0.035,
    fontStyle: "italic",
    color: "#bbb",
    marginTop: height * 0.02,
    textAlign: "center",
  },
  noData: {
    fontSize: width * 0.04,
    fontStyle: "italic",
    textAlign: "center",
    color: "#ddd",
    marginTop: height * 0.02,
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noTransactions: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  tableHeader: {
    backgroundColor: '#333',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#555',
  },
  tableHeaderText: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#444',
  },
  tableCell: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
  },
});

export default PaymentHistory;

