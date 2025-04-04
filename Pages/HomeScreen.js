import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Switch } from "react-native";
import Navbar from "../Components/UINavbar";

import * as SecureStore from "expo-secure-store";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchStates, setSwitchStates] = useState({}); 
  const [switchDisabled, setSwitchDisabled] = useState({}); 

  
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

      console.log("Courses received:", response.data.courses);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("http://192.168.194.158:5000/getAttendance");
      const attendanceData = response.data.attendance || [];
  
      const today = new Date().toISOString().split("T")[0];
      const lastAttendanceDate = await SecureStore.getItemAsync("lastAttendanceDate");
  
      if (lastAttendanceDate !== today) {
        setSwitchStates({});
        setSwitchDisabled({});
        await SecureStore.setItemAsync("lastAttendanceDate", today);
        return;
      }
  
      const newSwitchStates = {};
      const newSwitchDisabled = {};
  
      attendanceData.forEach((record) => {
        const key = `${record.stack}-${record.subject}`;
        if (record.date === today) {
          newSwitchStates[key] = true;
          newSwitchDisabled[key] = true;
        }
      });
  
      setSwitchStates(newSwitchStates);
      setSwitchDisabled(newSwitchDisabled);
    } catch (error) {
      console.error("Error fetching attendance:", error.response?.data || error.message);
    }
  };
  
  
  const markAttendance = async (stackName, subjectName) => {
    try {
      await axios.post("http://192.168.194.158:5000/attendance", {
        stackName,
        subjectName
      });
  
      console.log("Attendance inserted for:", stackName, subjectName);
  
      fetchCourses();
    } catch (error) {
      console.error("Error inserting attendance:", error.response?.data || error.message);
    }
  };
  
  

  const toggleSwitch = async (key, stackName, subjectName) => {
    if (switchStates[key]) return;
  
    setSwitchStates((prevStates) => ({ ...prevStates, [key]: true }));
    setSwitchDisabled((prevDisabled) => ({ ...prevDisabled, [key]: true }));
  
    await markAttendance(stackName, subjectName);
  };
 
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar backgroundColor="#4B0082" barStyle="light-content" />

      <Navbar navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Rencoders</Text>
        <Text style={styles.description}>
          "Every great coder was once a beginner who never gave up!"
          {"\n\n"}Your coding journey starts here! Track progress, stay on top of courses, and never miss a class.
          {"\n\n"}Stay consistent. Keep learning.{"\n"}Build your future.
        </Text>
      </View>

      <View style={styles.card3}>
        {loading ? (
          <ActivityIndicator size="large" color="#8968CD" />
        ) : (
          <View>
      {courses.map((course, index) => (
  <View key={index}>
  {Array.isArray(course.subjects) && course.subjects
  .filter((subject) => ["In Progress"].includes(subject.status))
  .map((subject, subIndex) => {


                  const uniqueKey = `${course.stack}-${subject.subject}`; 

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
                          <Text style={styles.value}>{subject.attendance}</Text>
                        </View>

                        <View style={styles.right}>
                          <Text style={styles.label}>Trainer Name</Text>
                          <Text style={styles.value}>{subject.trainerName}</Text>

                          <Text style={styles.label}>Time</Text>
                          <Text style={styles.value}>{subject.time}</Text>

                          <View style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], marginTop: 5 }}>
  {subject.status !== "Completed" && (
    <Switch
      key={uniqueKey}
      trackColor={{ false: "#525252", true: "#9476FF" }}
      thumbColor={switchStates[uniqueKey] ? "#FFFFFF" : "#FFFFFF"}
      ios_backgroundColor="#525252"
      onValueChange={() => toggleSwitch(uniqueKey, course.stack, subject.subject)}
      value={!!switchStates[uniqueKey]}
      disabled={switchDisabled[uniqueKey]} 
    />
  )}
</View>

                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </View>
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
  },
  card3: {
    // // backgroundColor: "#fff",
    // padding: 20,
    // // borderRadius: 10,
    // // shadowColor: "#000",
    // // shadowOffset: { width: 0, height: 4 },
    // // shadowOpacity: 0.2,
    // // shadowRadius: 5,
    // elevation: 5,
    // margin: 20,
    // width: "100%",
    // position: "relative",
    
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom:40,
    backgroundColor: "#8968CD",
  },
  card2: {
    width: "90%",
    position: "relative",
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    margin: 20,
    left: 3,},
  // title: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  //   color: "#FFD700",
  //   textAlign: "center",
  //   marginBottom: 10,
  // },
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
});
