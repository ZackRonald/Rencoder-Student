import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

function Payment() {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]); // Set initial state to an empty array

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                console.log("Entered");
                const studEmail = await SecureStore.getItemAsync('userEmail');
                console.log(studEmail);

                // Check if email exists
                if (!studEmail) {
                    Alert.alert("Error", "No user email found. Please log in again.");
                    return;
                }

                const response = await axios.get('http://192.168.141.158:5000/getCourse', {
                    params: { studEmail }, // Send email in the query params
                });

                // Check if the response contains the 'courses' array and it's wrapped in another array
                if (response.data && response.data[0] && response.data[0].courses) {
                    setCourses(response.data[0].courses);  // Access courses inside the object
                } else {
                    Alert.alert("Error", "No courses found.");
                }

            } catch (error) {
                Alert.alert("Error", "Failed to fetch courses. Please try again.");
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();

    }, []);  // Empty dependency array to run once on component mount

    const handlePayment = (courseId) => {
        // Update the payment status to 'Paid' for the course
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.courseID === courseId ? { ...course, paymentStatus: 'Paid' } : course
            )
        );
        Alert.alert("Payment", "Payment process initiated!");
    };

    return (
        <SafeAreaView style={styles.container}>
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
                                <Text style={styles.label}>Amount:</Text>
                                <Text style={styles.value}>{course.coursePrice || "N/A"}</Text>
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
        </SafeAreaView>
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
        zIndex: 1,  // Ensure the top bar stays on top of other content
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
       bottom:60,// This makes room for the top bar
        top:40  
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
        top: 40,
        
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
});

export default Payment;