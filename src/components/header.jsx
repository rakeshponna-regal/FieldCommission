import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, Button, View, Text, SafeAreaView, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

export function HeaderView({ navigation, onPress, isScanning, onLogPress }) {
    return (
        <View style={{ backgroundColor: '#ffffff' }}>
            <View style={{ flexDirection: 'row', height: 50, padding: 10, marginTop: 5, alignSelf: 'center', backgroundColor: '#ffffff' }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}
                    onPress={() => {
                        navigation.goBack()
                    }}>
                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginStart: 0,
                        color: "#000000",
                    }}>Scan Sensor</Text>
                </TouchableOpacity>


                <TouchableOpacity style={{
                    justifyContent: 'flex-end', backgroundColor: 'rgb(12, 11, 110)',
                    alignItems: "center",
                    justifyContent: 'flex-end',
                    paddingEnd: 15,
                    paddingStart: 15,
                    height: 35,
                    marginLeft: 20,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                }}
                    onPress={onLogPress}>
                    <View style={{
                        maxWidth: 800,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                    }}>
                        <Text style={{
                            color: 'white',
                            textAlign: 'center',
                            fontSize: 14,
                            fontFamily: 'nunito-bold',
                            marginRight: isScanning ? 0 : 0,
                            color: "#FFFFFF",
                        }}>
                            Open logs
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={{
                    justifyContent: 'flex-end', backgroundColor: 'rgb(33, 150, 243)',
                    alignItems: "center",
                    justifyContent: 'flex-end',
                    paddingEnd: 10,
                    paddingStart: 10,
                    height: 35,
                    marginLeft: 5,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                }}
                    onPress={onPress}>
                    <View style={{
                        maxWidth: 800,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        height: 40,
                        flexDirection: 'row',
                    }}>

                        {isScanning && <ActivityIndicator color={'white'} size={30} style={{ position: 'relative', marginRight: 10 }} />}
                        <Text style={{
                            color: 'white',
                            textAlign: 'center',
                            fontSize: 16,
                            fontFamily: 'nunito-bold',
                            marginRight: isScanning ? 0 : 0,
                            color: "#FFFFFF",
                        }}>
                            {isScanning ? 'Stop Scan' : 'Scan'}
                        </Text>
                    </View>
                </TouchableOpacity>


            </View>

        </View>

    );
}

export function HeaderTitleView({ title, navigation, onPress, isVisible = true, isConnected = false, isShare = false, onSharePress }) {
    return (
        <View style={{ backgroundColor: '#ffffff' }}>
            <View style={{ flexDirection: 'row', height: 45, padding: 10, marginTop: 0, alignSelf: 'center', backgroundColor: '#ffffff' }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}
                    onPress={() => {
                        navigation.goBack()
                    }}>
                    <Icon name="angle-left" size={26} color="#000000" />
                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginStart: 8,
                        color: "#000000",
                    }}> {title ? title : 'Back'}</Text>
                </TouchableOpacity>
                {
                    isVisible ? (<>
                        <TouchableOpacity style={{
                            justifyContent: 'flex-end',
                            alignItems: "center",
                            justifyContent: 'flex-end',
                            paddingStart: 15,
                            height: 35,
                            marginLeft: 20,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                        }}
                            onPress={onPress}>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 10,
                                height: 40,
                                flexDirection: 'row',
                            }}>
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: 18,
                                    fontFamily: 'nunito-bold',
                                    color: "#000",
                                }}>
                                    DataService
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </>) : (<>

                    </>)
                }

                {
                    isConnected ? (<>
                        <Material name="bluetooth-connect" size={26} color="#0273CC" />
                    </>) : (<>
                        <Material name="bluetooth-off" size={26} color="#0273CC" />
                    </>)
                }

                {
                    isShare ? (<>
                        <TouchableOpacity style={{
                            justifyContent: 'flex-end',
                            alignItems: "center",
                            justifyContent: 'flex-end',
                            height: 35,
                            marginLeft: 5,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                        }}
                            onPress={onSharePress}>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 40,
                                flexDirection: 'row',
                            }}>
                                <Material name="share-variant" size={26} color="#0273CC" />
                            </View>
                        </TouchableOpacity>
                    </>) : (<>

                    </>)
                }


            </View>
            <View style={{
                borderBottomColor: '#000',
                opacity: 0.2,
                borderBottomWidth: 1,
            }} />
        </View>

    );
}

export function HeaderTitleSettingsView({ title, navigation, onPress, isConnected = false, onDisconnectPress ,isShare = false, onSharePress}) {
    return (
        <View style={{ backgroundColor: '#ffffff' }}>
            <View style={{ flexDirection: 'row', height: 45, padding: 10, marginTop: 0, alignSelf: 'center', backgroundColor: '#ffffff' }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}
                    onPress={() => {
                        navigation.goBack()
                    }}>
                    <Icon name="angle-left" size={26} color="#000000" />
                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginStart: 8,
                        marginTop:2,
                        color: "#000000",
                    }}> {title ? title : 'Back'}</Text>
                </TouchableOpacity>

                {
                    isConnected ? (<>
                        <TouchableOpacity style={{
                            justifyContent: 'flex-end',
                            alignItems: "center",
                            justifyContent: 'flex-end',
                            height: 35,
                            marginLeft: 20,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                        }}
                            onPress={onDisconnectPress}>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 10,
                                marginEnd: 10,
                                height: 40,

                                flexDirection: 'row',
                            }}>
                                <Text style={{
                                    fontWeight: "bold",
                                    fontSize: 14,
                                    marginStart: 8,
                                    borderRadius: 10,
                                    padding: 5,
                                    backgroundColor: '#ededed',
                                    color: "#000",
                                }}> DisConnect</Text>
                            </View>
                        </TouchableOpacity>

                    </>) : (<>

                    </>)
                }


                {
                    isConnected ? (<>
                        <Material name="bluetooth-connect" size={26} color="#0273CC" />
                    </>) : (<>
                        <Material name="bluetooth-off" size={26} color="#0273CC" />
                    </>)
                }



                <TouchableOpacity style={{
                    justifyContent: 'flex-end',
                    alignItems: "center",
                    justifyContent: 'flex-end',
                    height: 35,
                    marginLeft: 20,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                }}
                    onPress={onPress}>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        marginEnd: 10,
                        height: 40,
                        flexDirection: 'row',
                    }}>
                        <Icon name="gear" size={26} color="#000000" />
                    </View>
                </TouchableOpacity>

                {
                    isShare ? (<>
                        <TouchableOpacity style={{
                            justifyContent: 'flex-end',
                            alignItems: "center",
                            justifyContent: 'flex-end',
                            height: 35,
                            marginLeft: 5,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                        }}
                            onPress={onSharePress}>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 40,
                                flexDirection: 'row',
                            }}>
                                <Material name="share-variant" size={26} color="#0273CC" />
                            </View>
                        </TouchableOpacity>
                    </>) : (<>

                    </>)
                }


            </View>
            <View style={{
                borderBottomColor: '#000',
                opacity: 0.2,
                borderBottomWidth: 1,
            }} />
        </View>

    );
}