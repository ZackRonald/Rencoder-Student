import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import Carousel from "react-native-snap-carousel";

const { width: screenWidth } = Dimensions.get("window");

const data = [
  { title: "Explore New Horizons", text: "Learn something new every day!", image: "https://placeimg.com/640/480/nature" },
  { title: "Stay Motivated", text: "Keep pushing your limits!", image: "https://placeimg.com/640/480/tech" },
  { title: "Achieve Success", text: "Turn your dreams into reality!", image: "https://placeimg.com/640/480/architecture" },
];

const CarouselSlider = () => {
  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        data={data}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.8}
        loop={true}
        autoplay={true}
        autoplayInterval={3000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 20,
  },
  slide: {
    backgroundColor: "#4B0082",
    borderRadius: 20,
    padding: 20,
    margin: 10,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default CarouselSlider;
