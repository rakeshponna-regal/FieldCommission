/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import React from 'react';
import { byteArrayRawString, byteArrayString, byteString, byteToString, utf8ArrayToString } from './bleModule/utils';
import { bondedPeripherals } from './bleModule/BleCommands';
const globalstyles = require('.././assets/css/style');

export const DeviceList = React.memo(({ isConnectVisible, status, peripheral, connect, disconnect,bondedPeripherals }) => {
    const { name, rssi, connected ,id } = peripheral;
    const { advertising } = peripheral.advertising
    const bytes = peripheral.advertising.manufacturerData.bytes
    const dataSet = []
    let sensorName = ""
    let sensorNumber = ""
    let data = ""
    let combinedText = ""
    let Battery = ""
    let temp = ""
    let accelerometerError = ""
    let ADCError = ""
    let devicereset = ""
    let GPIOerror = ""
    if (Platform.OS == 'android') {
        //02 01 06 
        //06 09 53 37 31 30 30 
        //0f ff e1 0c ff ff ff ff ff ff ff 04 9b 07 06 1a 
        //00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
        sensorName = utf8ArrayToString(bytes.slice(4, 10))
        sensorNumber = byteArrayRawString(bytes.slice(14, 21)).toUpperCase()
        let  bondstatus = undefined
        if (bytes[10] == 15) {
            try {
                bondstatus = bondedPeripherals.map((adv) => adv.id === id);
            } catch (error) {
                console.log(error)
            }
            if(bondstatus){
                dataSet.push(`Bonding Status : ${bondstatus}`)
            }
            dataSet.push(`value : ${byteString(bytes[21])}`)
            dataSet.push(`value : ${byteString(bytes[22])}`)
            dataSet.push(`value : ${byteString(bytes[23])}`)
            dataSet.push(`value : ${byteString(bytes[24])}`)
            dataSet.push(`value : ${byteString(bytes[25])}`)
            dataSet.push(`value : ${byteString(bytes[26])}`)

             combinedText = dataSet.join('\n');
            
            Battery = ` value ${bondstatus}: ${byteString(bytes[21])} `
            temp = ` value : ${byteString(bytes[22])} `
            accelerometerError = ` value :${byteString(bytes[23])} `
            ADCError = ` value : ${byteString(bytes[24])} `
            devicereset = ` value : ${byteString(bytes[25])} `
            GPIOerror = ` value : ${byteString(bytes[26])} `
        }
    } else {
        //225, 12, 255, 255, 255, 255, 255, 255, 255, 4, 3, 6, 236, 25
        //e1 0c ff ff ff ff ff ff ff 04 03 06 ec 19
        console.log(bytes)
        sensorName = name
        sensorNumber = byteArrayRawString(bytes.slice(2, 9))
            Battery = ` value : ${byteString(bytes[9])} `
            temp = ` value : ${byteString(bytes[10])} `
            accelerometerError = ` value :${byteString(bytes[11])} `
            ADCError = ` value : ${byteString(bytes[12])} `
            devicereset = ` value : ${byteString(bytes[13])} `
    }
    console.log(bytes)
    console.log(byteArrayString(bytes))
    console.log(sensorName)
    return (
        <>
         {sensorName && (
                <View style={globalstyles.deviceContainer}>
                    <View style={globalstyles.deviceItem}>
                        <Text style={globalstyles.deviceName}>{sensorName}</Text>
                        <Text style={globalstyles.deviceInfo}> ID : {id}</Text>
                        <Text style={globalstyles.deviceInfo}> RSSI : {rssi}</Text>
                        <Text style={globalstyles.deviceInfo}> serial Number : {sensorNumber}</Text>
                        <Text style={globalstyles.deviceInfo}> {combinedText}</Text>
                        {/* <Text style={globalstyles.deviceInfo}> {temp}</Text>
                        <Text style={globalstyles.deviceInfo}> {accelerometerError}</Text>
                        <Text style={globalstyles.deviceInfo}> {ADCError}</Text>
                        <Text style={globalstyles.deviceInfo}> {devicereset}</Text>
                        <Text style={globalstyles.deviceInfo}> {GPIOerror}</Text> */}
                    </View>
                    {
                        isConnectVisible == true && (
                            <TouchableOpacity
                                onPress={() => {
                                    console.log("action clicked", connected, status)
                                    status ? disconnect(peripheral) : connect(peripheral)
                                }
                                }
                            >
                                <View style={globalstyles.deviceButton}>
                                    <Text
                                        style={[
                                            globalstyles.scanButtonText,
                                            { fontWeight: 'bold', fontSize: 16 },
                                        ]}>
                                        {status ? 'Disconnect' : 'Connect'}
                                    </Text>
                                </View>

                            </TouchableOpacity>)
                    }
                </View>
            )}
           
        </>
    );
});