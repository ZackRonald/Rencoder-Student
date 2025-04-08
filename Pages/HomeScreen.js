import React, { useEffect, useState, useRef } from "react";
import {
  StatusBar,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import Navbar from "../Components/UINavbar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [currentSubjectName, setCurrentSubjectName] = useState("");
  const [currentStackName, setCurrentStackName] = useState("");
  const cameraRef = useRef(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const fetchTodayAttendance = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");
  
      if (!token || !email) {
        console.error("Token or Email not found");
        return;
      }
  
      const res = await axios.post(
        "http://192.168.194.158:5000/getAttendance",
        { studEmail: email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setTodayAttendance(res.data.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error.response?.data || error.message);
    }
  };
  

  useEffect(() => {
    fetchCourses();
    fetchTodayAttendance();
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const openCameraModal = (subject, stack) => {
    setCurrentSubjectName(subject);
    setCurrentStackName(stack);
    setCameraModalVisible(true);
  };

  const closeCameraModal = () => setCameraModalVisible(false);

  const fetchCourses = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");

      if (!token || !email) {
        console.error("Token or Email not found");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://192.168.194.158:5000/subjects",
        { studEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    const token = await SecureStore.getItemAsync("authToken");

    const payload = {
      image: photo.base64,
      subjectName: currentSubjectName,
      stackName: currentStackName,
    };

    try {
      const response = await axios.post("http://192.168.194.158:5000/attendance", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Attendance marked successfully!");
      closeCameraModal();
      fetchTodayAttendance(); // Refresh attendance after marking
    } catch (error) {
      console.error("Attendance marking failed:", error.response?.data || error.message);
      alert("Failed to mark attendance.");
    }
  };

  return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar backgroundColor="#4B0082" barStyle="light-content" />
        <Navbar navigation={navigation} />

        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Rencoders</Text>
          <Text style={styles.description}>
            "Every great coder was once a beginner who never gave up!"{"\n\n"}
            Your coding journey starts here! Track progress, stay on top of courses, and never miss a class.{"\n\n"}
            Stay consistent. Keep learning.{"\n"}Build your future.
          </Text>
        </View>

        <View style={styles.card3}>
          {loading ? (
            <ActivityIndicator size="large" color="#8968CD" />
          ) : (
            <View style={{ width: "100%" }}>
              {courses.map((course, index) => {
                const inProgressSubjects = course.subjects?.filter(
                  (subject) => subject.status === "In Progress"
                );

                if (!inProgressSubjects || inProgressSubjects.length === 0) return null;

                return (
                  <View key={index} style={{ marginBottom: 30 }}>
                    <Text style={styles.courseHeader}>{course.title}</Text>
                    {inProgressSubjects.map((subject, subIndex) => {
                      const uniqueKey = `${course.stack}-${subject.subject}`;

                      const hasMarkedToday = todayAttendance.some(
                        (entry) =>
                          entry.subject === subject.subject && entry.stack === course.stack
                      );

                      return (
                        <View key={uniqueKey} style={styles.card2}>
                          <Text style={styles.title}>{course.stack}</Text>
                          <View style={styles.row}>
                            <View style={styles.left}>
                              <Text style={styles.label}>Subject</Text>
                              <Text style={styles.value}>{subject.subject}</Text>

                              <Text style={styles.label}>Start Date</Text>
                              <Text style={styles.value}>{subject.startDate}</Text>

                              <Text style={styles.label}>Attendance</Text>
                              <Text style={styles.value}>{subject.attendanceCount}</Text>
                            </View>

                            <View style={styles.right}>
                              <Text style={styles.label}>Trainer Name</Text>
                              <Text style={styles.value}>{subject.trainerName}</Text>

                              <Text style={styles.label}>Time</Text>
                              <Text style={styles.value}>{subject.time}</Text>
                            </View>
                          </View>

                          {hasMarkedToday ? (
                            <Text
                              style={{
                                color: "lightgreen",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginTop: 10,
                              }}
                            >
                              ✅ Attendance already marked
                            </Text>
                          ) : (
                            <TouchableOpacity
                              onPress={() => openCameraModal(subject.subject, course.stack)}
                              style={styles.iconButton}
                            >
                              <Icon name="camera-reverse-outline" size={30} color="#fff" />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}
        </View>
     

      {/* ✅ Camera Modal */}
      <Modal visible={isCameraModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                  <Text style={styles.text}>Flip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={closeCameraModal}>
                  <Text style={styles.text}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={takePicture}>
                  <Text style={styles.text}>Click</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </View>
      </Modal>
</ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    margin: 20,
    position: "relative",
    top: 20,
    width: width * 0.9,
  },
  card3: {
    alignItems: "center",
    justifyContent: "center",
    width: width,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    backgroundColor: "#8968CD",
  },
  card2: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 15,
    alignSelf: "center", // ✨ better for centering than left/right
  },
  
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  left: {
    width: "50%",
    paddingRight: 10,
  },
  right: {
    width: "50%",
    paddingLeft: 10,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E6E6FA",
  },
  value: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraWrapper: {
    width: width * 0.9,
    height: height * 0.6,
    overflow: "hidden",
    borderRadius: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#8968CD",
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
  iconButton: {
    marginTop: 10,
    backgroundColor: "#4B0082",
    borderRadius: 25,
    padding: 10,
    alignSelf: "center",
  },
});


