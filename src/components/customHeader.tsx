import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  isConnected: boolean;
  scaning: boolean;
  disabled: boolean;
  onPress: () => void;
}

const CustomHeader: React.FC<HeaderProps> = ({
  isConnected,
  scaning,
  disabled,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.buttonView, { opacity: disabled ? 0.7 : 1 }]}
        disabled={disabled}
        onPress={onPress}>
        <Text style={[styles.buttonText]}>
          {scaning ? 'Searching' : isConnected ? 'Connected' : 'Scan'}
        </Text>
      </TouchableOpacity>

      {/* <Text style={{ marginLeft: 10, marginTop: 10 }}>
        {isConnected ? 'Connected' : 'Dis connected'}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  buttonView: {
    backgroundColor: 'rgb(33, 150, 243)',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default CustomHeader;