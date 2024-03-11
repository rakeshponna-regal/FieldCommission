import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView } from 'react-native';

const Page = ({ children }) => (
  <ImageBackground
    source={require('../assets/background.jpg')}
    style={[styles.background, { width: '100%', height: '100%' }]}
  >
    <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0,
    paddingHorizontal: 5,
    paddingBottom: 0,
  },
  safe: {
    flex: 1,
  }
});

export default Page;