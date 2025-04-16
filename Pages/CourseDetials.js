import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Loader from "../Components/AnimatedLoader";

const { width, height } = Dimensions.get("window");

export default function CourseDetails({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchFilteredSubjects = async (status) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");

      if (!token || !email) return;

      const response = await axios.get(
        "http://192.168.1.4:5000/filterSubjects",
        {
          params: {
            studEmail: email,
            status: status === "All" ? undefined : status,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setSubjects(response.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error.response?.data || error.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Show loader every time screen is focused or filter changes
      fetchFilteredSubjects(filter);
    }, [filter])
  );

  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Loader />
        </View>
      </Modal>

      <View style={styles.topBar}>
        <Text style={styles.head}>Course Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}  // Hides vertical scrollbar
  showsHorizontalScrollIndicator={false} >
        <Picker
          selectedValue={filter}
          style={styles.picker}
          onValueChange={(itemValue) => setFilter(itemValue)}
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="Upcoming" value="Upcoming" />
          <Picker.Item label="In Progress" value="In Progress" />
          <Picker.Item label="Completed" value="Completed" />
        </Picker>

        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <Text style={styles.subHead}>{subject.stack}</Text>
              <View style={styles.cardContent}>
                <View style={styles.cardColumn}>
                  <Text style={styles.label}>Trainer:</Text>
                  <Text style={styles.value}>{subject.trainerName || "N/A"}</Text>

                  <Text style={styles.label}>Course ID:</Text>
                  <Text style={styles.value}>{subject.courseID}</Text>

                  <Text style={styles.label}>Start Date:</Text>
                  <Text style={styles.value}>{subject.startDate}</Text>
                </View>
                <View style={styles.cardColumn}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{subject.status}</Text>

                  <Text style={styles.label}>Subject:</Text>
                  <Text style={styles.value}>{subject.subject}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No subjects found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#8968CD",
    flex: 1,
  },
  topBar: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: height * 0.02,
    alignItems: "center",
  },
  head: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#8968CD",
  },
  picker: {
    width: width * 0.45,
    marginVertical: height * 0.02,
    backgroundColor: "#D8BFD8",
    color: "#4B0082",
    borderRadius: 10,
    alignSelf: "flex-end",
  },
  subjectCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: width * 0.05,
    borderRadius: 20,
    marginBottom: height * 0.025,
    width: width * 0.95,
    alignSelf: "center",
    borderColor: "#FFD700",
    borderWidth: 1,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  subHead: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: height * 0.015,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: width * 0.05,
  },
  cardColumn: {
    flex: 1,
  },
  label: {
    fontSize: width * 0.04,
    color: "#EDE7F6",
    fontWeight: "700",
    marginBottom: 2,
  },
  value: {
    fontSize: width * 0.042,
    color: "#fff",
    marginBottom: height * 0.01,
  },
  loadingText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
  noDataText: {
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 20,
  },
});
