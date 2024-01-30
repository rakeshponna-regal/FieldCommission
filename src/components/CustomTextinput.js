/*Custom TextInput*/
import React from 'react';
import { View, TextInput } from 'react-native';
const CustomTextinput = props => {
    return (
        <View
            style={{
                flex: 1,
                color: 'white',
                flexDirection: 'row',
                height: 40,
                paddingLeft: 10,
                paddingRight: 10,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#dadae8',
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
            }}
        >
            <TextInput
                underlineColorAndroid="transparent"
                placeholder={props.placeholder}
                placeholderTextColor="#8b9cb5"
                keyboardType={props.keyboardType}
                onChangeText={props.onChangeText}
                returnKeyType={props.returnKeyType}
                numberOfLines={props.numberOfLines}
                multiline={props.multiline}
                editable={props.editable} 
                textTransform = {props.textTransform}
                autoCapitalize={props.autoCapitalize}
                onSubmitEditing={props.onSubmitEditing}
                style={props.style}
                blurOnSubmit={false}
                value={props.value}
            />

        </View>
    );
};

export const CustomDescriptionTextinput = props => {
    return (
        <View
            style={{
                flex: 1,
                color: 'white',
                flexDirection: 'row',
                height: 100,
                paddingLeft: 10,
                paddingRight: 10,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#dadae8',
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
            }}
        >
            <TextInput
                underlineColorAndroid="transparent"
                placeholder={props.placeholder}
                placeholderTextColor="#8b9cb5"
                keyboardType={props.keyboardType}
                onChangeText={props.onChangeText}
                returnKeyType={props.returnKeyType}
                numberOfLines={props.numberOfLines}
                multiline={props.multiline}
                editable={props.editable} 
                textTransform = {props.textTransform}
                autoCapitalize={props.autoCapitalize}
                onSubmitEditing={props.onSubmitEditing}
                style={props.style}
                blurOnSubmit={false}
                value={props.value}
            />

        </View>
    );
};
export default CustomTextinput;