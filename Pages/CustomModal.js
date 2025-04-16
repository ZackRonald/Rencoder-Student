import React from 'react';
import { View, TouchableOpacity, Text, Image, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Icon library for close button
import ImageZoom from 'react-native-image-pan-zoom'; // For image zoom
import Toast from 'react-native-toast-message'; // Toast component

const { width, height } = Dimensions.get('window');

const CustomModal = ({ modalVisible, setModalVisible, selectedCertificate, downloadCertificate }) => {
  if (!modalVisible) return null; // Do not render the modal if it's not visible

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        {/* Close Button in top-right corner */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Icon name="x-circle" size={36} color="#333" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Your Certificate</Text>

        <ImageZoom
          cropWidth={width * 0.9}
          cropHeight={height * 0.5}
          imageWidth={width * 0.75}
          imageHeight={height * 0.4}
        >
          <Image
            source={{ uri: selectedCertificate }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </ImageZoom>

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadCertificate}
        >
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>

      {/* Toast component */}
      <Toast
        position="bottom"
        style={{
          zIndex: 1,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          marginBottom: 20,
        }}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
        position: 'absolute',
        top: 0,  // Take up full screen
        left: 0,
        right: 0,
        bottom: 0,  // Ensure it covers the full height of the screen
      },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.47,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
   marginTop:30,
   top:70
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  downloadButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#8968CD',
    borderWidth: 1,
    borderRadius: 5,
    bottom:80,
    left:80
  },
  downloadText: {
    color: '#8968CD',
    fontWeight: 'bold',
  },
});

export default CustomModal;
