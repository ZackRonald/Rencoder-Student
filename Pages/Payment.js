import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

function Payment() {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [stack, setStack] = useState('');
    const [courseID, setCourseID] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentType, setPaymentType] = useState('Full');
    const [partialAmount, setPartialAmount] = useState('');
    const [dueAmount, setDueAmount] = useState(0);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const studEmail = await SecureStore.getItemAsync('userEmail');
                if (!studEmail) {
                    Alert.alert("Error", "No user email found. Please log in again.");
                    return;
                }

                const response = await axios.get('http://192.168.4.60:5000/getCourse', {
                    params: { studEmail },
                });

                if (response.data && response.data[0] && response.data[0].courses) {
                    setCourses(response.data[0].courses);
                } else {
                    Alert.alert("Error", "No courses found.");
                }

            } catch (error) {
                Alert.alert("Error", "Failed to fetch courses. Please try again.");
            }
        };

        fetchCourses();
    }, []);

    const handlePayment = async () => {
        try {
            const studEmail = await SecureStore.getItemAsync('userEmail');
            const amountPaid = paymentType === 'Full' ? totalAmount : parseFloat(partialAmount);

            const response = await axios.post('http://192.168.4.60:5000/payment', {
                studEmail,
                stack,
                amountPaid,
                paymentType,
            });

            if (response.status === 200) {
                Alert.alert("Success", "Payment updated successfully");
                setIsModalVisible(false);
            } else {
                Alert.alert("Error", "Payment update failed");
            }
        } catch (error) {
            Alert.alert("Error", "Payment processing failed");
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Navi')}
                >
                    <Ionicons name="arrow-back" size={28} color="#8968CD" />
                </TouchableOpacity>
                <Text style={styles.topBarText}>Payment</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {courses.map((course, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.left}>
                            <View>
                                <Text style={styles.label}>Stack:</Text>
                                <Text style={styles.value}>{course.stack || "N/A"}</Text>
                            </View>
                            <View>
                                <Text style={styles.label}>Subjects:</Text>
                                {course.subjects?.map((subject, idx) => (
                                    <Text key={idx} style={styles.value}>{subject.subject}</Text>
                                ))}
                            </View>
                            <View>
                                <Text style={styles.label}>Amount:</Text>
                                <Text style={styles.value}>{course.coursePrice || "N/A"}</Text>
                            </View>
                                     
                        </View>

                        <View style={styles.right}>
                            <View>
                                <Text style={styles.label}>Course ID:</Text>
                                <Text style={styles.value}>{course.courseID || "N/A"}</Text>
                            </View>
                            <View>
                                <Text style={styles.label}>Start Date:</Text>
                                <Text style={styles.value}>{course.startDate || "N/A"}</Text>
                            </View>
                         
                            <View>
                                <Text style={styles.label}>Payment Status:</Text>
                                <Text style={styles.value}>{course.paymentStatus || "N/A"}</Text>
                            </View>
                            <View style={styles.btnContainer}>
                                <TouchableOpacity
                                    onPress={() => handlePayment(course.courseID)}
                                    disabled={course.paymentStatus === 'Paid'}
                                >
                                    <Text style={styles.btnText}>
                                        {course.paymentStatus === 'Paid' ? 'Paid' : 'Pay'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={isModalVisible} transparent animationType="slide">
    <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.row}>
                <View style={styles.leftColumn}>
                    <Text style={styles.label}>Stack:</Text>
                    <Text style={styles.value}>MERN</Text>
                </View>
                <View style={styles.rightColumn}>
                    <Text style={styles.label}>Course ID:</Text>
                    <Text style={styles.value}>MERN2333</Text>
                </View>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.label}>Total Amount:</Text>
                <Text style={styles.value}>5000</Text>
            </View>
            <Picker
                selectedValue={paymentType}
                style={styles.picker}
                onValueChange={(itemValue) => setPaymentType(itemValue)}
            >
                <Picker.Item label="Full Amount" value="Full" />
                <Picker.Item label="Partial Amount" value="Partial" />
            </Picker>
            {paymentType === 'Full' ? (
                <Text style={styles.infoText}>You are paying the full amount.</Text>
            ) : (
                <TextInput
                    style={styles.input}
                    placeholder="Enter Partial Amount"
                    keyboardType="numeric"
                    value={partialAmount}
                    onChangeText={(text) => setPartialAmount(text)}
                />
            )}
            <Text style={styles.dueText}>Due Amount: </Text>
            <Text >5000</Text>
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8968CD',
    },
    topBar: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: 40,
        left: 0,
        width: '100%',
        height: 60,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 5,
        zIndex: 1,  
    },
    topBarText: {
        color: '#8968CD',
        fontSize: 28,
        fontWeight: 'bold',
        padding: 10,
    },
    backButton: {
        left: 10,
    },
    scrollViewContent: {
        paddingTop: 30, // Space for the top bar
        paddingBottom: 80, // Some extra space at the bottom
    },
    card: {
        marginTop: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(137, 104, 205, 0.85)',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#8968CD',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        gap: 60,
        top: 60,
        width:"95%",
        left:10
        
    },
    left: {
        gap: 10,
    },
    right: {
        gap: 10,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    value: {
        color: '#E0D7F7',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    btnContainer: {
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#8968CD',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    leftColumn: {
        marginRight: 20,
    },
    rightColumn: {
        marginLeft: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        width: '80%',
        marginVertical: 10,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    value: {
        color: '#E0D7F7',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 10,
        width: '80%',
        borderRadius: 5,
    },
    infoText: {
        fontSize: 16,
        marginVertical: 5,
        color: 'green',
    },
    dueText: {
        fontSize: 16,
        marginVertical: 5,
        color: 'red',
    },
    payButton: {
        backgroundColor: '#8968CD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 15,
    },
    payButtonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default Payment;