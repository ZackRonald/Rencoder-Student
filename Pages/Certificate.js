import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator,StyleSheet,Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/Feather';
import Loader from "../Components/AnimatedLoader";

const { width, height } = Dimensions.get('window');

export default function Certificate({ navigation }) {

  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Navbar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8968CD" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Certificates</Text>
      </View>

      {completedCourses.length > 0 ? (
        completedCourses.map((course, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.congratsText}>🎉 Congratulations!</Text>
            <Text style={styles.courseTitle}>{course.courseName}</Text>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>📚 Stack:</Text>
              <Text style={styles.infoValue}>{course.stack}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>🆔 Course ID:</Text>
              <Text style={styles.infoValue}>{course.courseID}</Text>
            </View>

            {course.completedDate && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>📅 Completed On:</Text>
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

      {/* Modal for certificate preview */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close Button in top-right corner */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="x-circle" size={36} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Your Certificate</Text>
            <Image
              source={{ uri: selectedCertificate }}
              style={styles.modalImage}
              resizeMode="contain"
            />

            {/* Download Button in bottom-left corner */}
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                Linking.openURL(selectedCertificate);
              }}
            >
              <Icon name="arrow-down" size={36} color="#8968CD" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    alignItems: 'center',
    backgroundColor: '#8968CD',
    flex: 1,
    width: "100%",
    justifyContent: 'center',
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width,
    backgroundColor: '#fff',
    height: height * 0.07,
    paddingHorizontal: width * 0.04,
    bottom: 85,
   
  },
  navbarTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#8968CD',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: 25,
    width: width * 0.9,
    elevation: 5,
    borderLeftWidth: 6,
    borderColor: '#8968CD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    bottom:40
  },
  congratsText: {
    fontSize: width * 0.05,
    color: '#8968CD',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  courseTitle: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  infoBlock: {
    flexDirection: 'row',
    marginBottom: 6,
    justifyContent: 'flex-start',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#666',
    marginRight: 5,
    fontSize: width * 0.035,
  },
  infoValue: {
    color: '#333',
    fontSize: width * 0.035,
  },
  viewButton: {
    backgroundColor: '#8968CD',
    paddingVertical: height * 0.015,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  noCertContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#8968CD',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  modalImage: {
    width: width * 0.75,
    height: height * 0.4,
    borderRadius: 8,
    marginBottom: 20,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

