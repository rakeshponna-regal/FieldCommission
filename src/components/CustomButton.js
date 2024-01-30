/*Custom Button*/
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
const CustomButton = props => {
    return (
        <TouchableOpacity style={styles.button} onPress={props.customClick}>
            <Text style={styles.text}>{props.title}</Text>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        color: '#ffffff',
        width:80,
        height:35,
        borderRadius:8,
        paddingTop:5,
        borderColor:'grey',
        borderWidth:1,
        marginTop: 12,
        marginLeft: 10,
        marginRight: 10,
    },
    text: {
        color: '#000',
        fontSize:16,
    
    },
});
export default CustomButton;