import React, { useState, useEffect } from "react";
import {ScrollView,View,Text,StyleSheet,Image,ImageBackground,TouchableOpacity,TextInput,Modal,Button,Dimensions} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { Picker } from "@react-native-picker/picker";
import Loader from "../Components/AnimatedLoader";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get("window");

function Profile() {
  const [address, setAddress] = useState("N/A");
  const [degree, setDegree] = useState("N/A");
  const [occp, setOccp] = useState("N/A");
  const [desgi, setDesgi] = useState("N/A");
  const [dob, setDob] = useState(null);
  const [profileImage, setProfileImage] = useState(
    require("../assets/Images/land.png")
  );
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeginVisible, setIsDeginVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isDesgiInpVisible, setisDesgiInpVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const email = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("authToken");
  
      if (!email) {
        Toast.show({
          type: 'error',
          text1: 'Missing email',
          text2: 'Please log in again.',
          position: 'bottom',
        });
        return;
      }
  
      const formData = new FormData();
      formData.append("studEmail", email);
      formData.append("studAddress", address);
      formData.append("degree", degree);
      formData.append("studDOB", dob);
      formData.append("studDesignation", desgi);
      formData.append("studOccupation", occp);
  
      if (profileImage && profileImage.uri) {
        const fileExtension = profileImage.uri.split(".").pop();
        const mimeType = `image/${fileExtension}`;
        formData.append("profileImage", {
          uri: profileImage.uri,
          type: mimeType,
          name: `profile.${fileExtension}`,
        });
      }
  
      const response = await axios.post(
        "http://192.168.1.4:5000/updateProfile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Profile updated!',
          text2: 'Your changes have been saved.',
          position: 'bottom',
        });
        setIsEditing(false);
        setIsButtonVisible(false);
        setIsModalVisible(false);
        setRefresh(!refresh);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: 'Please try again later.',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Profile update failed. Check console.',
        position: 'bottom',
      });
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const email = await SecureStore.getItemAsync("userEmail");
      const token = await SecureStore.getItemAsync("authToken");
  
      if (!email) {
        console.error("No email found in secure storage");
        setIsButtonVisible(true);
        return;
      }
  
      const response = await axios.get("http://192.168.1.4:5000/getProfile",{
        params: { studEmail: email },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      if (response.status === 200) {
        const {
          studName,
          studEmail,
          studPhone,
          studID,
          studAddress,
          degree,
          studDOB,
          studPic,
          studOccupation,
          studDesignation,
        } = response.data.profile;
  
        setName(studName);
        setEmail(studEmail);
        setPhone(studPhone);
        setStudentId(studID);
        setAddress(studAddress);
        setDegree(degree);
        setDob(studDOB);
        setOccp(studOccupation);
  console.log(studPic);
  
        if (studDesignation && studDesignation !== "N/A" && studDesignation !== "undefined") {
          setIsDeginVisible(true);
          setDesgi(studDesignation);
        }
  
        setProfileImage({
          uri: studPic
            ? `http://192.168.1.4:5000/${studPic}`
            : `http://192.168.1.4:5000/uploads/profile.png`,
        });
  
        const isAllDataPresent =
          studAddress && studAddress.trim() !== "" &&
          degree && degree.trim() !== "" &&
          studDOB && studDOB.trim() !== "" &&
          studPic && studPic.trim() !== "";
  
        setIsButtonVisible(!isAllDataPresent);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsButtonVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchProfile();
  }, [refresh]);

  const handleOccupationChange = (itemValue) => {
    setOccp(itemValue);
    setisDesgiInpVisible(itemValue === "Employee");
  };
  if (isLoading) {
    return (
      <Modal
  transparent={true}
  visible={isLoading}
  animationType="fade"
>

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Loader />
 
  </View>
</Modal>

    
    
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Navi")}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Feather name="edit-3" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={profileImage}
        style={styles.backgroundImg}
        resizeMode="cover"
      >
        <Text style={styles.imageText}>{name}</Text>
      </ImageBackground>

      <View style={styles.top}>
        <View style={styles.upper}>
          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>Student ID</Text>
              <Text style={styles.value}>{studentId}</Text>
            </View>
            <View style={styles.miniCard2}>
              <Text style={styles.label}>Degree</Text>
              <Text style={styles.value}>{degree || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>Occupation</Text>
              <Text style={styles.value}>{occp || "N/A"}</Text>
            </View>
            {isDeginVisible && (
              <View style={styles.miniCard2}>
                <Text style={styles.label}>Designation</Text>
                <Text style={styles.value}>{desgi}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{phone}</Text>
            </View>
          </View>

          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email}</Text>
            </View>
          </View>

          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>DOB</Text>
              <Text style={styles.value}>{dob || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.cardConatiner}>
            <View style={styles.miniCard}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{address || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
            <Image source={profileImage} style={styles.profileImage} />
          </TouchableOpacity>

          <TextInput
            placeholder="Degree"
            style={styles.input}
            value={degree}
            onChangeText={setDegree}
          />
          <TextInput
            placeholder="Address"
            style={styles.textArea}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={occp}
              onValueChange={handleOccupationChange}
              style={styles.picker}
            >
              <Picker.Item label="Select Occupation" value="" />
              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Fresher" value="Fresher" />
              <Picker.Item label="Employee" value="Employee" />
            </Picker>
          </View>

          {isDesgiInpVisible && (
            <TextInput
              placeholder="Designation"
              style={styles.input}
              value={desgi}
              onChangeText={setDesgi}
            />
          )}

          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="Enter DOB"
          />

          <View style={styles.modalButtons}>
            <Button title="Save" onPress={handleUpdate} />
            <Button
              title="Cancel"
              onPress={() => setIsModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8968CD",
  },
  topBar: {
    backgroundColor: "#7456A1",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#674B89",
    marginBottom: 40,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  backgroundImg: {
    height: height * 0.4,
    justifyContent: "flex-end",
  },
  imageText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  top: {
    paddingHorizontal: width * 0.1,
  },

  cardConatiner: {
    flexDirection: "row",
    gap: 70,
  },
  miniCard: {
    flex: 1,
  },
  miniCard2: {
    flex: 1,
    position: "relative",
    right: 30,
  },
  label: {
    fontSize: 18,
    color: "#FFD700",
    marginBottom: 4,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#ddd",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 18,
    color: "#FFFFFF",
    borderBottomWidth: 2,
    borderBottomColor: "#FFD700",
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    borderBottomWidth: 2,
    borderBottomColor: "#FFD700",
    marginBottom: 15,
    color: "#FFFFFF",
  },
  pickerContainer: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#FFD700",
    marginVertical: 8,
  },
  picker: {
    color: "#FFFFFF",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  backgroundImg: {
    width: "100%",
    height: height * 0.45,
    justifyContent: "flex-end",
    alignItems: "center",
    bottom: 40,
    overflow: "hidden",
  },
});

export default Profile;
