import React, { useEffect, useState, useRef } from "react";
import { StatusBar, ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import Navbar from "../Components/UINavbar";
import Loader from "../Components/AnimatedLoader";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import Font from 'react-native-vector-icons/FontAwesome5';
import { Dimensions } from "react-native";
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facing, setFacing] = useState("front");
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

    if (!token || !email) {
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
                triggerDate.setMilliseconds(0);
      
                // Log trigger date for debugging
                console.log(triggerDate);
      
                // Schedule only if the time is later than now
                if (triggerDate > now) {
                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: `📸 ${subject.subject} Attendance`,
                      body: `Class for ${subject.subject} is starting soon. Don't forget to mark attendance!And Your trainer is ${subject.trainerName} is waiting in the class`,
                      data: { screen: "HomeScreen" },
                    },
                    trigger: {
                      type: 'date',
                      timestamp: triggerDate.getTime(),
                    },
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
      setLoading(false);
      return;
    }

    const response = await axios.post(
      "http://192.168.1.4:5000/getAttendance",
      { studEmail: email },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200 && Array.isArray(response.data.attendance)) {
      setTodayAttendance(response.data.attendance);
    } else {
      setTodayAttendance([]);
    }
    console.log("Notifiacton"); 
    
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error Fetching Attendance',
      text2: error?.response?.data || error?.message,
    });
    setTodayAttendance([]);
  } finally {
    setLoading(false);
  }
};

const openCameraModal = async (subject, stack) => {
  const { status } = await Location.getForegroundPermissionsAsync();

  if (status !== "granted") {
    setShowLocationModal(true);
    return;
  }

  setActivate(!activate);
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
        Toast.show({
          type: 'info',
          text1: 'Notifications',
          text2: 'Permission denied',
        });
      }
    };

    const initialize = async () => {
      setLoading(true);
      try {
        await requestNotifPermissions();
        const fetchedCourses = await fetchCourses();
        await fetchTodayAttendance();
        await setupNotifications(fetchedCourses);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Initialization Failed',
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [])
);

const closeCameraModal = () => setCameraModalVisible(false);

const fetchCourses = async () => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    const email = await SecureStore.getItemAsync("userEmail");

    if (!token || !email) {
      Toast.show({
        type: 'error',
        text1: 'Auth Error',
        text2: 'Missing token or email',
      });
      setLoading(false);
      return [];
    }

    const response = await axios.get("http://192.168.1.4:5000/getCourse", {
      params: { studEmail: email },
      headers: { Authorization: `Bearer ${token}` },
    });

    const { courses = [], targetLat, targetLog } = response.data;

    if (targetLat && targetLog) {
      await SecureStore.setItemAsync("targetLat", targetLat.toString());
      await SecureStore.setItemAsync("targetLog", targetLog.toString());
    } else {
      Toast.show({
        type: 'info',
        text1: 'Missing Target Coordinates',
      });
    }

    setCourses(courses);
    return courses;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Course Fetch Failed',
      text2: error?.response?.data || error.message,
    });
    return [];
  } finally {
    setLoading(false);
  }
};

const takePicture = async () => {
  if (!cameraRef.current) return;

  try {
    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    const token = await SecureStore.getItemAsync("authToken");
const studEmail = await SecureStore.getItemAsync("userEmail");
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Auth Error',
        text2: 'Authentication token missing.',
      });
      return;
    }

    const payload = {
      studEmail: studEmail,
      image: photo.base64,
      subjectName: currentSubjectName,
      stackName: currentStackName,
    };

    const response = await axios.post("http://192.168.1.4:5000/attendance", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    Toast.show({
      type: 'success',
      text1: 'Attendance Marked',
      text2: response.data.message || 'Success',
    });

    closeCameraModal();
    fetchTodayAttendance();
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Attendance Failed',
      text2: error.response?.data || error.message,
    });
  }
};

const checkLocationAndOpenCamera = async (subject, stack) => {
  try {
    setLoading(true);
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    const latStr = await SecureStore.getItemAsync("targetLat");
    const logStr = await SecureStore.getItemAsync("targetLog");

    const targetLat = parseFloat(latStr);
    const targetLog = parseFloat(logStr);

    if (!targetLat || !targetLog) {
      Toast.show({
        type: 'error',
        text1: 'Target Not Set',
        text2: 'Target location is missing.',
      });
      return;
    }

    const distance = getDistanceFromLatLonInMeters(latitude, longitude, targetLat, targetLog);

    if (distance <= 100) {
      setCurrentSubjectName(subject);
      setCurrentStackName(stack);
      setCameraModalVisible(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Out of Range',
        text2: 'Move closer to the target location.',
      });
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Location Error',
      text2: 'Could not get your current location.',
    });
  } finally {
    setLoading(false);
  }
};

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
      
<ScrollView showsVerticalScrollIndicator={false}  // Hides vertical scrollbar
  showsHorizontalScrollIndicator={false} >
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
                          <Icon name="camera" size={30} color="#fff" />
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
          <TouchableOpacity style={styles.closeButton} onPress={closeCameraModal}>
          <Icon name="close" size={60} color="#fff" />
          </TouchableOpacity>
          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
              <View style={styles.buttonContainer}>
              
              
                <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
  <View style={styles.shutterOuter}>
    <View style={styles.shutterInner} />
  </View>
</TouchableOpacity>


              </View>
            </CameraView>
          </View>
        </View>
      </Modal>


      <Modal visible={showLocationModal} transparent animationType="fade">
  <View style={styles.modalContainer}>
    <View style={styles.permissionModal}>
      <Text style={styles.modalTitle}>📍Location Required</Text>
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

const styles = StyleSheet.create({
  card: {
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    padding: 20,
    borderRadius: 10,
    
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
    alignSelf: "center", 
  },

  description: {
    fontSize: 16,
    color: "white",
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
  
  shutterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  shutterOuter: {
    width: width*0.2,
    height: height*0.1,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: width*0.15,
    height: height*0.07,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
closeButton:{
  
  fontWeight:"bold",
  position:"absolute",
  top: 20,
  left: 280,
}});


