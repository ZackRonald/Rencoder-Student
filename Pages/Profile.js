import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image,ImageBackground, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';

function Profile() {
  const [address, setAddress] = useState('N/A');
  const [degree, setDegree] = useState('N/A');
  const [occp, setOccp] = useState('N/A');
  const [desgi, setDesgi] = useState('N/A');
  const [dob, setDob] = useState(null);  // dob is a string now
  const [profileImage, setProfileImage] = useState(require('../assets/Images/land.png'));
  const [buttonText, setButtonText] = useState('Edit');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const[isDeginVisible,setIsDeginVisible]=useState(false);
  const [refresh, setRefresh] = useState(false); 
const [isDesgiInpVisible,setisDesgiInpVisible]=useState(false)
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
    try {
      // Retrieve email from SecureStore
      const email = await SecureStore.getItemAsync('userEmail');
      if (!email) {
        alert('No email found. Please log in again.');
        return;
      }
  
      const formData = new FormData();
      formData.append('studEmail', email);  
      formData.append('studAddress', address);
      formData.append('degree', degree);
      formData.append('studDOB', dob);
      formData.append('studDesignation', desgi);
      formData.append('studOccupation', occp);
  
      if (profileImage && profileImage.uri) {
        // Extract the file extension from the URI
        const fileExtension = profileImage.uri.split('.').pop();
        const mimeType = `image/${fileExtension}`;
  
        formData.append('profileImage', {
          uri: profileImage.uri,
          type: mimeType,  // Dynamic type based on extension
          name: `profile.${fileExtension}`,  // Use extension in the file name
        });
      }
  
      const response = await axios.post('http://192.168.194.158:5000/updateProfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
  
      if (response.status === 200) {
        alert('Profile updated successfully');
        setButtonText('Edit');
        setIsEditing(false);
        setIsButtonVisible(false); 
        setIsModalVisible(false);
        setRefresh(!refresh); // Trigger re-render 
      } else {
        alert('Profile update failed');
        setButtonText('Update');
      }
    } catch (error) {
      alert('Profile update failed');
      console.error('Update error:', error);
      setButtonText('Update');
    }
  };
  const fetchProfile = async () => {
    try {
      const email = await SecureStore.getItemAsync('userEmail');
      if (!email) {
        console.error("No email found in secure storage");
        setIsButtonVisible(true);
        return;
      }

      const response = await axios.get('http://192.168.194.158:5000/getProfile', {
        params: { studEmail: email },
      });

      if (response.status === 200) {
        const { studName, studEmail, studPhone, studID, studAddress, degree, studDOB, studPic,studOccupation,studDesignation } = response.data.profile;
        console.log(response.data.profile);
        
       setName(studName);
        setEmail(studEmail);
        setPhone(studPhone);
        setStudentId(studID);
        setAddress(studAddress);
        setDegree(degree);
        setDob(studDOB );
        setOccp(studOccupation);
        if(studDesignation !== "none" && studDesignation !== "N/A" && studDesignation !== "" && studDesignation !== "undefined") {
          setIsDeginVisible(true);
          setDesgi(studDesignation);
          console.log("Designation set:", studDesignation); // Log to confirm
      }
      
        
        setOccp(studOccupation);

        // Set profile image or default image
        setProfileImage({ uri: studPic ? `http://192.168.194.158:5000/${studPic}` : `http://192.168.194.158:5000/uploads/profile.png` });

        // Check if all required fields are filled
        const isAllDataPresent = 
          (studAddress && studAddress.trim() !== '') &&
          (degree && degree.trim() !== '') &&
          (studDOB && studDOB.trim() !== '') &&
          (studPic && studPic.trim() !== '');

        setIsButtonVisible(!isAllDataPresent);
      }
    } catch(error) {
      console.error("Error fetching profile:", error);
      setIsButtonVisible(true);
    }
  };
  useEffect(()=>{
    fetchProfile();
  },[refresh])

  useEffect(() => {
    
    fetchProfile();
  }, []);

  const handleOccupationChange = (itemValue) => {
    setOccp(itemValue);
    setisDesgiInpVisible(itemValue === "Employee");
  };
  
  

 

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Navi')}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

       
  <TouchableOpacity onPress={() => setIsModalVisible(true)}>
    <Feather name="edit-3" size={28} color="#fff" />
  </TouchableOpacity>


      </View>
      <ImageBackground source={profileImage} style={styles.backgroundImg} resizeMode="cover">
  <Text style={styles.imageText}>{name}</Text>
</ImageBackground>
      <ScrollView style={styles.top}>
       <View style={styles.upper}>
       <View style={styles.left}>
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
      </ScrollView>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
      <Image source={profileImage} style={styles.profileImage} />
    </TouchableOpacity>

    <TextInput placeholder="Degree" style={styles.input} value={degree} onChangeText={setDegree} />

    <TextInput placeholder="Address" style={styles.textArea} value={address} onChangeText={setAddress} multiline />

    {/* Occupation Picker */}
    <View style={styles.pickerContainer}>
    <Picker
  selectedValue={occp}
  onValueChange={(itemValue) => handleOccupationChange(itemValue)}
  style={styles.input}
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
      <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
    </View>
  </View>
</Modal>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8968CD',
    
  },
  upper:{
    flexDirection:"column-reverse"
  },

  topBar: {
    backgroundColor: '#7456A1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#674B89',
    position: "relative",
    
    marginBottom: 40,
  },
  backButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  top: {
  left:40, 
  },
  bottom: {
    backgroundColor: '#8968CD',
    padding: 30,
    borderRadius: 25,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#7456A1',
  },
  right:{
    right:40
  },
  backgroundImg: {
   height:350,
bottom:40
  },
  profileImage: {
   
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },

  label: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 8,
    fontSize: 18,
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#7456A1',
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  textArea: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 8,
    fontSize: 18,
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'transparent',
    height: 80,
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 20,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  imageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 8,
    borderRadius: 10,
    position:"absolute",
    bottom:0,
    width:"100%"
  },
  cardConatiner:{
    flexDirection:"row",
    gap:70
  },
  miniCard2:{
    position:"relative",
    right:30,
  },
  pickerContainer: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  picker: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  
 
});


export default Profile;
