import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

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

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ justifyContent: "center", alignItems: "center", backgroundColor: "#8968CD", paddingVertical: 20 }}>
      <Text style={styles.heading}>Upcoming Classes</Text>
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
  );
}  

const styles = StyleSheet.create({
  cards: {
    backgroundColor: "#4B0082",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    marginVertical: 10,
    width: "90%",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
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
    fontSize: 18,
    color: "#E0E0E0",
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  head: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 20,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  noData: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 20,
  },
});

export default Upcoming;
