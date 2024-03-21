import React, { useState, useCallback } from 'react'
import { TouchableOpacity, StyleSheet, View, SafeAreaView, Image, Alert ,Platform} from 'react-native'
import { Checkbox, Text, TextInput } from 'react-native-paper'
import Spinner from 'react-native-loading-spinner-overlay';
import Error from '../components/Error';
import { signIn } from '@okta/okta-react-native';
import configFile from '../../okta.config';
import VersionInfo from 'react-native-version-info';
import { useTranslation } from 'react-i18next';

//https://github.com/FormidableLabs/react-native-app-auth/tree/main/Example
import {
    authorize,
    refresh,
    revoke,
    prefetchConfiguration,
    signOut
} from 'react-native-app-auth';
import { FormLabel, FormValue } from '../components';
import env from 'react-native-config'

const oktaConfigs = {
    issuer: configFile.oidc.discoveryUri,
    clientId: configFile.oidc.clientId,
    redirectUrl: configFile.oidc.redirectUri,
    scopes: configFile.oidc.scopes,
    serviceConfiguration: configFile.oidc.serviceConfiguration,
    additionalParameters: configFile.oidc.additionalParameters
};

export default function LoginScreen({ navigation }) {
    const { t,i18n } = useTranslation();

    const [username, setUsername] = useState({ value: '', error: '' })
    const [password, setPassword] = useState({ value: '', error: '' })
    const [checked, setChecked] = useState(false)
    const [progress, setProgress] = useState(false);
    const [error, setError] = useState('');
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const API_HOST = env.API_HOST;
    const version = Platform.constants;
    console.log("version",version,VersionInfo)
    console.log('App version:', VersionInfo.appVersion);
   console.log('Build version:', VersionInfo.buildVersion);


    console.log("API_HOST => ",API_HOST)
    const reset = useCallback(() => {
        setProgress(false);
        setUsername('');
        setPassword('');
        setError('');
    }, []);

    const login = useCallback(() => {
        setError('');
        if (progress) {
            return;
        }
        console.log(username, password)
        setProgress(true);
        signIn({ username, password })
            .then(_token => {
                setProgress(false);
                reset();
                console.log("signIn", _token)
                navigation.navigate('profile');
            })
            .catch(err => {
                console.log(err)
                setProgress(false);
                setUsername('');
                setPassword('');
                setError(err.message);
            });
    }, [navigation, progress, username, password, reset]);

    const handleAuthorize = useCallback(async provider => {
        try {
            const newAuthState = await authorize({
                ...oktaConfigs,
                connectionTimeoutSeconds: 5,
                iosPrefersEphemeralSession: true,
            });
            console.log("newAuthState", newAuthState)
            navigation.navigate('profile', { authState: newAuthState });
        } catch (error) {
            Alert.alert('Failed to log in', error.message);
        }
    }, []);

    const skipLogin = useCallback(async provider => {
        try {
            navigation.navigate('deviceScan');
        } catch (error) {
            Alert.alert('Failed to log in', error.message);
        }
    }, []);

    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={{ flex: 1, }}>
             <TouchableOpacity onPress={() => i18n.changeLanguage("en")}>
             <Image
                style={{
                    alignSelf: 'center',
                    marginTop: 10,
                    width: "90%",
                    resizeMode: "contain"
                }}
                source={require('../assets/app_logo.png')}
            />
             </TouchableOpacity>
            
            <FormLabel style={{ alignSelf: 'center', color: '#000000' }}>{t("screens.login.okta_title")}</FormLabel>
            <FormValue style={{ alignSelf: 'center' }}>harsha@gmail.com/Regal@123</FormValue>
            <FormValue style={{ alignSelf: 'center' }}>ravi@gmail.com/8vNLf9WW</FormValue>
            <FormValue style={{ alignSelf: 'center' }}>rakeshponnaregal@gmail.com/Regal@123</FormValue>

            <View style={styles.container}>

                <Spinner
                    testID="spinner"
                    visible={progress}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                />
                <Error error={error} />

                {/* <Text style={styles.title2}>Perceptiv</Text> */}
                <View style={styles.containerView} >
                    <View style={styles.inputView} >
                        <TextInput
                            theme={{ colors: { text: 'white', primary: '#003f5c' } }}
                            mode='outlined'
                            label={'User Name'}
                            testID="usernameTextInput"
                            style={styles.inputText}
                            inputMode="email"
                            placeholderTextColor="#003f5c"
                            onChangeText={text => setUsername(text)} />
                    </View>
                    <View style={styles.inputView} >
                        <TextInput
                            right={<TextInput.Icon icon={isPasswordSecure ? "eye-off-outline" : "eye-outline"} size={20} color='#000'
                                onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }}
                            />}
                            theme={{ colors: { text: 'white', primary: '#003f5c' } }}
                            mode='outlined'
                            label={'Password'}
                            secureTextEntry={isPasswordSecure}
                            testID="passwordTextInput"
                            style={styles.inputText}
                            placeholderTextColor="#003f5c"
                            onChangeText={text => setPassword(text)} />
                    </View>
                    <View style={{ margin: 10 }} ></View>

                    {/* 
                    <View style={styles.checkboxContainer}>
                        <View style={{ flex: 1, height: 40 }}>
                            <View style={{
                                flex: 1, marginLeft: 'auto', marginStart: 15, marginTop: 5,
                                flexDirection: 'row', alignItems: 'center'
                            }}>
                                <View>
                                    <Checkbox
                                        style={styles.checkbox}
                                        checked={true}
                                        onCheck={() => setChecked(!checked)}
                                        status={checked ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setChecked(!checked);
                                        }}
                                    />
                                </View>

                                <Text style={styles.forgot}>
                                    Remember Me
                                </Text>
                            </View>
                        </View>
                        <View style={{ flex: 2, height: 30 }}>
                            <TouchableOpacity style={{ flex: 2, marginLeft: 'auto', marginEnd: 25, marginTop: 10 }}>
                                <Text style={styles.forgot}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                    </View> 
                    */}

                    <TouchableOpacity style={styles.loginBtn}
                        onPress={login}
                    >
                        <Text
                            testID="signIn"
                            style={styles.loginText}>Sign In</Text>
                    </TouchableOpacity>

                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        color: "#000",
                    }}>or</Text>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleAuthorize}>
                        <Text
                            testID="signAuthorize"
                            style={styles.loginText}>OKTA Authorize </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.loginBtn,{backgroundColor: "#00FF0000", }]} onPress={skipLogin}>
                        <Text
                            testID="signAuthorize"
                            style={[styles.loginText,{color: "#6d6d6d", fontSize: 14,}]}>Skip Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )


}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ededed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerView: {
        margin: 10,
        borderRadius: 10,
        width: "90%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingBottom: 10,
        color: "white"
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#00306b",
        marginBottom: 10
    },
    title2: {
        fontWeight: "bold",
        fontSize: 45,
        color: "#00306b",
        marginBottom: 40
    },
    inputView: {
        marginTop: 20,
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 10,
        height: 50,
        justifyContent: "center",
    },
    inputText: {
        height: 50,
        shadowColor: "#f0f0f0",
        borderWidth: 0,
        underlineColorAndroid: "transparent",
        backgroundColor: '#fff',
        borderColor: "#f0f0f0",
    },
    forgot: {
        color: "#6d6d6d",
        fontSize: 11
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#003f5c",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        fontWeight: "bold",
        marginBottom: 10,
    },
    loginText: {
        color: "white",
        fontSize: 20,
    },
    checkboxContainer: {
        flexDirection: 'row', alignItems: 'center',
    },
    checkbox: {
        alignSelf: 'center',
        borderRadius: 10,
        backgroundColor: '#303030',
        borderColor: "#303030",
    },
    textStyle: {
        fontSize: 16,
        color: 'black',
        flex: 1
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
});