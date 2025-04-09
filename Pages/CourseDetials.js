import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const { width, height } = Dimensions.get("window");

export default function CourseDetails({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoursesDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");

      if (!token || !email) {
        console.error("Token or Email missing");
        return;
      }

      const response = await axios.post(
        "http://192.168.194.158:5000/courseDetails",
        { studEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Fetched Courses:", JSON.stringify(response.data, null, 2));

      if (response.status === 200 && Array.isArray(response.data)) {
        console.log("Res :",response.data)

        setCourses(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error.response?.data || error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      // Re-fetch courses or attendance when screen becomes active
      fetchCoursesDetails();
  
      return () => {
        // optional: cleanup when navigating away
      };
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.head}>Course Details</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : courses.length > 0 ? (
        courses.map((course, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.subHead}>Stack: {course.stack || "N/A"}</Text>
            <Text style={styles.paraH}>Course ID: {course.courseID || "N/A"}</Text>
            <Text style={styles.paraH}>Start Date: {course.startDate || "N/A"}</Text>

            <Text style={styles.subHead}>Subjects</Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.cell, styles.tableHead]}>Subject</Text>
                <Text style={[styles.cell, styles.tableHead]}>Trainer</Text>
                <Text style={[styles.cell, styles.tableHead]}>Status</Text>
              </View>
              {course.subjects?.map((sub, subIndex) => (
                <View key={subIndex} style={styles.row}>
                  <Text style={[styles.cell, styles.para]}>{sub.subject || "N/A"}</Text>
                  <Text style={[styles.cell, styles.para]}>{sub.trainerName || "N/A"}</Text>
                  <Text style={[styles.cell, styles.para]}>{sub.status || "N/A"}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No courses found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#8968CD",
    paddingVertical: 30,
  },
  head: {
    
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    top:20,
    marginBottom: 20,
  },
  subHead: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  paraH: {
    color: "#D1C4E9",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 5,
  },
  para: {
    color: "#EDE7F6",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    top:20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    width: width * 0.9,
    marginBottom: 20,
    alignSelf: "center",
  },
  table: {
    marginTop: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    width: width * 0.85,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    minWidth: width * 0.25,
    flexShrink: 1,
  },
  tableHead: {
    fontWeight: "bold",
    color: "#FFD700",
    fontSize: 18,
  },
  loadingText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 10,
  },
  noDataText: {
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 10,
  },
});
