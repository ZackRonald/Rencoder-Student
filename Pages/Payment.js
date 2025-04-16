import React, { useState, useEffect } from "react";
import {View,Text,TextInput,Modal,StyleSheet,TouchableOpacity,ScrollView,Image,Dimensions} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useFonts } from "expo-font";
import Toast from 'react-native-toast-message';
import Loader from "../Components/AnimatedLoader";

const { width, height } = Dimensions.get("window");

function Payment() {
  const navigation = useNavigation();
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentType, setPaymentType] = useState("Full");
  const [partialAmount, setPartialAmount] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("../assets/Fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/Fonts/Poppins/Poppins-Medium.ttf"),
  });

  
  

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCourses();
  }, [refresh]);
  

  const openPaymentModal = (course) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
    setPaymentType("Full");
    setPartialAmount("");
  };
  const fetchCourses = async () => {
    try {
      const studEmail = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("authToken");
  
      if (!studEmail || !token) {
        Toast.show({
          type: 'error',
          text1: 'Missing credentials',
          text2: 'Please log in again.',
        });
        setLoading(false);
        return;
      }
  
      const response = await axios.get(
        "http://192.168.1.4:5000/courseDetails",
        {
          params: { studEmail },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const courses = response.data;
  
      if (!Array.isArray(courses)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid course data',
        });
        setLoading(false);
        return;
      }
  
      const unpaidCourses = courses.filter(
        (course) => course.payment?.paymentStatus !== "Paid"
      );
  
      setCourses(unpaidCourses);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch courses',
      });
    } finally {
      setLoading(false); 
    }
  };
  
  
  const handlePayment = async () => {
    if (!selectedCourse) return;
  
    try {
      const studEmail = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("authToken");
      const amountPaid =
        paymentType === "Full"
          ? selectedCourse.payment.dueAmount
          : parseFloat(partialAmount);
  
      if (paymentType === "Partial") {
        const numericAmount = parseFloat(partialAmount);
  
        if (!partialAmount || numericAmount < 2000) {
          Toast.show({
            type: 'error',
            text1: 'Minimum amount should be at least ₹2000.',
          });
          return;
        }
  
        if (numericAmount > selectedCourse.payment.dueAmount) {
          Toast.show({
            type: 'error',
            text1: 'Amount exceeds due.',
          });
          return;
        }
      }
  
      const response = await axios.post(
        "http://192.168.1.4:5000/payment",
        {
          studEmail,
          stack: selectedCourse.stack,
          amountPaid,
          paymentType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Payment successful!',
        });
        setIsModalVisible(false);
        setRefresh(!refresh);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment update failed.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Payment processing failed.',
      });
    }
  };
  
  if (loading) {
    return (
      <Modal
  transparent={true}
  visible={loading}
  animationType="fade"
>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Navi")}
        >
          <Ionicons name="arrow-back" size={28} color="#8968CD" />
        </TouchableOpacity>
        <Text style={styles.topBarText}>Payment</Text>
      </View>

      {courses.length > 0 ? (
        <View style={styles.scrollViewContent}>
          {courses.map((course, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.left}>
                <Text style={styles.labelM}>Stack:</Text>
                <Text style={styles.valueM}>{course.stack || "N/A"}</Text>

                <Text style={styles.labelM}>Course Price:</Text>
                <Text style={styles.valueM}>
                  ₹{course.payment.coursePrice || "N/A"}
                </Text>

                <Text style={styles.labelM}>Due Amount:</Text>
                <Text style={styles.valueM}>
                  ₹{course.payment.dueAmount || "N/A"}
                </Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.labelM}>Course ID:</Text>
                <Text style={styles.valueM}>{course.courseID || "N/A"}</Text>

                <Text style={styles.labelM}>Payment Status:</Text>
                <Text style={styles.valueM}>
                  {course.payment.paymentStatus || "N/A"}
                </Text>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => openPaymentModal(course)}
                >
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noPaymentContainer}>
          <Text style={styles.noPaymentText}>All fees are paid!</Text>
          <Image
            source={require("../assets/Images/paid.png")}
            style={styles.paidImage}
          />
        </View>
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedCourse && (
              <>
                <View style={styles.cardMini}>
                  <Text style={styles.label}>Stack:</Text>
                  <Text style={styles.value}>{selectedCourse.stack}</Text>
                </View>
                <View style={styles.cardMini}>
                  <Text style={styles.label}>Course ID:</Text>
                  <Text style={styles.value}>{selectedCourse.courseID}</Text>
                </View>
                <View style={styles.cardMini}>
                  <Text style={styles.label}>Course Price:</Text>
                  <Text style={styles.value}>
                    ₹{selectedCourse.payment.coursePrice}
                  </Text>
                </View>
                <View style={styles.cardMini}>
                  <Text style={styles.label}>Due Amount:</Text>
                  <Text style={styles.value}>
                    ₹{selectedCourse.payment.dueAmount}
                  </Text>
                </View>

                <View
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                  }}
                >
                <Picker
  selectedValue={paymentType}
  onValueChange={(itemValue) => {
    if (itemValue === "Partial" && selectedCourse.payment.dueAmount < 2000) {
      Toast.show({
        type: 'info',
        text1: 'Partial payment not allowed',
        text2: 'Amount is below ₹2000',
        position: 'bottom',
        visibilityTime: 2500,
      });
    } else {
      setPaymentType(itemValue);
    }
  }}
>
  <Picker.Item label="Full Amount" value="Full" />
  <Picker.Item
    label="Partial Amount"
    value="Partial"
    enabled={selectedCourse.payment.dueAmount > 2000} 
  />
</Picker>


                </View>

                {paymentType === "Partial" && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Partial Amount"
                    keyboardType="numeric"
                    value={partialAmount}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, "");
                      setPartialAmount(numericValue);
                    }}
                  />
                )}

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handlePayment}
                >
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#8968CD",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: width * 0.04,
    marginBottom: height * 0.02,
  },
  topBarText: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#8968CD",
    fontFamily: "Poppins-Bold",
  },
  backButton: {
    marginRight: 10,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: width * 0.05,
    marginHorizontal: width * 0.03,
    marginBottom: height * 0.02,
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  left: { flex: 1 },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  label: {
    fontSize: width * 0.04,
    fontFamily: "Poppins-Bold",
  },
  value: {
    fontSize: width * 0.04,
    marginBottom: 10,
  },
  labelM: {
    fontSize: width * 0.04,
    fontFamily: "Poppins-Bold",
    color: "#E6E6FA",
  },
  valueM: {
    fontSize: width * 0.04,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  payButton: {
    backgroundColor: "#00FFFF",
    paddingVertical: height * 0.015,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginTop: height * 0.02,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.6)",
  },
  payButtonText: {
    color: "#001F3F",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: width * 0.06,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  cardMini: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cancelButton: {
    marginTop: height * 0.02,
    width: "100%",
    paddingVertical: height * 0.015,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F44336",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  paidImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginTop: height * 0.02,
  },
  noPaymentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  noPaymentText: {
    fontSize: width * 0.07,
    color: "white",
    fontFamily: "Poppins-Bold",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    marginTop: height * 0.015,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: width * 0.03,
  },
});

export default Payment;
