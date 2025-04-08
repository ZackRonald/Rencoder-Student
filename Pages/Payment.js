import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';


function Payment() {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [paymentType, setPaymentType] = useState('Full');
    const [partialAmount, setPartialAmount] = useState('');
    const [refresh, setRefresh] = useState(false);

    
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/Fonts/Poppins/Poppins-Medium.ttf')
  });

    const fetchCourses = async () => {
        try {
            const studEmail = await SecureStore.getItemAsync('userEmail');
            if (!studEmail) {
                Alert.alert("Error", "No user email found. Please log in again.");
                return;
            }

            const response = await axios.get('http://192.168.194.158:5000/getCourse', {
                params: { studEmail },
            });

            if (response.data?.[0]?.courses) {
                // Filter out courses that are fully paid
                const unpaidCourses = response.data[0].courses.filter(course => course.payment.paymentStatus !== 'Paid');
                setCourses(unpaidCourses);
            } else {
                Alert.alert("Error", "No courses found.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch courses.");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [refresh]);

    const openPaymentModal = (course) => {
        setSelectedCourse(course);
        setIsModalVisible(true);
        setPaymentType("Full"); 
        setPartialAmount('');
    };

    const handlePayment = async () => {
        if (!selectedCourse) return;

        try {
            const studEmail = await SecureStore.getItemAsync('userEmail');
            const amountPaid = paymentType === 'Full' ? selectedCourse.payment.dueAmount : parseFloat(partialAmount);

            if (paymentType === 'Partial') {
                const numericAmount = parseFloat(partialAmount);

                if (!partialAmount || numericAmount < 2000) {
                    Alert.alert("Error", "Minimum amount should be at least 2000.");
                    return;
                }

                if (numericAmount > selectedCourse.payment.dueAmount) {
                    Alert.alert("Error", "Entered amount cannot exceed the due amount.");
                    return;
                }
            }

            const response = await axios.post('http://192.168.194.158:5000/payment', {
                studEmail,
                stack: selectedCourse.stack,
                amountPaid,
                paymentType,
            });

            if (response.status === 200) {
                Alert.alert("Success", "Payment updated successfully");
                setIsModalVisible(false);
                setRefresh(!refresh);
            } else {
                Alert.alert("Error", "Payment update failed");
            }
        } catch (error) {
            Alert.alert("Error", "Payment processing failed");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Navi')}>
                    <Ionicons name="arrow-back" size={28} color="#8968CD" />
                </TouchableOpacity>
                <Text style={styles.topBarText}>Payment</Text>
            </View>

            {courses.length > 0 ? (
                <View Style={styles.scrollViewContent}>
                    {courses.map((course, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.left}>
                                <Text style={styles.labelM}>Stack:</Text>
                                <Text style={styles.valueM}>{course.stack || "N/A"}</Text>

                                <Text style={styles.labelM}>Course Price:</Text>
                                <Text style={styles.valueM}>₹{course.payment.coursePrice || "N/A"}</Text>

                                <Text style={styles.labelM}>Due Amount:</Text>
                                <Text style={styles.valueM}>₹{course.payment.dueAmount || "N/A"}</Text>
                            </View>

                            <View style={styles.right}>
                                <Text style={styles.labelM}>Course ID:</Text>
                                <Text style={styles.valueM}>{course.courseID || "N/A"}</Text>

                                <Text style={styles.labelM}>Payment Status:</Text>
                                <Text style={styles.valueM}>{course.payment.paymentStatus || "N/A"}</Text>

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
                    <Image source={require('../assets/Images/paid.png')} style={styles.paidImage} />
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
<Text style={styles.value}>₹{selectedCourse.payment.coursePrice}</Text>
                                </View>
                              
                                
                                <View style={styles.cardMini}>
                                <Text style={styles.label}>Due Amount:</Text>
<Text style={styles.value}>₹{selectedCourse.payment.dueAmount}</Text>
                                </View>
                                <View style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
    <Picker
        selectedValue={paymentType}
        onValueChange={(itemValue) => setPaymentType(itemValue)}
    >
        <Picker.Item label="Full Amount" value="Full" />
        <Picker.Item label="Partial Amount" value="Partial" />
    </Picker>
</View>

                                {paymentType === 'Partial' && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Partial Amount"
                                        keyboardType="numeric"
                                        value={partialAmount}
                                        onChangeText={(text) => {
                                            const numericValue = text.replace(/[^0-9]/g, '');
                                            setPartialAmount(numericValue);
                                        }}
                                    />
                                )}

                                <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                                    <Text style={styles.payButtonText}>Pay</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
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
    container: { flexGrow: 1, 
        backgroundColor: '#8968CD' ,
        paddingBottom: 20,
         paddingTop: 40
    
    },

    topBar: { 
        flexDirection: 'row',
         alignItems: 'center',
         justifyContent:"space-between", 
         backgroundColor: '#fff', 
         padding: 16 ,
       bottom:40
    },
    topBarText: { fontSize: 24, 
        fontWeight: 'bold',
         color: '#8968CD',
         fontFamily: 'Poppins-Bold'  
         },

    backButton: { 
        marginRight: 10 
    },

    scrollViewContent: { 
        paddingBottom: 40,
        paddingTop:40,
        
     },

     card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        margin: 10,
        borderRadius: 10,
        justifyContent: 'space-between', // Distributes content evenly
        alignItems: 'center',
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        padding: 20,
        borderRadius: 20,
        shadowColor: "#00FFFF",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.3)",
        // Keeps items aligned properly
    },
    left: {
        flex: 1, // Ensures both left and right sections take equal space
        justifyContent: 'center',
    },
    right: {
        flex: 1,
        alignItems: 'flex-end', // Aligns content to the right
    },
    
    label: { 
        fontSize: 16, 
        fontFamily: 'Poppins-Bold'  
     },

    value: { 
        fontSize: 16, 
        marginBottom: 10,
        // fontFamily: 'Poppins-Medium'  
    },
    labelM: { 
        fontSize: 16, 
        fontFamily: 'Poppins-Bold',
        color: "#E6E6FA",  
     },

    valueM: { 
        fontSize: 16, 
        marginBottom: 10,
        color: "#FFFFFF",
    },

    payButton: { 
        backgroundColor: '#00FFFF', // Matching the card's glow
        paddingVertical: 12,
        width: '100%',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#00FFFF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(0, 255, 255, 0.6)",
    },
    
    payButtonText: { 
        color: '#001F3F', // Deep blue for contrast
        fontWeight: 'bold',
        fontSize: 16,
    },
    

    modalContainer: { 
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker overlay
    },
    
    modalContent: { 
        backgroundColor: 'white', 
        padding: 25, 
        borderRadius: 15, 
        width: '90%', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10, // For Android shadow
    },
    
    cardMini: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    
 
    
    cancelButton: { 
        marginTop: 10,
        width: '100%',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#F44336',
    },
    
    cancelButtonText: { 
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    
    paidImage: { 
        width: 300,
         height: 300, 
         marginTop: 10 
        },
        noPaymentContainer: { 
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        
        noPaymentText: { 
            fontSize: 30, 
            color: 'white', 
            fontFamily: 'Poppins-Bold',
          
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 5,
            marginBottom: 10,
        },
        

});

export default Payment;
