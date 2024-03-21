import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Button,
    Alert,
    TouchableOpacity
} from 'react-native';
import { getAccessToken, getUser, clearTokens, refreshTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Error from '../components/Error';
import { ButtonContainer, Form, FormLabel, FormValue } from '../components';
import { useRoute } from '@react-navigation/native';
import { oktaConfigs } from '../../App';
import {
    authorize,
    refresh,
    revoke,
    logout,
    prefetchConfiguration,
} from 'react-native-app-auth';
import moment from 'moment';
const ProfileScreen = ({ navigation }) => {
    const route = useRoute();
    const authStates = route.params && route.params.authState ? route.params.authState : null;
    console.log(authState)
    const [authState, setAuthState] = useState(authStates);
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState(true);
    const [error, setError] = useState('');

    const logoutApp = useCallback(() => {
        console.log('logout called')
        clearTokens()
            .then(() => {
                navigation.navigate('login');
            })
            .catch(e => {
                setError(e.message);
            });
    }, [navigation]);

    const logoutAuth = useCallback(async () => {
        console.log('logoutAuth')
        navigation.navigate('login');
        // await logout(oktaConfigs, {
        //     idToken: authState.idToken,
        //     postLogoutRedirectUrl: 'com.okta.dev-33134057:/logout'
        // }).then(() => {
        //     navigation.navigate('login');
        //     console.log("logout")
        // })
        //     .catch(e => {
        //         console.log(e)
        //         setError(e.message);
        //     });
    }, [navigation]);

    const fetchAccessToken = useCallback(() => {
        console.log('fetchAccessToken called')
        setProgress(true);
        getAccessToken()
            .then(token => {
                console.log('getAccessToken', token)
                setProgress(false);
                setAccessToken(token.access_token);
            })
            .catch(e => {
                setProgress(false);
                setError(e.message);
            });
    }, []);

    const fetchRefreshToken = useCallback(() => {
        console.log('refresh Token called')
        setProgress(true);
        refreshTokens()
            .then(token => {
                console.log('fetchRefreshToken', token)
                setProgress(false);
                setAccessToken(token.access_token);
            })
            .catch(e => {
                setProgress(false);
                setError(e.message);
            });
    }, []);

    const handleRefresh = useCallback(async () => {
        try {
            const newAuthState = await refresh(oktaConfigs, {
                refreshToken: authState.refreshToken,
            });
            // authState = accessToken
            setAuthState(current => ({
                ...current,
                ...newAuthState,
                refreshToken: newAuthState.refreshToken || current.refreshToken,
            }));
        } catch (error) {
            Alert.alert('Failed to refresh token', error.message);
        }
    }, [authState]);

    useEffect(() => {
        setProgress(true);
        getUser()
            .then(user => {
                console.log('user', user)
                setProgress(false);
                setUser(user);
                fetchAccessToken()
            })
            .catch(e => {
                setProgress(false);
                // setError(e.message);
            });
    }, [navigation, logout]);

    return (
        <>
            <SafeAreaView style={styles.container}>
                <Spinner
                    visible={progress}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                />

                <View style={{ flexDirection: 'column', marginTop: 20, paddingLeft: 10, width: '90%', alignSelf: 'center' }}>

                    <TouchableOpacity style={{
                        justifyContent: 'center',
                        backgroundColor: '#DA2536',
                        borderRadius: 10,
                        width: 100,
                        alignSelf: 'center',
                        alignItems: "center",
                        justifyContent: 'center',
                        paddingEnd: 15,
                        paddingStart: 15,
                        height: 35,
                        marginLeft: 20,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                    }}
                        onPress={() => {
                            if (user) {
                                logoutApp()
                            } else {
                                logoutAuth()
                            }
                        }}
                    >
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 40,
                            flexDirection: 'row',
                        }}>
                            <Text style={{
                                color: 'white',
                                textAlign: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                fontFamily: 'nunito-bold',
                                color: "#FFFFFF",
                            }}>
                                Log out
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {/* <Button
                        style={[styles.logoutButton, { marginTop: 10, marginLeft: 20, padding: 10, }]}
                        onPress={() => {
                            if (user) {
                                logoutApp()
                            } else {
                                logoutAuth()
                            }
                        }}
                        title="Log out"
                        color="#DA2536"
                    /> */}
                </View>
                <Error error={error} />
                {user && (
                    <Form style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                        <Text style={styles.titleHello}>Hello {user.name}</Text>
                        <Form style={{ flexDirection: 'row' }}>
                            <FormLabel>Locale</FormLabel>
                            <FormValue style={{ marginLeft: 10 }}>{user.locale}</FormValue>

                        </Form>
                        <Form style={{ flexDirection: 'row' }}>
                            <FormLabel>Zone Info</FormLabel>
                            <FormValue style={{ marginLeft: 10 }} >{user.zoneinfo}</FormValue>
                        </Form>

                        {/* <Button testID="accessButton" style={{ marginTop: 40 }} title="Get access token" onPress={fetchAccessToken} /> */}

                        <View style={{ flexDirection: 'column', marginTop: 0, width: 300 }}>
                            {accessToken && (
                                <Form>
                                    <FormLabel>Access Token</FormLabel>
                                    <FormValue>{accessToken}</FormValue>
                                </Form>
                                // <View style={styles.tokenContainer}>
                                //     <Text style={styles.tokenTitle}>Access Token:</Text>
                                //     <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
                                // </View>
                            )}
                            
                        </View>
                        <Button testID="accessButton" style={{ marginTop: 40, borderRadius: 10 , }}  title="Refresh token"   onPress={() => {
                                fetchRefreshToken()
                            }} />

                        {/* <TouchableOpacity
                            style={{
                                justifyContent: 'center',
                                backgroundColor: '#6d6d6d',
                                borderRadius: 10,
                                width: '50%',
                                alignSelf: 'center',
                                alignItems: "center",
                                justifyContent: 'center',
                                paddingEnd: 15,
                                paddingStart: 15,
                                height: 35,
                                marginLeft: 20,
                                borderBottomLeftRadius: 5,
                                borderBottomRightRadius: 5,
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                            }}
                            onPress={() => {
                                fetchRefreshToken()
                            }}
                        >
                            <Button testID="accessButton" style={{ marginTop: 40, borderRadius: 10 }} color="#FFF" title="Refresh token"   onPress={() => {
                                fetchRefreshToken()
                            }} />

                        </TouchableOpacity> */}

                      


                    </Form>
                )}

                {
                    authState && (
                        <Form style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                            <FormLabel>AccessToken</FormLabel>
                            <FormValue>{authState.accessToken}</FormValue>
                            <FormLabel>AccessTokenExpirationDate</FormLabel>
                            <FormValue>{moment(authState.accessTokenExpirationDate).format('DD MMMM YYYY HH:mm:ss')}</FormValue>
                            <FormLabel>RefreshToken</FormLabel>
                            <FormValue>{authState.refreshToken}</FormValue>
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    backgroundColor: '#6d6d6d',
                                    borderRadius: 10,
                                    width: '100%',
                                    alignSelf: 'center',
                                    alignItems: "center",
                                    justifyContent: 'center',
                                    paddingEnd: 15,
                                    paddingStart: 15,
                                    height: 35,
                                    marginLeft: 20,
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                }}
                            >
                                <Button testID="accessButton" style={{ marginTop: 40, borderRadius: 10, }} color="#FFF" title="Refresh token" onPress={() => {
                                    handleRefresh()
                                }} />

                            </TouchableOpacity>

                        </Form>
                    )
                }

                <View style={{ flexDirection: 'column', marginTop: 20, paddingLeft: 20, width: '90%' }}>

                    <TouchableOpacity style={{
                        justifyContent: 'center',
                        backgroundColor: '#24C2CB',
                        borderRadius: 10,
                        width: '100%',
                        alignSelf: 'center',
                        alignItems: "center",
                        justifyContent: 'center',
                        paddingEnd: 15,
                        paddingStart: 15,
                        height: 35,
                        marginLeft: 20,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                    }}
                        onPress={() => {
                            navigation.navigate("deviceScan")
                        }}
                    >
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 40,
                            flexDirection: 'row',
                        }}>
                            <Text style={{
                                color: 'white',
                                textAlign: 'center',
                                fontSize: 18,
                                fontWeight: 600,
                                fontFamily: 'nunito-bold',
                                color: "#FFFFFF",
                            }}>
                                Home Screen
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* <Button
                        style={{ marginTop: 40, borderRadius: 20 }}
                        onPress={() => {
                            navigation.navigate("deviceScan")
                        }}
                        title="Home Screen"
                        color="#24C2CB"
                    /> */}

                </View>

            </SafeAreaView>
        </>
    );
};


const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#FFF',
    },
    button: {
        borderRadius: 40,
        width: 200,
        height: 40,
        marginTop: 40,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    logoutButton: {
        paddingLeft: 10,
        fontSize: 16,
        color: '#0066cc',
        borderRadius: 10,

    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
    },
    titleHello: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0066cc',
        paddingTop: 40
    },
    titleDetails: {
        fontSize: 15,
        fontWeight: 'bold',
        paddingTop: 15,
        textAlign: 'center',
    },
    tokenContainer: {
        marginTop: 20
    },
    tokenTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ProfileScreen;
