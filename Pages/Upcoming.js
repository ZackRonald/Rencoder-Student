import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


function Upcoming() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");

      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");

      if (!token || !email) {
        console.error("Token or Email not found");
        return;
      }

      const response = await axios.post(
        "http://192.168.194.158:5000/subjects",
        { studEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Full response data:", response.data);

      const coursesData = response.data?.courses || [];
      if (!Array.isArray(coursesData)) {
        console.error("Courses data is not an array:", coursesData);
        setCourses([]);
        return;
      }

      // Filter upcoming courses
      const upcomingCourses = coursesData.flatMap(course =>
        (course.subjects || []).filter(subject => subject.status === "Upcoming").map(subject => ({
          stack: course.stack || "N/A",
          subject: subject.subject || "N/A",
          startDate: subject.startDate || "N/A",
          status: subject.status || "N/A",
          trainerName: subject.trainerName || "N/A",
          time: subject.time || "N/A",
        }))
      );

      setCourses(upcomingCourses);
      console.log("Upcoming courses:", upcomingCourses);
    } catch (error) {
      console.error("Error fetching courses:", error.response?.data || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [])
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
      <Text style={styles.heading}>Upcoming Classes</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
       
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <View key={index} style={styles.cards}>
              <Text style={styles.head}>{course.stack}</Text>
              <View style={styles.container}>
                <View style={styles.left}>
                  <View>
                    <Text style={styles.label}>Subject</Text>
                    <Text style={styles.value}>{course.subject}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Start Date</Text>
                    <Text style={styles.value}>{course.startDate}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>{course.status}</Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <View>
                    <Text style={styles.label}>Trainer Name</Text>
                    <Text style={styles.value}>{course.trainerName}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Time</Text>
                    <Text style={styles.value}>{course.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No upcoming classes found</Text>
        )}
      </ScrollView>
    </View>
  );
}   

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#8968CD",
    
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    left:10,
    top:5
  },
  cards: {
    backgroundColor: "#4B0082",
    
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 10,
    width: "90%",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flex: 1,
    padding: 10,
    gap: 10,
  },
  right: {
    flex: 1,
    padding: 10,
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: "#E0E0E0",
    fontWeight: "bold",
  },
  value: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  head: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  noData: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 20,
  },
  topBar: {
    backgroundColor: "#9400D3",
    
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position:"relative",
    width:"100%",

  }
  
});

export default Upcoming;
