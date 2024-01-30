import React, { useEffect, useState } from 'react'
import { Alert, Button, FlatList, Platform, SafeAreaView, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import { bondedPeripherals, checkS7100Senosor, commissionCommand, connectBleDevice, connectedPeripherals, createBond, disconnectBleDevice, enableBluetooth, initializeBluetooth, isS7100SenosorAvailable, readCharacteristicData, requestMTUSize, scan, sleep, stopScan, systumClockCommand, writeData } from '../components/bleModule/BleCommands';
import NativeEventBluetoothEmitter from '../components/bleModule/NativeEventBluetoothEmitter';
import { BleEventType } from '../components/bleModule/type';
import CustomHeader from '../components/customHeader';
import { DeviceList } from '../components/DeviceList';
import { Buffer } from "buffer";
import BleManager, { BleState } from 'react-native-ble-manager';
import { byteToString, stringToByte } from '../components/bleModule/utils';
import { DeviceInformationService, SensorCommisionService, SettingsService } from '../components/bleModule/Characteristic';
import Loader from '../components/Loader';
import { platform } from 'os';

const nativeEventBluetoothEmitter = new NativeEventBluetoothEmitter()
const globalstyles = require('.././assets/css/style');

const SensorScanning = ({ navigation }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [scaning, setScaning] = useState(false);
    const [peripheralID, setPeripheralID] = useState('');
    const peripherals = new Map()
    const [connectedPeripheralsState, setConnectedPeripheralsState] = useState();
    const [bondedPeripheralsState, setBondedPeripheralsState] = useState([]);
    const [dicoverPeripheralsState, setDiscoverPeripheralsState] = useState([]);
    const [deviceInformation, setDeviceInformation] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initializeBluetooth();
        if (Platform.OS === 'android')
            handleGetBondedDevices()
    }, []);

    const handleGetConnectedDevices = async () => {
        try {
            const peripheralsFromPromise = await connectedPeripherals();
            console.log("Connected Devices: ", peripheralsFromPromise);
            for (let i = 0; i < peripheralsFromPromise.length; i++) {
                let peripheral = peripheralsFromPromise[i];
                peripherals.set(peripheral.id, peripheral);
                setConnectedPeripheralsState(Array.from(peripherals.values()))
            }
        } catch (error) {
            console.error("Error getting connected devices:", error);
            // Handle the error as needed
        }
    };
    const handleGetBondedDevices = async () => {
        if (Platform.OS == "android")
            try {
                const peripheralsFromPromise = await bondedPeripherals();
                console.log("Bonded Devices: ", peripheralsFromPromise);
                for (let i = 0; i < peripheralsFromPromise.length; i++) {
                    let peripheral = peripheralsFromPromise[i];
                    if (peripheral?.name == "S7100") {
                        peripherals.set(peripheral.id, peripheral);
                        setBondedPeripheralsState(Array.from(peripherals.values()))
                    }
                }
            } catch (error) {
                console.error("BondedPeripherals devices", error);
                // Handle the error as needed
            }
    }

    useEffect(() => {

        const handleDiscoverPeripheral = (peripheral) => {
            // console.log('handleDiscoverPeripheral:> ', peripheral);
            let isS7100Available = isS7100SenosorAvailable(peripheral)

            if (isS7100Available) {
                console.log('isS7100Available:> Found');
                setDiscoverPeripheralsState((prevPeripherals) => {
                    // Check if the peripheral is already in the state
                    const isPeripheralExist = prevPeripherals.some((p) => p.id === peripheral.id);
                
                    // If the peripheral is not in the state, add it
                    if (!isPeripheralExist) {
                      return [...prevPeripherals, peripheral];
                    }
                    // If the peripheral is already in the state, update it
                    return prevPeripherals.map((p) =>
                      p.id === peripheral.id ? { ...p, ...peripheral } : p
                    );
                  });
                // peripherals.set(peripheral.id, peripheral);
                // setDiscoverPeripheralsState(Array.from(peripherals.values()))
            } else {
                // console.log('isS7100Available:> Not Found');
            }
        }

        const discoverPeripheralListener = nativeEventBluetoothEmitter.addListener(
            BleEventType.BleManagerDiscoverPeripheral,
            handleDiscoverPeripheral,
        );
        return () => {
            discoverPeripheralListener.remove();
        };

    }, [dicoverPeripheralsState])

    useEffect(() => {

        const handleDisconnectPeripheral = (data) => {
            console.log('handleDisconnectPeripheral:> ', data);
            setIsConnected(false)
            setPeripheralID('')
            if (Platform.OS == "android") {
                if (data.description != undefined)
                    Alert.alert(data.description)
                else if (data.status == 0) {
                    Alert.alert("Connection failed or Dis connected")
                    setDiscoverPeripheralsState([]);
                }
            } else {
                if (data.code == 7) {
                    Alert.alert("Disconned")
                }
                if (data.description != undefined)
                    Alert.alert(data.description)
                else if (data.status == 0) {
                    Alert.alert("Connection failed or Dis connected")
                    setDiscoverPeripheralsState([]);
                }
            }
            setLoading(false)
        }

        const disconnectPeripheralListener = nativeEventBluetoothEmitter.addListener(
            BleEventType.BleManagerDisconnectPeripheral,
            handleDisconnectPeripheral,
        );
        return () => {
            disconnectPeripheralListener.remove();
        };
    }, [])

    useEffect(() => {

        const handleUpdateState = (event) => {
            if (event.state === BleState.Unsupported) {
                // unSupportBle()
                setScaning(false)
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
                scanDevice();
                handleGetConnectedDevices();
                handleGetBondedDevices()
            } else if (event.state === BleState.Off) {
                enableBle()
            }
        }

        const updateStateListener = nativeEventBluetoothEmitter.addListener(
            BleEventType.BleManagerDidUpdateState,
            handleUpdateState,
        );
        return () => {
            updateStateListener.remove();
        };
    }, [])


    useEffect(() => {

        const handleStopScan = (peripheral) => {
            console.log('Scanning is stopped');
            setScaning(false);
        }

        const stopScanListener = nativeEventBluetoothEmitter.addListener(
            BleEventType.BleManagerStopScan,
            handleStopScan,
        );
        return () => {
            stopScanListener.remove();
        };

    }, [scaning])

    const enableBle = () => {
        if (Platform.OS === 'ios') {
            Alert.alert('Please turn on mobile phone Bluetooth');
        } else {
            Alert.alert('Alert', 'Please turn on mobile phone Bluetooth', [
                {
                    text: 'Cancel',
                    onPress: () => { },
                },
                {
                    text: 'open',
                    onPress: () => {
                        enableBluetooth();
                    },
                },
            ]);
        }
    }

    const scanDevice = () => {

        setDiscoverPeripheralsState([])
        setDeviceInformation([])
        if (!scaning) {
            console.log("scanDevice called ", scaning)
            scan()
                .then(() => {
                    setScaning(true);
                    console.log("scanDevice called true")
                })
                .catch(err => {
                    setScaning(false);
                    console.log("scanDevice called", err)
                });
        }
    }

    const disConnectDevice = async () => {
        try {
            if (!scaning) {
                await disconnectBleDevice(peripheralID)
                setScaning(false);
                setIsConnected(false)
                setPeripheralID('')
            }
        } catch (error) {
            console.error("Error during disConnectDevice:", error);
            setScaning(false);
            setIsConnected(false)
        }
    }

    const connectDevice = async (item) => {
        try {
            setLoading(true)
            if (scaning) {
                await stopScan().then(() => {
                    setScaning(false);
                }).catch(error => {
                    console.log('Scan stopped fail', error);
                    reject();
                }).finally(() => {
                    setScaning(false);
                })
            }
            await sleep(1000);
            console.log("connectDevice peripheralID", item.id, scaning)
            let peripheralInfo = await connectBleDevice(item.id)
            setDeviceInformation([])
            let macAddess = ''
            if (peripheralInfo.id == undefined) {
                macAddess = item.id
            } else {
                macAddess = peripheralInfo.id
            }
            if (peripheralInfo.id != undefined) {
                // setIsConnected(true)
                setPeripheralID(macAddess)
                requestMTUSize(macAddess)
                await sleep(500);
                let bondingStatus = await readCharacteristicData(peripheralInfo.id, SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_BONDING_STATUS)
                console.log('readCharacteristic bondingStatus', bondingStatus)
                console.log(' peripheralID =>', peripheralID)
                if (bondingStatus == 1) {
                    // try {
                    //     await sleep(3000);
                    //     const buf2 = Buffer.from([0xAA, 0xAA]);
                    //     const decimalValue = parseInt('AAAA', 16);

                    //     const buffer = new ArrayBuffer(2);
                    //     const dataView = new DataView(buffer);
                    //     dataView.setUint16(0, decimalValue, true); // true for little-endian
                    //     // Decommissioning sensor
                    //     await writeData(macAddess, buffer, SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_DECOMISSION_SENSOR)
                    // } catch (error) {
                    //     console.error("writeData error", error)
                    // }
                    // try {
                    //     let date = new Date();
                    //     let hoursMSB = date.getHours();
                    //     let minutesLSB = date.getMinutes();
                    //     const uint8 = new Uint8Array(2);
                    //     uint8[0] = hoursMSB;
                    //     uint8[1] = minutesLSB;
                    //     console.log(uint8)
                    //     const buf1 = Buffer.from([uint8[1], uint8[0]]);
                    //     console.log(buf1)
                    //     const data = buf1.toJSON().data
                    //     await writeData(macAddess, systumClockCommand(), SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
                    // } catch (error) {
                    //     console.error("writeData error on systumClockCommand", error)
                    // }
                    // readSettings(peripheralInfo.id)
                    console.log("dashboard=>", macAddess, peripheralInfo.name, item)
                    navigation.navigate("dashboard", {
                        bleReceiveData: item,
                        peripheralID: macAddess,
                        peripheralName: peripheralInfo.name,
                    })
                } else {
                    try {
                        await writeData(macAddess, commissionCommand(), SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_REGAL_KEY)
                    } catch (error) {
                        if (error == "Encryption is insufficient") {
                            Alert.alert(error)
                            return
                        }
                        console.error("writeData error", error)
                    }

                    try {
                        // Bond sensor
                        await createBond(macAddess)
                    } catch (error) {
                        console.error("writeData error", error)
                    }

                    try {
                        await writeData(macAddess, systumClockCommand(), SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
                    } catch (error) {
                        console.error("writeData error on systumClockCommand", error)
                    }

                    console.log("dashboard=>", macAddess, peripheralInfo.name, item)
                    navigation.navigate("dashboard", {
                        bleReceiveData: item,
                        peripheralID: macAddess,
                        peripheralName: peripheralInfo.name,
                    })
                }

            }
            setLoading(false)

        } catch (error) {
            console.error("Error during connection:", error);
            setScaning(false);
            setIsConnected(false)
        }
    }

    const readSettings = async (peripheralID) => {
        console.log('---------Settings------')
        let systomCLock = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
        if (systomCLock != undefined) {
            console.log('readCharacteristic systomCLock', systomCLock) //26,8
            try {
                const buffer = Buffer.from(systomCLock);
                const MSB = buffer.readUInt8(1, true);
                const LSB = buffer.readUInt8(0, true);
                console.log(`LSB ${LSB} , MSB ${MSB}`)
            } catch (error) {
                console.log(error)
            }
        }
        let wakeTime = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_WAKE_TIME)
        if (wakeTime != undefined) {
            console.log('CHARACTERISTIC_WAKE_TIME => ', wakeTime)
        }
        let sleepTime = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SLEEP_TIME)
        if (sleepTime != undefined) {
            console.log('CHARACTERISTIC_SLEEP_TIME => ', sleepTime)
        }
        let mi = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_MEASUREMENT_INTERVAL)
        if (mi != undefined) {
            console.log('CHARACTERISTIC_MEASUREMENT_INTERVAL =>', mi)
        }
        let ad = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
        if (ad != undefined) {
            console.log('CHARACTERISTIC_ADVERTISING_DURATION =>', ad)
        }
        let ar = await readCharacteristicData(peripheralID, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
        if (ar != undefined) {
            console.log('CHARACTERISTIC_ACCELEROMATE_RANGE =>', ar)
        }

    }

    const readWriteData = async (peripheralId) => {
        console.log('state peripheralID', peripheralID, isConnected);
        BleManager.retrieveServices(peripheralId).then(async (peripheralInfo) => {
            for (const service of peripheralInfo.services) {
                for (const char of peripheralInfo.characteristics) {
                    if (char.service === service.uuid) {
                        if ((char.service === '75c27600-8f97-20bc-a143-b354244886d4' &&
                            char.characteristic === '75c27601-8f97-20bc-a143-b354244886d4')
                        ) {
                            const buffer = Buffer.from('12345678');
                            // await bleModule.writeData(peripheralID, buffer, char.service, char.characteristic).then(value => {
                            //     console.log("createBond status ", value)
                            // }).catch(error => {
                            //     console.log('createBond fail', error)
                            // });
                        } else if (
                            (char.service === '75c27600-8f97-20bc-a143-b354244886d4' &&
                                char.characteristic === '75c27602-8f97-20bc-a143-b354244886d4')
                        ) {
                            // await bleModule
                            //     .readBond(peripheralID)
                            //     .then((value) => {
                            //         console.log('Bond status ', value);
                            //     })
                            //     .catch((error) => {
                            //         console.log('Read fail', error);
                            //     });
                        } else {
                            if (char.properties.Read === 'Read') {
                                console.log("char => Read Called", char.characteristic)
                                /*  console.log("char => Read Called", char.characteristic)
                                 await bleModule.readData(peripheralID, char.service, char.characteristic).then(value => {
                                     console.log("Read status ", char.characteristic, value);
                                 }).catch(error => {
                                     console.log('Read fail', error);
                                 }); */
                                try {
                                    await BleManager.read(
                                        peripheralId,
                                        char.service,
                                        char.characteristic,
                                    ).then((value) => {
                                        console.log("read success ", char.characteristic, value)
                                    }).catch(error => {
                                        console.log('Read fail ', error);
                                    });
                                } catch (error) {
                                    console.log(error)
                                }

                            }
                        }
                    }
                }
            }
        });

    };

    const readeData = async (peripheralInfo, peripheralID) => {
        console.log('state peripheralID', peripheralID, isConnected);
        for (const service of peripheralInfo.services) {
            console.log("service =>", service)
            for (const char of peripheralInfo.characteristics) {
                console.log("char =>", char)
                if (char.service === service.uuid) {
                    if (char.properties.Read === 'Read') {
                        console.log("char => Read Called", char.characteristic)
                        try {
                            await BleManager.read(
                                peripheralID,
                                char.service,
                                char.characteristic,
                            ).then((value) => {
                                console.log("read success ", char.characteristic, value)
                            }).catch(error => {
                                console.log('Read fail ', error);
                            });
                        } catch (error) {
                            console.log(error)
                        }

                    }
                }
            }
        }

    };

    const deCommission = async () => {

        try {
            const buf2 = Buffer.from([0xAA, 0xAA]);
            const decimalValue = parseInt('AAAA', 16);
            console.log(decimalValue)
            // console.log(buf2.readUInt16BE().toJSON())
            // const buffer = new ArrayBuffer(2);
            // const dataView = new DataView(buffer);
            // dataView.setUint16(0, decimalValue, true); // true for little-endian
            // Decommissioning sensor

            await writeData(peripheralID, buf2.toJSON().da, SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_DECOMISSION_SENSOR)
        } catch (error) {
            console.error("writeData error", error)
        }
    }

    return (
        <SafeAreaView style={globalstyles.container}>
            <>
                <Loader loading={loading} />
                <CustomHeader
                    isConnected={isConnected}
                    scaning={scaning}
                    disabled={scaning || !!isConnected}
                    onPress={isConnected ? disConnectDevice : scanDevice}
                />

                <Text
                    style={[
                        globalstyles.subtitle,
                    ]}>
                    Discovered Devices:
                </Text>
                {dicoverPeripheralsState.length > 0 ? (
                    <FlatList
                        data={dicoverPeripheralsState}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <DeviceList
                                isConnectVisible={true}
                                status={isConnected}
                                peripheral={item}
                                connect={connectDevice}
                                disconnect={disConnectDevice}
                                bondedPeripherals = {bondedPeripheralsState}
                            />
                        )}
                       
                    />
                ) : (
                    <Text style={globalstyles.noDevicesText}>No Bluetooth devices found</Text>
                )}
                {/* {
                    Platform.OS === 'android' ? (
                        <>
                            <Text
                                style={[
                                    globalstyles.subtitle,
                                ]}>
                                Bonded Devices:
                            </Text>
                            {bondedPeripheralsState.length > 0 ? (
                                <FlatList
                                    data={bondedPeripheralsState}
                                    renderItem={({ item }) => (
                                        <DeviceList
                                            isConnectVisible={false}
                                            status={isConnected}
                                            peripheral={item}
                                            connect={connectDevice}
                                            disconnect={disConnectDevice}
                                        />
                                    )}
                                    keyExtractor={item => item.id}
                                />
                            ) : (
                                <Text style={globalstyles.noDevicesText}>No Bonded devices found</Text>
                            )}
                        </>
                    ) : (<></>)
                } */}

                <Text
                    style={[
                        globalstyles.subtitle,
                    ]}>
                </Text>
                {deviceInformation.length > 0 ? (
                    <>
                        <Text style={globalstyles.infoTitleText} >Device Information  </Text>
                        <Text style={globalstyles.infoText} > Manufacturer Name :  {deviceInformation[0].manufacturerName} </Text>
                        <Text style={globalstyles.infoText} > Model Name :  {deviceInformation[0].modelNumber} </Text>
                        <Text style={globalstyles.infoText} > Serial Number :  {deviceInformation[0].serialNumber} </Text>
                        <Text style={globalstyles.infoText} > Firmware Name :  {deviceInformation[0].firmwareRevision} </Text>
                    </>
                ) : (<></>)}
                {/* <Text style={globalstyles.infoText} > Mac Address : {peripheralID} </Text> */}
                {/* <Button title='De-commisison' onPress={() => {
                    console.log("clicked")
                    deCommission()
                }}
                    style={[
                        globalstyles.subtitle,
                    ]}>
                </Button> */}

                {/* <TouchableOpacity
                    style={globalstyles.buttonView}
                    onPress={()=>{
                        readSettings(peripheralID)
                    }}>
                    <Text style={[globalstyles.buttonText]}>
                        Read Settings
                    </Text>
                </TouchableOpacity> */}
            </>
        </SafeAreaView>

    )
}

export default SensorScanning