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
        "http://192.168.4.63:5000/filterSubjects",
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
      console.error(
        "Error fetching subjects:",
        error.response?.data || error.message
      );
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Loader />
        </View>
      </Modal>

      <View style={styles.topBar}>
        <Text style={styles.head}>Course Details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false} // Hides vertical scrollbar
        showsHorizontalScrollIndicator={false}
      >
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
            <View key={index} style={styles.courseCard}>
              {/* Top row */}
              <View style={styles.topRow}>
                <Text style={styles.stackText2}>{subject.stack}</Text>
                <Text style={styles.statusText}>{subject.status}</Text>
              </View>

              {/* Subject */}
              <Text style={styles.subjectText2}>{subject.subject}</Text>

              <View style={styles.bottom}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Trainer</Text>
                    <Text style={styles.value}>{subject.trainerName}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Course ID</Text>
                    <Text style={styles.value}>{subject.courseID}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Batch ID</Text>
                    <Text style={styles.value}>{subject.batchCode}</Text>
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{subject.startDate}</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#FFFFFF", // white text color to maintain contrast
    borderRadius: 10,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)", // matching border with courseCard
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
  courseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    width: width * 0.9,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stackText: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stackText2: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 20,
  },

  statusText: {
    fontSize: width * 0.045,
    color: "#00FFB3",
    fontWeight: "600",
  },
  subjectText: {
    marginTop: 5,
    fontSize: width * 0.048,
    color: "#A0A0A0",
    fontWeight: "500",
  },
  subjectText2: {
    marginTop: 5,
    fontSize: width * 0.048,
    color: "black",
    fontWeight: "500",
    marginLeft: 20,
},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
  },

  label: {
    fontSize: width * 0.04,
    color: "#ccc",
    fontWeight: "700",
  },

  value: {
    fontSize: width * 0.045,
    color: "#FFFFFF",
    marginTop: 3,
    fontWeight: "500",
  },
  bottom: {
    justifyContent: "center",
    alignItems: "center",
  },
  dateRow: {
    marginTop: 15,
    alignItems: "flex-start",
  },
});
