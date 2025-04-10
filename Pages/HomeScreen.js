import React, { useEffect, useState, useRef } from "react";
import { StatusBar, ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import Navbar from "../Components/UINavbar";
import Loader from "../Components/AnimatedLoader";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { Dimensions } from "react-native";
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [currentSubjectName, setCurrentSubjectName] = useState("");
  const [currentStackName, setCurrentStackName] = useState("");
  const cameraRef = useRef(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
const [activate, setActivate] = useState(false);

  const setupNotifications = async (courses) => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 6
      if (dayOfWeek === 0 || dayOfWeek === 6) return; // Skip weekends
  
      // Cancel all previous notifications to prevent duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();
  
      // Loop through courses and subjects to find "In Progress" ones
      courses.forEach(course => {
        course.subjects.forEach(subject => {
          if (subject.status === "In Progress") {
            const [time, meridian] = subject.time.split(/(AM|PM)/i); // e.g., "2:00", "PM"
            const [hoursStr, minutesStr] = time.split(":");
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
  
            // Convert to 24-hour format
            if (meridian.toUpperCase() === "PM" && hours < 12) hours += 12;
            if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
  
            const triggerDate = new Date();
            triggerDate.setHours(hours);
            triggerDate.setMinutes(minutes);
            triggerDate.setSeconds(0);
  console.log(triggerDate);
  
            // Schedule only if the time is later than now
            if (triggerDate > now) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: `📸 ${subject.subject} Attendance`,
                  body: `Class for ${subject.subject} is starting soon. Don't forget to mark attendance!`,
                  data: { screen: "HomeScreen" },
                },
                trigger: triggerDate,
              });
  
              console.log(`📅 Notification scheduled for ${subject.subject} at ${triggerDate}`);
            }
          }
        });
      });
    } catch (error) {
      console.error("❌ Failed to schedule notifications:", error);
    }
  };
  
  const fetchTodayAttendance = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");
      if (!token || !email) return;

      const res = await axios.post("http://192.168.194.158:5000/getAttendance", { studEmail: email }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTodayAttendance(res.data.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error.response?.data || error.message);
    }
  };

  const openCameraModal = async (subject, stack) => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      setShowLocationModal(true);
      return;
    }
    console.log("Pressmission granted");
    
    console.log("ACtivation",activate);
    setActivate(!activate);
    console.log("Sctivstivon",activate);
    
    checkLocationAndOpenCamera(subject, stack);
  };

  
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      const requestNotifPermissions = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          setNotificationPermission(status);
        } else {
          alert("Notification permission denied");
        }
      };
  
     
      const initialize = async () => {
        setLoading(true); // Start loading before all requests
      
        try {
          await requestNotifPermissions();
          const fetchedCourses = await fetchCourses(); // setCourses handled here
          await fetchTodayAttendance();
          await setupNotifications(fetchedCourses);
        } catch (error) {
          console.error("Initialization failed:", error);
        } finally {
          setLoading(false); // End loading after all are complete
        }
      };
      initialize();
  
      // Optional cleanup if needed
      return () => {
        // cleanup logic if required
      };
    }, [])
  );
  // useEffect(() => {
  //   const requestLocationPermission = async () => {
  //     console.log("Entered location permission request");
      
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status === "granted") {
  //       const loc = await Location.getCurrentPositionAsync({});
  //       setLocation(loc);
  //       console.log("Location:", loc);
        
  //     } else {
  //       alert("Location permission denied");
  //       return;
  //     }
  //   }
  //   requestLocationPermission();
  // },[activate])
  
  const toggleCameraFacing = () => setFacing(f => f === "back" ? "front" : "back");



  const closeCameraModal = () => setCameraModalVisible(false);

  const fetchCourses = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");
  
      if (!token || !email) {
        console.error("Token or Email not found");
        setLoading(false);
        return [];
      }
  
      const response = await axios.get("http://192.168.194.158:5000/getCourse", {
        params: { studEmail: email },
        headers: { Authorization: `Bearer ${token}` },
      });
      
  
      console.log("Full Response", response.data);
  
      const fetchedCourses = response.data.courses || [];
  
      const longi = response.data.targetLog;
      const lati = response.data.targetLat;
      
      if (lati && longi) {
        await SecureStore.setItemAsync("targetLat", lati.toString());
        await SecureStore.setItemAsync("targetLog", longi.toString());
        console.log("✅ Stored lat/log:", lati, longi);
      } else {
        console.error("❌ Missing lat/log from API:", lati, longi);
      }
  
      setCourses(fetchedCourses);
  
      return fetchedCourses; // So it still works with setupNotifications()
    } catch (error) {
      console.error("Error fetching courses:", error.response?.data || error.message);
      return [];
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
      await axios.post("http://192.168.194.158:5000/attendance", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Attendance marked successfully!");
      closeCameraModal();
      fetchTodayAttendance();
    } catch (error) {
      console.error("Attendance marking failed:", error.response?.data || error.message);
      alert("Failed to mark attendance.");
    }
  };

  const checkLocationAndOpenCamera = async (subject, stack) => {
    console.log("📍 Checking location...");
  
    let latitude, longitude;
  
    try {
      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({});
      latitude = loc.coords.latitude;
      longitude = loc.coords.longitude;
    } catch (error) {
      console.log(error);
      alert("Failed to get your location.");
      return;
    } finally {
      setLoading(false);
    }
  
    // Get target location from SecureStore
    const latStr = await SecureStore.getItemAsync("targetLat");
    const logStr = await SecureStore.getItemAsync("targetLog");
  
    console.log("Retrieved raw lat/lng:", latStr, logStr);
  
    const targetLat = parseFloat(latStr);
    const targetLog = parseFloat(logStr);
  
    if (!targetLat || !targetLog) {
      alert("Target location not set.");
      return;
    }
  
    const distance = getDistanceFromLatLonInMeters(latitude, longitude, targetLat, targetLog);
  
    console.log(`📏 Distance from target: ${distance.toFixed(2)} meters`);
  
    if (distance <= 100) {
      console.log("✅ Within 100m range. Opening camera...");
      setCurrentSubjectName(subject);
      setCurrentStackName(stack);
      setCameraModalVisible(true);
    } else {
      console.log("❌ Not within range.");
      alert("You are not near the location to mark attendance.");
    }
  };
  
  
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the earth in meters
    const toRad = (value) => (value * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
  
    return distance; // in meters
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
    <View style={styles.scrollContainer}>
      <StatusBar backgroundColor="#4B0082" barStyle="light-content" />
      <Navbar navigation={navigation} />
<ScrollView>
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
                          <Text style={{ color: "lightgreen", fontWeight: "bold", textAlign: "center", marginTop: 10 }}>
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
      </ScrollView>
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


      <Modal visible={showLocationModal} transparent animationType="fade">
  <View style={styles.modalContainer}>
    <View style={styles.permissionModal}>
      <Text style={styles.modalTitle}>📍 Location Required</Text>
      <Text style={styles.modalText}>
        This app needs location permission to mark your attendance. Please enable it in app settings.
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setShowLocationModal(false);
          }}
        >
          <Text style={styles.text}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setShowLocationModal(false);
            Linking.openSettings();
          }}
        >
          <Text style={styles.text}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
}

// Keep your styles here unchanged...



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
  permissionModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B0082",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  
});


