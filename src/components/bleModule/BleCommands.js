import { PermissionsAndroid, Platform } from 'react-native';
import BleManager, { Peripheral, PeripheralInfo } from 'react-native-ble-manager';
import { Buffer } from "buffer";
import { byteArrayRawString, byteArrayString, convertToLittleEndianFloat, convertToLittleEndianShort, convertToLittleEndianShortValue, utf8ArrayToString } from './utils';
import { DataLFServiceNotification, SensorCommisionService } from './Characteristic';
import { dateFormat, zeroPad } from '../../utils/utils';

export const start = async () => {
    try {
        await BleManager.start({ showAlert: false, forceLegacy: true });
        // Success code
        console.log("Bluetooth Module initialized");
    } catch (error) {
        // Handle initialization errors
        console.error("Error initializing Bluetooth module:", error);
    }
};

export const initializeBluetooth = async () => {
   await start()
   await handleAndroidPermissions()
//    await enableBluetooth()
}

const handleAndroidPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]).then(result => {
            if (result) {
                enableBluetooth()
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
                enableBluetooth()
                console.debug(
                    '[handleAndroidPermissions] runtime permission Android <12 already OK',
                );
            } else {
                PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ).then(requestResult => {
                    if (requestResult) {
                        enableBluetooth()
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
        enableBluetooth()
    }
};

export const enableBluetooth = async () => {
    if (Platform.OS == "android") {
        BleManager.enableBluetooth()
            .then(() => {
                console.log('The bluetooh is already enabled or the user confirm');
            })
            .catch(error => {
                console.log('The user refuse to enable bluetooth', error);
            });
    } else {
        BleManager.enableBluetooth()
            .then(() => {
                console.log('The bluetooh is already enabled or the user confirm');
            })
            .catch(error => {
                start()
                console.log('The user refuse to enable bluetooth', error);
            });
    }

}




export const connectedPeripherals = async () => {
    try {
        const peripherals = await BleManager.getConnectedPeripherals([]);
        return peripherals;
    } catch (error) {
        return Promise.reject(error);
    }
};


export const bondedPeripherals = async () => {
    try {
        const peripherals = await BleManager.getBondedPeripherals([]);
        return peripherals;
    } catch (error) {
        return Promise.reject(error);
    }
};

export const scan = () => {
    return new Promise((resolve, reject) => {
        try {
            BleManager.scan([], 0, true)
                .then(() => {
                    console.log('Scan started');
                    resolve();
                })
                .catch(error => {
                    console.log('Scan started fail', error);
                    reject(error);
                });
        } catch (error) {
            console.log('Scan started fail', error);
            reject(error);
        }
    });
};

export const scanDevice = async () => {
    let satus = await BleManager.scan([], 60, true)
        .then(status => {
            console.log('Scan started', status);
            return true
        })
        .catch(error => {
            console.log('Scan started fail', error);
            return false
        });
    return satus
}

export const stopScanDevice = async () => {
    let satus = await BleManager.stopScan()
        .then(status => {
            console.log('Scan Stopped', status);
            return true
        })
        .catch(error => {
            console.log('Scan Stopped fail', error);
            return false
        });
    return satus
}

export const stopScan = async () => {
    return new Promise((resolve, reject) => {
        BleManager.stopScan()
            .then(() => {
                console.log('Scan stopped');
                resolve();
            })
            .catch(error => {
                console.log('Scan stopped fail', error);
                reject();
            });
    });
};


export const disconnectBleDevice = async (peripheralId) => {
    try {
        await BleManager.disconnect(peripheralId);
        console.log('Disconnected');
        return Promise.resolve('Disconnected');
    } catch (error) {
        console.log('Disconnected fail', error);
        return Promise.reject(error);
    }
};

export const disconnectDecommBleDevice = async (peripheralId) => {
    try {
        const hexValue = 0xAAAA;
        const uint16Array = new Uint16Array([hexValue]);
        // const uint16 = new Uint16Array([0xAA, 0xAA]);
        const uint16 = new Uint16Array([170, 170]);

        // const value = new Uint8Array([0xAA, 0xAA]);

        const buf1 = Buffer.from(uint16);
        const data = buf1.toJSON().data
        console.log("buf1", buf1)
        // let bondStatus = await removeBond(peripheralId)
        // console.log("bondStatus ", bondStatus)
        let reponse = await writeData(peripheralId, data, SensorCommisionService.SERVICE, SensorCommisionService.CHARACTERISTIC_DECOMISSION_SENSOR)
        console.log("Decommision ", reponse)
        return Promise.resolve('Decommision');
    } catch (error) {
        console.log('Decommision fail', error);
        return Promise.reject(error);
    }
};

export const connectBleDevice = async (id) => {
    try {
        let connnectStatus = await BleManager.connect(id);
        console.log('Connected successfully', connnectStatus);
        await sleep(900);
        const peripheralInfo = await BleManager.retrieveServices(id);
        console.log('Connected peripheralInfo', peripheralInfo);
        return peripheralInfo;
    } catch (error) {
        console.error('Connection failed', error);
        return error;
    }
};
const notifyNotification = async (peripheralId) => {
    console.log("notifyNotification for", peripheralId)

    let X_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_X_AXIS_CALCULATED)
    let Y_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_Y_AXIS_CALCULATED)
    let Z_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_Z_AXIS_CALCULATED)

    let X_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_X_LOW_FREQUENC)
    let Y_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_Y_LOW_FREQUENC)
    let Z_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_Z_LOW_FREQUENC)
}


export const isPeripheralConnected = async (id) => {
    try {
        let connnectStatus = await BleManager.isPeripheralConnected(id, []);
        console.log(
            connnectStatus
                ? 'Peripheral is connected'
                : 'Peripheral is NOT connected',
        );
        await sleep(900);
        await BleManager.retrieveServices(id);
        // console.log('Connected peripheralInfo', peripheralInfo);
        return connnectStatus;
    } catch (error) {
        console.error('Get peripheral is connected fail', error);
        return error;
    }
};

export const isS7100SenosorAvailable = (peripherals) => {
    try {
        let macAddress = peripherals.id;
        let uniqueId = 0
        const advertiseData = peripherals?.advertising
        // console.log("peripherals", advertiseData.localName)
        if (advertiseData == undefined)
            return false
        if (Platform.OS == 'android') {
            if (advertiseData.manufacturerData != undefined) {
                const scanBytes = advertiseData.manufacturerData.bytes
                let sensorname = utf8ArrayToString(scanBytes.slice(5, 10))
                if (sensorname == "S7100")
                    return true
            } else {
                return false
            }
        } else {
            if (advertiseData.localName == 'S7100') {
                return true
                // if (advertiseData == undefined)
                //     return false
                // if (advertiseData.manufacturerData != undefined) {
                //     const scanBytes = advertiseData?.manufacturerData.bytes
                //     console.log('advertiseData.manufacturerData',byteArrayString(scanBytes))
                //     let sensorNumber = byteArrayRawString(scanBytes.slice(2, 9))
                //     console.log("sensorNumber", sensorNumber)
                //     if (scanBytes == undefined)
                //         return false
                //     // console.log("scanBytes =>", scanBytes)
                //     uniqueId = parseInt(scanBytes[11])
                //     if (uniqueId == 6)
                //         return true
                // } else {
                //     return false
                // }
            }
        }
        // console.log("uniqueId =>", uniqueId)
        // if (uniqueId == 6) {
        //     return true
        // } else {
        //     return false
        // }

    } catch (error) {
        console.log('Disconnected fail', error);
        return Promise.reject(error);
    }
}

export const requestMTUSize = (peripheralID) => {
    if (Platform.OS == 'android')
        BleManager.requestMTU(peripheralID, 498)
            .then(mtu => {
                console.log(`MTU is ${mtu}`);
                // setMtu(mtu)
            })
            .catch(err => {
                console.log('Request MTU Error: ', err);
            });
}

export const startNotification = async (peripheralId, nofityServiceUUID, nofityCharacteristicUUID) => {
    console.log('Notification init', nofityServiceUUID, nofityCharacteristicUUID);
    await BleManager.startNotification(
        peripheralId,
        nofityServiceUUID,
        nofityCharacteristicUUID,
    )
        .then(() => {
            console.log('Notification started', nofityCharacteristicUUID);
        })
        .catch(error => {
            console.log('Start notification fail for ', nofityCharacteristicUUID, error);
        });
}

export const createBondConnection = async (peripheralID, service, characteristic, data) => {
    await BleManager.write(peripheralID, service, characteristic, data)
        .then(() => {
            console.log('Write success', data.toString());
        })
        .catch(err => {
            console.log('Write failed', data);
        });
}

export const writeData = (peripheralID, data, writeWithResponseServiceUUID, writeWithResponseCharacteristicUUID) => {
    console.log('Service UUID ', writeWithResponseServiceUUID, writeWithResponseCharacteristicUUID);
    return new Promise((resolve, reject) => {
        BleManager.write(
            peripheralID,
            writeWithResponseServiceUUID,
            writeWithResponseCharacteristicUUID,
            data,
        )
            .then(() => {
                console.log('Write success', data.toString());
                resolve('success');
            })
            .catch(error => {
                console.log('Write failed', data);
                reject('Write failed', error);
            }).finally(() => {
                console.log('Write Finally executed', data);
            });
    });
}

export const readCharacteristicData2 = (peripheralID, service, characteristic) => {
    return new Promise(async (resolve, reject) => {
        await BleManager.read(peripheralID, service, characteristic).then(() => {
            console.log('readCharacteristicData success', data.toString());
            resolve();
        }).catch(error => {
            console.log('readCharacteristicData failed', data);
            reject(error);
        }).finally(() => {
            console.log('readCharacteristicData Finally executed');
        });
    });
}

export const readCharacteristicData = async (peripheralID, service, characteristic) => {
    let dataValue = await BleManager.read(peripheralID, service, characteristic)
        .then(data => {
            console.log(`readCharacteristicData success ${characteristic} =  ${data}`);
            return data
        })
        .catch(err => {
            console.log('readCharacteristicData failed  ', characteristic, err);
            return undefined
        });
    return dataValue
}


export const createBond = async (peripheralId) => {
    try {
        return new Promise((resolve, reject) => {
            BleManager.createBond(peripheralId)
                .then((status) => {
                    console.log('Bonding successful ', status);
                    resolve('success');
                })
                .catch(error => {
                    console.error('Error creating bond:', error);
                    reject('failed');
                })
        });
    } catch (error) {
        console.error('Error creating bond:', error);
        reject('failed');
    }
};
export const removeBond = async (peripheralId) => {
    try {
        return new Promise((resolve, reject) => {
            BleManager.removeBond(peripheralId)
                .then((status) => {
                    console.log('Removed Bonding', status);
                    resolve('success');
                })
                .catch(error => {
                    reject('Write failed', error);
                })
        });
    } catch (error) {
        console.error('Error Removing bond:', error);
    }
};

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const commissionCommand = () => {
    const buf1 = Buffer.from([0x12, 0x34, 0x56, 0x78]);
    const data = buf1.toJSON().data
    return data
}
export const deCommissionCommand = () => {
    const uint16 = new Uint16Array(2);
    uint16[0] = parseInt('AA');
    uint16[1] = parseInt('AA');
    const buf1 = Buffer.from([uint16[0], uint16[1]]);
    const data = buf1.toJSON().data
    return data
}
export const systumClockCommand = () => {
    let date = new Date();
    let hoursMSB = date.getHours();
    let minutesLSB = date.getMinutes();
    const uint8 = new Uint8Array(2);
    uint8[0] = hoursMSB;
    uint8[1] = minutesLSB;
    console.log(uint8)
    const buf1 = Buffer.from([uint8[1], uint8[0]]);
    console.log(buf1)
    const data = buf1.toJSON().data
    return data
}

export const xyzAxisRawDataParse = (rawData,type) => {
    try {
        const buffer = Buffer.from(rawData);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer.readUInt8(2, true)
        let hours = buffer.readUInt8(3, true)
        let length = convertToLittleEndianShort(buffer, 4, 6)
        let array = [];
        let tempArray = buffer.slice(6);
        for (let i = 0; i < tempArray.length; i += 2) {
            const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
            let value = convertToLittleEndianShortValue(packet)
            array.push(value);
        }
        console.log(rawData, array)
        return {
            pkc: packetCount,
            gwTime: `${dateFormat()} ${zeroPad(hours)}:${zeroPad(minutes)}`,
            len: length,
            type: byteArrayString(rawData),
            pk: array
        }
    } catch (error) {
        console.log("xyzAxisRawDataParse", error)
    }
}

export const xyzCalculatedRawDataParse = (data, acceleromate) => {
    const buffer = Buffer.from(data);
    const xtimeStamp = `${buffer[1]} hr : ${buffer[0]} min`
    const xRms = convertToLittleEndianShort(buffer, 2, 4)
    xRms = (xRms / 32768) * acceleromate;
    const xpeak = convertToLittleEndianShort(buffer, 4, 6)
    xpeak = (xpeak / 32768) * acceleromate;
    const xpeak2Peak = convertToLittleEndianShort(buffer, 6, 8)
    xpeak2Peak = (xpeak2Peak / 65535) * acceleromate
    const xcrestFactor = convertToLittleEndianFloat(buffer, 8, 12)
    console.log("xcrestFactor", xcrestFactor)
    return {
        ts: xtimeStamp,
        rms: Math.round(xRms),
        pk: Math.round(xpeak),
        p2p: Math.round(xpeak2Peak),
        cf: Math.round(xcrestFactor)
    }
}
