import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, Linking, StyleSheet, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/Feather';
import Loader from "../Components/AnimatedLoader";
import ImageZoom from 'react-native-image-pan-zoom';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import CustomModal from "../Pages/CustomModal";  // Corrected import

const { width, height } = Dimensions.get('window');

export default function Certificate({ navigation }) {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [galleryModel, setGalleryModel] = useState(false); // Gallery permission modal

  useEffect(() => {
    fetchCertificates();
  }, []);

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/Fonts/Poppins/Poppins-Medium.ttf'),
  });

  const fetchCertificates = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const email = await SecureStore.getItemAsync("userEmail");

      const response = await fetch(`http://192.168.1.4:5000/certificate?studEmail=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.completedCourses) {
        console.log(data.completedCourses);
        
        setCompletedCourses(data.completedCourses); // Array of course objects
      } else {
        setCompletedCourses([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false); 
    }
  };

  const downloadCertificate = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please allow media permissions to save the certificate.',
        });
        setGalleryModel(true);
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'certificate.jpg';

      const downloadResumable = FileSystem.createDownloadResumable(///start the download
        selectedCertificate,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();

      const asset = await MediaLibrary.createAssetAsync(uri);
      Toast.show({
        type: 'success',
        text1: 'Success 🎉',
        text2: 'Certificate saved to your gallery!',
      });

    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download certificate.',
      });
    }
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
<View style={styles.container} scrollEnabled={!modalVisible}>

      {/* Navbar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8968CD" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Certificates</Text>
      </View>
<View >
<ScrollView contentContainerStyle={styles.scroll} style={{ width: '100%',marginBottom:100}} showsVerticalScrollIndicator={false}  // Hides vertical scrollbar
  showsHorizontalScrollIndicator={false} >
{completedCourses.length > 0 ? (
        completedCourses.map((course, index) => (
      
          <View key={index} style={styles.card}>
 <Image
  source={{ uri: course.courseImage }}
  style={styles.cardImage}
  resizeMode="contain"
/>

  <View style={styles.left}>
  <Text style={styles.congratsText}>Certificate</Text>
  <Text style={styles.courseTitle}>{course.stack}</Text>

  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>Start Date:</Text>
    <Text style={styles.infoValue}>{course.startDate}</Text>
  </View>

  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>Course ID:</Text>
    <Text style={styles.infoValue}>{course.courseID}</Text>
  </View>

  {course.completedDate && (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>Completed On:</Text>
      <Text style={styles.infoValue}>{course.completedDate}</Text>
    </View>
  )}

  <TouchableOpacity
    style={styles.viewButton}
    onPress={() => {
      setSelectedCertificate(course.certificate);
      setModalVisible(true);
    }}
  >
    <Text style={styles.viewButtonText}>View Certificate</Text>
  </TouchableOpacity>
  </View>
 
</View>

        ))
      ) : (
        <View style={styles.noCertContainer}>
          <Image
            source={require('../assets/Images/Empty.png')} // Provide a valid path to an image or use a default image
            style={styles.noCertImage}
          />
          <Text style={styles.noCertText}>No certificates available</Text>
        </View>
      )}
</ScrollView>
</View>

     
      <CustomModal 
  modalVisible={modalVisible} // Control visibility
  setModalVisible={setModalVisible} // Function to close modal
  selectedCertificate={selectedCertificate} // Certificate URL or path
  downloadCertificate={downloadCertificate} // Pass the download function
/>

      {/* Gallery permission modal */}
      <Modal visible={galleryModel} transparent animationType="fade">
        <View style={styles.modalContainer2}>
          <View style={styles.permissionModal}>
            <Text style={styles.modalTitle}>Gallery Permission Required</Text>
            <Text style={styles.modalText}>
              This app needs{" "}
              <Text style={styles.highlightText}>Photo and Video</Text> and{" "}
              <Text style={styles.highlightText}>Music and Audio</Text> permission to download the image. Please enable it in app settings.
            </Text>
            <View style={{ flexDirection: "row", gap: 50, marginTop: 20 }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setGalleryModel(false); // Hides the modal
                }}
              >
                <Text style={styles.text}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setGalleryModel(false); // Hides your modal
                  Linking.openSettings(); // Opens app settings (iOS/Android)
                }}
              >
                <Text style={styles.text}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    backgroundColor: '#8968CD',
    flexGrow: 1,
    alignItems: 'center',
    width:"100%"
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width,
    backgroundColor: '#fff',
    height: height * 0.07,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    bottom:20
  },
  navbarTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#8968CD',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    marginRight: width * 0.06,
  },
  Box: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    width: width * 0.92,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    flexDirection: 'row',  // Keep the image and content in a row
    gap: 15,
    alignItems: 'center',  // Align items vertically in the center
    
  },
  Box2:{
    flex:1,
    width:"100%",
    backgroundColor:"black",
  },
  cardImage: {
    width: width * 0.35, // Decrease width of the image to give more space to text
    height: height * 0.18, // Adjust the height to a more balanced value
    alignSelf: 'center',
    borderRadius: 12,
    marginRight: 15, // Add some space between the image and text content
  },
  congratsText: {
    fontSize: width * 0.045,
    color: '#8968CD',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Medium',
  },
  courseTitle: {
    fontSize: width * 0.05,
    color: '#333',
    marginTop: 5,
    fontFamily: 'Poppins-Bold',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: width * 0.034,
    fontWeight: '600',
    color: '#444',
    marginRight: 6,
  },
  infoValue: {
    fontSize: width * 0.034,
    color: '#333',
    flexShrink: 1,
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#6C47C2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: width * 0.038,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  noCertContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noCertImage: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 20,
  },
  noCertText: {
    fontSize: width * 0.06,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionModal: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: width * 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#6C47C2",
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  modalText: {
    fontSize: width * 0.038,
    color: "#333",
    textAlign: "center",
    fontFamily: 'Poppins-Medium',
  },
  highlightText: {
    fontWeight: "bold",
    color: "#8968CD",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#8968CD",
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.035,
  },

});



