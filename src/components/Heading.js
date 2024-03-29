import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';

const font = Platform.select({
  ios: 'GillSans-light',
  android: 'sans-serif-thin'
});

const Heading = () => <Text style={[styles.text, { fontFamily: font }]}/>;

const styles = StyleSheet.create({
  text: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 40,
    marginTop: 120,
    backgroundColor: 'transparent',
    textAlign: 'center',
  }
});

export default Heading;