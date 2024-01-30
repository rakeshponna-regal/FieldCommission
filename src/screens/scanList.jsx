import React, { useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity,View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { listenForBleEvents, startScanning, stopScanning ,startDeviceScan} from '../store/bleSlice';
import { initializeBleManager } from '../components/bleModule/bleManager';

const ScanList = () => {

    const dispatch = useDispatch();
    const { scanning, devices, connectedDevice ,discoverDevice } = useSelector((state) => state.ble);
    console.log("discoverDevice",discoverDevice)
    useEffect(() => {
        // Initialize the BleManager and set up event listeners
        initializeBleManager(dispatch);
        dispatch(listenForBleEvents())

        // Cleanup function
        return () => {
            dispatch(listenForBleEvents.cancel())
            // Remove event listeners or perform cleanup if necessary
        };
    }, [dispatch]);

    const handleStartScanning = () => {
        // dispatch(startDeviceScan());
        // Add logic to start scanning for BLE devices using react-native-ble-manager
    };

    const handleStopScanning = () => {
        dispatch(stopScanning());
        // Add logic to stop scanning for BLE devices
    };

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.buttonView, { opacity: scanning ? 0.7 : 1 }]}
                    onPress={()=>{
                        handleStartScanning()
                    }}>
                    <Text style={[styles.buttonText]}>
                        {scanning ? 'Searching' : 'Scan'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ScanList

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