import React, { useEffect, useState } from 'react'
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, View, ListItem, TouchableOpacity, Alert, PermissionsAndroid, ToastAndroid } from 'react-native'
import { HeaderView } from '../components/header'
import Loader from '../components/Loader'
import { bondedPeripherals, commissionCommand, connectBleDevice, createBond, disconnectBleDevice, initializeBluetooth, isS7100SenosorAvailable, readCharacteristicData, scan, scanDevice, sleep, start, stopScanDevice, systumClockCommand as systemClockCommand, writeData } from '../components/bleModule/BleCommands'
import NativeEventBluetoothEmitter from '../components/bleModule/NativeEventBluetoothEmitter';
import { BleEventType, BleState } from '../components/bleModule/type';
import { binaryValue, byteArrayRawString, byteArrayString, byteString, convertBinaryValue, parseSensorFlags, utf8ArrayToString } from '../components/bleModule/utils'
import { SensorCommisionService, SettingsService } from '../components/bleModule/Characteristic'
import { Buffer } from "buffer";
import BleManager from 'react-native-ble-manager';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment'
import { addAdvatisementPakest, addScanAdvatisementPakest, clearScanState } from '../store/sensorslice'
import { advatisementDataSelector, sacnnedAdvatisementDataSelector } from '../store/selector'
import { showMessage } from 'react-native-flash-message'

const nativeEventBluetoothEmitter = new NativeEventBluetoothEmitter()
const globalstyles = require('.././assets/css/style');

const DeviceScanList = ({ navigation }) => {
    const dispatch = useDispatch();
    const scannedList = useSelector((state) => state.sensorData.scanAdvatisementPackts)
    const peripherals = new Map();
    const [scaning, setScanning] = useState(false);
    const [isConnectStatus, setConnectStatus] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bondedList, setBondedList] = useState([]);
    const [discoveredList, setDiscoveredList] = useState([]);
    const [peripheralId, setPeripheralId] = useState('');

    /* initlize and get bonded devices list */
    useEffect(
        () => {
            dispatch(clearScanState())
            initializeBluetooth()
            // if(Platform.OS == 'android'){
            //     initializeBluetooths()
            // }else{
            //     initializeBluetooth()
            // }
        }, []
    )

    const initializeBluetooths = () => {
        enableBluetooth()
    }

    const enableBluetooth = async () => {
        const isEnabled = await BleManager.checkState();
        console.log('BleManager checkState.', isEnabled);
        if (isEnabled == BleState.On) {
            console.log('Bluetooth is enabled.');
            if (Platform.OS == "android") {
                BleManager.enableBluetooth()
                    .then(() => {
                        console.log('The bluetooh is already enabled or the user confirm');
                        handleAndroidPermissions()
                    })
                    .catch(error => {
                        console.log('The user refuse to enable bluetooth', error);
                    });
            } else {
                BleManager.enableBluetooth()
                    .then(() => {
                        console.log('The bluetooh is already enabled or the user confirm');
                        start()
                    })
                    .catch(error => {
                        // Alert.alert('Please turn on mobile phone Bluetooth');
                        console.log('IOS The user refuse to enable bluetooth', error);
                    });
            }
        } else if (isEnabled == BleState.Off) {
            console.log('Bluetooth is disabled.', isEnabled);
            if (Platform.OS == "android") {
                BleManager.enableBluetooth()
                    .then(() => {
                        console.log('The bluetooh is already enabled or the user confirm');
                        handleAndroidPermissions()
                    })
                    .catch(error => {
                        console.log('android The user refuse to enable bluetooth', error);
                    });
            } else {
                BleManager.enableBluetooth()
                    .then(() => {
                        console.log('The bluetooh is already enabled or the user confirm');
                        start()
                    })
                    .catch(error => {

                        console.log('IOS The user refuse to enable bluetooth', error);
                    });
            }
        }


    }

    const handleAndroidPermissions = () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]).then(result => {
                if (result) {
                    start()
                    if (Platform.OS === 'android')
                        handleGetBondedDevices()
                    console.debug(
                        '[handleAndroidPermissions] User accepts runtime permissions android 12+',
                    );
                } else {
                    console.error(
                        '[handleAndroidPermissions] User refuses runtime permissions android 12+',
                    );
                }
            });
        } else if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ).then(checkResult => {
                if (checkResult) {
                    start()
                    if (Platform.OS === 'android')
                        handleGetBondedDevices()
                    console.debug(
                        '[handleAndroidPermissions] runtime permission Android <12 already OK',
                    );
                } else {
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ).then(requestResult => {
                        if (requestResult) {
                            start()
                            if (Platform.OS === 'android')
                                handleGetBondedDevices()
                            console.debug(
                                '[handleAndroidPermissions] User accepts runtime permission android <12',
                            );
                        } else {
                            console.error(
                                '[handleAndroidPermissions] User refuses runtime permission android <12',
                            );
                        }
                    });
                }
            });
        } else {
            start()
            if (Platform.OS === 'android')
                handleGetBondedDevices()
        }
    };

    const handleGetBondedDevices = async () => {
        if (Platform.OS == "android")
            try {
                const peripheralsFromPromise = await bondedPeripherals();
                for (let i = 0; i < peripheralsFromPromise.length; i++) {
                    let peripheral = peripheralsFromPromise[i];
                    peripherals.set(peripheral.id, peripheral);
                }
                setBondedList(Array.from(peripherals.values()))
                console.log(bondedList)
            } catch (error) {
                console.error("BondedPeripherals devices", error);
            }
    }

    /* Ble Native callback Listners */

    useEffect(
        () => {
            /* handle Stop Scan Listner */
            const handleStopScan = (peripheral) => {
                console.log('Scanning is stopped');
                setScanning(false);
            }
            const stopScanListener = nativeEventBluetoothEmitter.addListener(
                BleEventType.BleManagerStopScan,
                handleStopScan,
            );

            /* handle Disconnect Listner */
            const handleDisconnectPeripheral = (data) => {
                console.log('handleDisconnectPeripheral:> ', data);
                setPeripheralId('')
                if (Platform.OS == "android") {
                    if (data.description != undefined)
                        Alert.alert(data.description)
                    else if (data.status == 0) {
                        // Alert.alert("Connection failed or Dis connected")
                        setDiscoveredList([]);
                        dispatch(clearScanState())
                    }
                } else {
                    if (data.code == 7) {
                        Alert.alert("Disconned")
                    }
                    if (data.description != undefined)
                        Alert.alert(data.description)
                    else if (data.status == 0) {
                        Alert.alert("Connection failed or Dis connected")
                        setDiscoveredList([]);
                        dispatch(clearScanState())
                    }
                }
                setLoading(false)
            }

            const disconnectPeripheralListener = nativeEventBluetoothEmitter.addListener(
                BleEventType.BleManagerDisconnectPeripheral,
                handleDisconnectPeripheral,
            );


            /* Handle Discoverd Device */

            const handleDiscoverPeripheral = (peripheral) => {
                // console.log(peripheral)
                let isS7100Available = isS7100SenosorAvailable(peripheral)
                if (isS7100Available) {
                    console.log('isS7100Available:> Found', peripheral.id);
                    formatSensorAdvatisement(peripheral)
                    // setDiscoveredList((prevPeripherals) => {
                    //     // Check if the peripheral is already in the state
                    //     const isPeripheralExist = prevPeripherals.some((p) => p.id === peripheral.id);
                    //     // If the peripheral is not in the state, add it
                    //     if (!isPeripheralExist) {
                    //         return [...prevPeripherals, peripheral];
                    //     }
                    //     // If the peripheral is already in the state, update it
                    //     return prevPeripherals.map((p) =>
                    //         p.id === peripheral.id ? { ...p, ...peripheral } : p
                    //     );
                    // });
                }
            }

            const discoverPeripheralListener = nativeEventBluetoothEmitter.addListener(
                BleEventType.BleManagerDiscoverPeripheral,
                handleDiscoverPeripheral,
            );

            const handleUpdateState = (event) => {
                if (event.state === BleState.Unsupported) {
                    // unSupportBle()
                    // setScaning(false)
                    console.log('BleState Unsupported')
                    if (Platform.OS == 'android') {
                        ToastAndroid.showWithGravityAndOffset(
                            'Bluetooth unsupported',
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50,
                        );
                    } else {
                        Alert.alert("Alert", "Bluetooth unsupported");
                    }
                } else if (event.state === BleState.On) {
                    // scanDevice();
                    console.log('BleState On')
                } else if (event.state === BleState.Off) {
                    console.log('BleState OFF')
                    enableBle()
                }
            }

            const updateStateListener = nativeEventBluetoothEmitter.addListener(
                BleEventType.BleManagerDidUpdateState,
                handleUpdateState,
            );

            return () => {
                disconnectPeripheralListener.remove();
                stopScanListener.remove();
                discoverPeripheralListener.remove();
                updateStateListener.remove();
            };
        }, [scaning, discoveredList]
    )

    const enableBle = () => {
        if (Platform.OS === 'ios') {
            Alert.alert('Please turn on mobile phone Bluetooth');
        } else {
            // Alert.alert('Alert', 'Please turn on mobile phone Bluetooth', [
            //     {
            //         text: 'Cancel',
            //         onPress: () => { },
            //     },
            //     {
            //         text: 'open',
            //         onPress: () => {
            //             enableBluetooth();
            //         },
            //     },
            // ]);
        }
    }

    const formatSensorAdvatisement = (peripheral) => {
        // console.log("peripheral", peripheral)
        const { name, rssi, connected, id } = peripheral;
        const bytes = peripheral.advertising.manufacturerData.bytes
        const dataSet = []
        let sensorName = name
        let sensorNumber = ""
        let dateTime = moment().format('MM-DD-YYYY HH:mm:ss');
        let advertisementData = {
            sensorTime: dateTime,
            mac_address: id,
            rssi: rssi,
            peripheral: peripheral
        }
        // console.log("dateTime",dateTime)
        let bondstat = false
        // console.log("bytes",bytes)
        if (Platform.OS == 'android') {
            //02 01 06 
            //06 09 53 37 31 30 30 
            //0f ff e1 0c ff ff ff ff ff ff ff 04 9b 07 06 1a 
            //00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
            sensorName = utf8ArrayToString(bytes.slice(4, 10))
            sensorNumber = byteArrayRawString(bytes.slice(14, 21)).toUpperCase()

            if (bytes[10] == 15) {
                try {
                    bondstat = bondedList.some((adv) => adv.id === id);
                } catch (error) {
                    console.log("bondstatus error", bondstat)
                }
                let sensorFlag = `${convertBinaryValue(byteString(bytes[21]))}${convertBinaryValue(byteString(bytes[22]))}`
                let btry = parseInt(`${byteString(bytes[23])}${byteString(bytes[24])}`, 16) / 1000   //bytes[23]  bytes[24]
                let temp = `${bytes[25]} °C`
                advertisementData.bondstatus = bondstat
                advertisementData.battery = `${btry} V`
                advertisementData.temperature = temp
                let dataset = parseSensorFlags(sensorFlag)
                advertisementData.data = dataset
                // console.log("object", advertisementData)
            }
        } else {
            //225, 12, 255, 255, 255, 255, 255, 255, 255, 4, 3, 6, 236, 25
            //e1 0c ff ff ff ff ff ff ff 04 03 06 ec 19
            try {
                // console.log(bytes)
                sensorName = name
                sensorNumber = byteArrayRawString(bytes.slice(2, 9))
                let sensorFlag = `${convertBinaryValue(byteString(bytes[9]))}${convertBinaryValue(byteString(bytes[10]))}`
                let btry = parseInt(`${byteString(bytes[11])}${byteString(bytes[12])}`, 16) / 1000   //bytes[23]  bytes[24]
                let temp = `${bytes[13]} °C`
                advertisementData.bondstatus = bondstat
                advertisementData.battery = `${btry} V`
                advertisementData.temperature = temp
                let dataset = parseSensorFlags(sensorFlag)
                advertisementData.data = dataset
                // console.log("object", advertisementData)
            } catch (error) {
                console.log(error)
            }
        }
        // console.log(bytes)
        // console.log(byteArrayString(bytes))
        // console.log(sensorName, sensorNumber)
        if (Platform.OS == 'android') {
            advertisementData.sensor_name = sensorName.trim()
            advertisementData.sensor_number = sensorNumber.trim()
        } else {
            advertisementData.sensor_name = sensorName.toUpperCase();
            advertisementData.sensor_number = sensorNumber.toUpperCase();
        }
        // console.log("formatSensorAdvatisement",advertisementData)
        dispatch(addScanAdvatisementPakest(advertisementData))
        dispatch(addAdvatisementPakest(advertisementData))
    }

    const _handleScan = async () => {
        setDiscoveredList([])
        dispatch(clearScanState())
        if (!scaning) {
            console.log("Starting scan ", status)
            let status = await scanDevice()
            if (status) {
                setScanning(true)
            }
            console.log("scanDevice => ", status)
        } else {
            console.log("Stopping scan ", status)
            let status = await stopScanDevice()
            sleep(1000)
            if (status) {
                setScanning(false)
            }
        }
    }

    const _handleRefresh = async () => {
        setDiscoveredList([])
        dispatch(clearScanState())
        if (!scaning) {
            let status = await scanDevice()
            if (status) {
                setScanning(true)
            }
            console.log("scanDevice => ", status)
        }
    };

    const _handleDisconnect = async (peripheral) => {
        console.log("_handleDisconnect ", peripheral)
        let status = await disconnectBleDevice(peripheral.id)
    };

    const _handleConnect = async (peripheral, sensorNUmber) => {
        try {
            console.log("_handleConnect ", peripheral)
            setLoading(true)
            let status = await stopScanDevice()
            if (status) {
                setScanning(false)
            }
            await sleep(800);
            console.log("connectDevice peripheralID", peripheral.id, scaning)
            let peripheralInfo = await connectBleDevice(peripheral.id)
            if(typeof peripheralInfo === 'string'){
                if (Platform.OS == 'android') {
                    if (peripheralInfo.includes('Connection error')) {
                        Alert.alert("Connection error", peripheralInfo)
                        return
                    }
                    if (peripheralInfo.includes('Peer removed pairing information')) {
                        Alert.alert("Connection error", peripheralInfo)
                        return
                    }
                }
            } 

            let macAddess = ''
            if (peripheralInfo.id == undefined) {
                macAddess = peripheral.id
            } else {
                macAddess = peripheralInfo.id
            }
            if (peripheralInfo) {
                // requestMTUSize(macAddess)
                // await sleep(500);
                console.log("dashboard=>", macAddess, peripheralInfo.name, peripheral)
                sleep(1000)
                let bondingStatus = await readCharacteristicData(peripheralInfo.id, SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_BONDING_STATUS)
                console.log("bondingStatus", bondingStatus)
                if (bondingStatus) {
                    if (bondingStatus == 1) {
                        let sysClock = await writeData(macAddess, systemClockCommand(), SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
                        if (sysClock.includes('success')) {
                            console.log("Write Success on systumClockCommand")
                        } else {
                            Alert.alert("Failed to set TimeStamp ")
                            return
                        }

                        navigation.navigate("dashboard", {
                            bleReceiveData: peripheral,
                            peripheralID: macAddess,
                            peripheralName: peripheralInfo.name,
                            sensorNumber: sensorNUmber
                        })
                    } else {
                        let commision = await writeData(macAddess, commissionCommand(), SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_REGAL_KEY)
                        if (commision.includes('success')) {
                            console.log("Write Success on commissionCommand")
                        } else {
                            Alert.alert("Commisioning to Sensor failed ")
                            return
                        }
                        try {
                            if (Platform.OS == "android") {
                                let status = await createBond(macAddess)
                                console.log("status", status)
                                if (status.includes("success")) {
                                    console.log('created bond')
                                } else {
                                    Alert.alert("Failed to create bond connection or Bond request has been denied")
                                    return
                                }
                            }
                        } catch (error) {
                            Alert.alert("Failed to create bond connection or Bond request has been denied")
                            return
                        }

                        let sysClock = await writeData(macAddess, systemClockCommand(), SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
                        if (sysClock.includes('success')) {
                            console.log("Write Success on systumClockCommand")
                        } else {
                            Alert.alert("Failed to set TimeStamp ")
                            return
                        }

                        navigation.navigate("dashboard", {
                            bleReceiveData: peripheral,
                            peripheralID: macAddess,
                            peripheralName: peripheralInfo.name,
                            sensorNumber: sensorNUmber
                        })
                    }
                } else {
                    Alert.alert(" Bonding unsuccessful")
                }
            }
        } catch (error) {
            Alert.alert("Exit from Connect", error)
            console.log(error)
        } finally {
            setLoading(false)
        }


    };

    const _render_Item = (txt, value) => {
        return (
            <View style={{ flex: 1, flexDirection: 'row', }}>
                <View style={{ flex: 1, marginStart: 5 }}>
                    <Text style={{ color: '#000', }}>{txt}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: 'right', marginEnd: 20, color: '#000', }}>{value}</Text>
                </View>
            </View>
        )
    }

    const _renderItem = (data) => {
        const peripheral = data.item
        // console.log("peripheral", peripheral)
        const { name, rssi, connected, id } = peripheral;
        const bytes = peripheral.advertising.manufacturerData.bytes
        const dataSet = []
        let sensorName = ""
        let sensorNumber = ""
        let combinedText = ""
        let dateTime = moment().format('MM-DD-YYYY h:mm');
        let advertisementData = {
            sensorTime: dateTime,
            mac_address: id,
            rssi: rssi,
        }

        console.log("dateTime", dateTime)
        if (Platform.OS == 'android') {
            //02 01 06 
            //06 09 53 37 31 30 30 
            //0f ff e1 0c ff ff ff ff ff ff ff 04 9b 07 06 1a 
            //00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
            sensorName = utf8ArrayToString(bytes.slice(4, 10))
            sensorNumber = byteArrayRawString(bytes.slice(14, 21)).toUpperCase()
            let bondstat = undefined
            if (bytes[10] == 15) {
                try {
                    bondstat = bondedList.some((adv) => adv.id === id);
                } catch (error) {
                    console.log("bondstatus error", bondstat)
                }
                let sensorFlag = `${convertBinaryValue(byteString(bytes[21]))}${convertBinaryValue(byteString(bytes[22]))}`
                let btry = parseInt(`${byteString(bytes[23])}${byteString(bytes[24])}`, 16) / 1000   //bytes[23]  bytes[24]
                let temp = `${bytes[25]} °C`

                advertisementData.bondstatus = bondstat
                advertisementData.battery = `${btry} V`
                advertisementData.temperature = temp
                let dataset = parseSensorFlags(sensorFlag)
                advertisementData.data = dataset
                console.log("object", advertisementData)
            }
        } else {
            //225, 12, 255, 255, 255, 255, 255, 255, 255, 4, 3, 6, 236, 25
            //e1 0c ff ff ff ff ff ff ff 04 03 06 ec 19
            console.log(bytes)
            sensorName = name
            sensorNumber = byteArrayRawString(bytes.slice(2, 9))
            let sensorFlag = `${convertBinaryValue(byteString(bytes[9]))}${convertBinaryValue(byteString(bytes[10]))}`
            let btry = parseInt(`${byteString(bytes[11])}${byteString(bytes[12])}`, 16) / 1000   //bytes[23]  bytes[24]
            let temp = `${bytes[13]} °C`
            advertisementData.bondstatus = bondstat
            advertisementData.battery = `${btry} V`
            advertisementData.temperature = temp
            let dataset = parseSensorFlags(sensorFlag)
            advertisementData.data = dataset
            console.log("object", advertisementData)

            dataSet.push(`value : ${byteString(bytes[9])}`)
            dataSet.push(`value : ${byteString(bytes[10])}`)
            dataSet.push(`value : ${byteString(bytes[11])}`)
            dataSet.push(`value : ${byteString(bytes[12])}`)
            dataSet.push(`value : ${byteString(bytes[13])}`)
        }
        console.log(bytes)
        // console.log(byteArrayString(bytes))
        console.log(sensorName, sensorNumber)
        advertisementData.sensor_name = sensorName.trim()
        console.log("advertisementData", advertisementData)
        dispatch(addAdvatisementPakest(advertisementData))
        return (
            <>
                {sensorName && (

                    <View>
                        <View style={[globalstyles.deviceContainer]}>
                            <View style={{}}>
                                <Text style={globalstyles.deviceName}>{sensorName}</Text>
                                <Text style={globalstyles.deviceInfo}> ID : {id}</Text>
                                <Text style={globalstyles.deviceInfo}> RSSI : {rssi}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log("action clicked", scaning, isConnectStatus)
                                    isConnectStatus ? _handleDisconnect(peripheral) : _handleConnect(peripheral)
                                }
                                }
                            >
                                <View style={[globalstyles.deviceButton, { marginEnd: 10 }]}>
                                    <Text
                                        style={[
                                            globalstyles.scanButtonText,
                                            { fontWeight: 'bold', fontSize: 16 },
                                        ]}>
                                        {isConnectStatus ? 'Disconnect' : 'Connect'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {_render_Item('Serial Number', sensorNumber)}
                        {_render_Item('Date', advertisementData.sensorTime)}
                        {_render_Item('Bonding Status', advertisementData.bondstatus ? 'True' : 'False')}
                        {_render_Item('Battery Status', advertisementData.battery)}
                        {_render_Item('Temperature', advertisementData.temperature)}
                        {_render_Item('Commissioned', advertisementData.data.commission ? 'True' : 'False')}
                        {_render_Item('New Accelerometer data', advertisementData.data.accelerometer ? 'True' : 'False')}
                        {_render_Item('New Low Freq Data', advertisementData.data.lowFeq ? 'True' : 'False')}
                        {_render_Item('New Battery Data', advertisementData.data.bty ? 'True' : 'False')}
                        {_render_Item('New Temperature Data', advertisementData.data.temp ? 'True' : 'False')}
                        {_render_Item('Accelerometer Error', advertisementData.data.accelError ? 'True' : 'False')}
                        {_render_Item('ADC fault', advertisementData.data.adcError ? 'True' : 'False')}
                        {_render_Item('Device Config Settings', advertisementData.data.DeviceSettings ? 'Default' : 'Custom')}
                        {_render_Item('GPIO Error', advertisementData.data.gpioError ? 'True' : 'False')}
                        <View style={[{ marginBottom: 15 }]}></View>
                    </View>

                )}
            </>
        )
    };

    const _renderAdvItem = (adverData) => {
        let advertisementData = adverData.item
        return (
            <>
                {advertisementData.sensor_name && (

                    <View style={[globalstyles.deviceItem]} key={advertisementData.rss}>
                        <View style={[globalstyles.deviceContainer]}>
                            <View style={{}}>
                                <Text style={globalstyles.deviceName}>{advertisementData.sensor_name}</Text>
                                {
                                    Platform.OS == 'android' ? (
                                        <Text style={globalstyles.deviceInfo}>ID  :{advertisementData.mac_address}</Text>
                                    ) : (<></>)
                                }
                                <Text style={globalstyles.deviceInfo}> RSSI : {advertisementData.rssi} dBm</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log("action clicked", scaning, isConnectStatus)
                                    isConnectStatus ? _handleDisconnect(advertisementData.peripheral) : _handleConnect(advertisementData.peripheral, advertisementData.sensor_number)
                                }
                                }
                            >
                                <View style={[globalstyles.deviceButton, { marginEnd: 10 }]}>
                                    <Text
                                        style={[
                                            globalstyles.scanButtonText,
                                            { fontWeight: 'bold', fontSize: 16 },
                                        ]}>
                                        {isConnectStatus ? 'Disconnect' : 'Connect'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {_render_Item('Serial Number', advertisementData.sensor_number)}
                        {_render_Item('Date', advertisementData.sensorTime)}
                        {_render_Item('Bonding Status', advertisementData.bondstatus ? 'True' : 'False')}
                        {_render_Item('Battery Status', advertisementData.battery)}
                        {_render_Item('Temperature', advertisementData.temperature)}
                        {_render_Item('Commissioned', advertisementData.data.commission ? 'True' : 'False')}
                        {_render_Item('New Accelerometer data', advertisementData.data.accelerometer ? 'True' : 'False')}
                        {_render_Item('New Low Freq Data', advertisementData.data.lowFeq ? 'True' : 'False')}
                        {_render_Item('New Battery Data', advertisementData.data.bty ? 'True' : 'False')}
                        {_render_Item('New Temperature Data', advertisementData.data.temp ? 'True' : 'False')}
                        {_render_Item('Accelerometer Error', advertisementData.data.accelError ? 'True' : 'False')}
                        {_render_Item('ADC fault', advertisementData.data.adcError ? 'True' : 'False')}
                        {_render_Item('Device Config Settings', advertisementData.data.DeviceSettings ? 'Default' : 'Custom')}
                        {_render_Item('GPIO Error', advertisementData.data.gpioError ? 'True' : 'False')}
                        <View style={[{ marginBottom: 25 }]}></View>
                    </View>

                )}
            </>
        )
    };

    const _handleLogs = async () => {
        let status = await stopScanDevice()
        sleep(1000)
        // navigation.navigate('dashboardLogs')
        navigation.navigate('advertiementLogs')
    }


    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={styles.safeContainerStyle}>
            <HeaderView navigation={navigation} onPress={_handleScan} isScanning={scaning} onLogPress={_handleLogs} />
            <View style={styles.containerView} >
                <Loader loading={loading} />
                {/* {discoveredList.length > 0 ? (
                    <FlatList
                        data={discoveredList}
                        keyExtractor={item => item.id}
                        renderItem={_renderItem}
                        ListEmptyComponent={() => <Text>No Devices found</Text>}
                        refreshing={refreshing}
                        onRefresh={_handleRefresh} />
                ) : (
                    <View style={[styles.containerView]}>
                        <Text style={styles.text}>No Bluetooth devices found</Text>
                    </View>
                )
                } */}
                {scannedList.length > 0 ? (
                    <FlatList
                        data={scannedList}
                        keyExtractor={item => item.mac_address}
                        renderItem={_renderAdvItem}
                        ListEmptyComponent={() => <Text>No Devices found</Text>}
                        refreshing={refreshing}
                        onRefresh={_handleRefresh} />
                ) : (
                    <View style={[styles.containerView]}>
                        <Text style={styles.text}>No Bluetooth devices found</Text>
                    </View>
                )
                }
            </View>
        </SafeAreaView>
    )
}

export default DeviceScanList

const styles = StyleSheet.create({
    safeContainerStyle: {
        backgroundColor: '#ededed',
        flex: 1,
    },
    containerView: {
        padding: 5,
        marginEnd: 5,
        marginRight: 5,
        color: "white"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    text: {
        color: '#000',
        justifyContent: 'center',
        alignContent:'center',
        alignSelf:'center',
        fontSize: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    dateTime: {
        paddingTop: 20,
    },

    input: {
        height: 40,
        width: 50,
        borderWidth: 1,
        borderColor: "rgba(27,31,35,0.05)",
        padding: 10,
        backgroundColor: "rgba(27,31,35,0.05)",
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#05a5d1",
        padding: 10,
        width: 150,
        height: 40,
    },
    buttonDisable: {
        backgroundColor: "#cccccc",
        color: "#666666",
        alignItems: "center",
        padding: 10,
        width: 150,
        height: 40,
        marginLeft: 20,
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
    },

});
