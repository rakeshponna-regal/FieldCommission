import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, Text, NativeModules, NativeEventEmitter, ToastAndroid, TextInput, TouchableOpacity, ScrollView, Alert, FlatList, SafeAreaView, Platform, StyleSheet } from 'react-native';
import { Buffer } from "buffer";
import { disconnectBleDevice, disconnectDecommBleDevice, isPeripheralConnected, readCharacteristicData, sleep, startNotification, writeData, xyzAxisRawDataParse, xyzCalculatedRawDataParse } from '../components/bleModule/BleCommands';
import { byteArrayRawString, byteArrayString, byteToString, convertToLittleEndian, convertToLittleEndianFloat, convertToLittleEndianInt, convertToLittleEndianShort, convertToLittleEndianShortValue, minutestoByteArray, stringToByte, stringToByteArray } from '../components/bleModule/utils';
import { DataLFServiceNotification, DataService, DeviceInformationService, LFDataService, SettingsService, StatusService } from '../components/bleModule/Characteristic';
import { BleState } from 'react-native-ble-manager';
import { BleEventType } from '../components/bleModule/type';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { dateFormat, zeroPad } from '../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { addCaculationResult, addSensorXCalResult, addSensorYCalResult, addSensorZCalResult, addSettings, addlowFrequencyXCalResult, addlowFrequencyYCalResult, addlowFrequencyZCalResult, clearState } from '../store/sensorslice';
import { addAbortSignal } from 'stream';
import { HeaderTitleSettingsView } from '../components/header';
import { Table, Row, Rows } from 'react-native-table-component';
import { showMessage } from 'react-native-flash-message';

const BleManagerModule = NativeModules.BleManager;
const nativeEventBluetoothEmitter = new NativeEventEmitter(BleManagerModule);

const globalstyles = require('.././assets/css/style');

const SensorInfoDashboard = ({ route, navigation }) => {
  const { settings, caculatedDataService, sensorCalXDataService, sensorCalYDataService, sensorCalZDataService, lowFrequencyXDataService, lowFrequencyYDataService, lowFrequencyZDataService } = useSelector((state) => state.sensorData);
  const dispatch = useDispatch();
  // console.log(("sensor slice ",sensorCalXDataService))
  const { item } = route.params.bleReceiveData;
  const [peripheralId, setPeripheralId] = useState("")
  const [peripheralName, setperipheralName] = useState("")
  const [serialNumber, setSerialNumber] = useState("")

  const [isConnected, setIsConected] = useState(false);
  const [deviceInformation, setDeviceInformation] = useState([]);
  const [settingsInformation, setSettingsInformation] = useState([]);
  const [dataPacktsInformation, setDataPacktsInformation] = useState([]);
  const [rawDataPacktsInformation, setRawDataPacktsInformation] = useState([]);
  const [acceleromater, setAcceleromater] = useState(0);
  const [sensorParametersState, setSensorParametersState] = useState();

  let xyzSensorData = []
  const sysInfo = {
    reportedMacAddress: peripheralId,
  }
  const sensorParameters = {
  }
  React.useLayoutEffect(() => {
    navigation.setOptions?.(
      {
        headerTitle: `${peripheralName}`,
        headerStyle: {
          backgroundColor: Colors.White
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[globalstyles.deviceButton, { marginBottom: 1 }]}
              onPress={async () => {
                const satus = await disconnectDecommBleDevice(peripheralId)
                console.log("satus", satus)
                if (satus == "Disconnected") {
                  navigation.goBack()
                }
              }}
            >
              <Text
                style={[
                  globalstyles.scanButtonText,
                  { fontWeight: 'bold', fontSize: 12, color: 'white', },
                ]}>
                {isConnected ? 'Disconnect' : 'Re-connect'}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[globalstyles.deviceButton, { marginBottom: 1 }]}
              onPress={async () => {
                fetchConnectedPeripheral(peripheralId)
              }}
            >
              <Text
                style={[
                  globalstyles.scanButtonText,
                  { fontWeight: 'bold', fontSize: 12, color: 'white', },
                ]}>
                Reload
              </Text>

            </TouchableOpacity>


          </View>
        ),
      });
  }, [navigation, isConnected, peripheralName]);

  useEffect(() => {
    // console.log("item", item)
    // item = route.params.id
    const id = route.params.peripheralID
    const name = route.params.peripheralName
    const serialNumber = route.params.sensorNumber
    console.log("route.params", id, name,serialNumber)
    setperipheralName(name)
    setSerialNumber(serialNumber)
    setPeripheralId(id)
    fetchConnectedPeripheral(id)
  }, []);

  useEffect(() => {
    const handleUpdateValue = ({ value, characteristic }) => {
      console.log('handleUpdateValue:> ', value, characteristic);
      /* 
        {"characteristic": "75c27a04-8f97-20bc-a143-b354244886d4", 
        "peripheral": "D3:74:14:D7:AA:BE", 
        "service": "75c27a00-8f97-20bc-a143-b354244886d4", "value":[]
      */
      if (value) {
        console.log("validating.....", characteristic, DataLFServiceNotification.CHARACTERISTIC_X_AXIS_CALCULATED)
        if (characteristic == DataLFServiceNotification.CHARACTERISTIC_X_AXIS_CALCULATED) {
          console.log("validating.....")
          let response = xyzAxisRawDataParse(value,'xAxis')
          dispatch(addSensorXCalResult(response))
          console.log("response", response)
        } else if (characteristic == DataLFServiceNotification.CHARACTERISTIC_Y_AXIS_CALCULATED) {
          let response = xyzAxisRawDataParse(value,'yAxis')
          dispatch(addSensorYCalResult(response))
          console.log("response", response)
        } else if (characteristic == DataLFServiceNotification.CHARACTERISTIC_Z_AXIS_CALCULATED) {
          let response = xyzAxisRawDataParse(value,'zAxis')
          dispatch(addSensorZCalResult(response))
          console.log("response", response)
        } else if (characteristic == DataLFServiceNotification.CHARACTERISTIC_X_LOW_FREQUENC) {
          let response = xyzAxisRawDataParse(value,'xFrequency')
          dispatch(addlowFrequencyXCalResult(response))
          console.log("response", response)
        } else if (characteristic == DataLFServiceNotification.CHARACTERISTIC_Y_LOW_FREQUENC) {
          let response = xyzAxisRawDataParse(value,'yFrequency')
          dispatch(addlowFrequencyYCalResult(response))
          console.log("response", response)
        } else if (characteristic == DataLFServiceNotification.CHARACTERISTIC_Z_LOW_FREQUENC) {
          let response = xyzAxisRawDataParse(value,'zFrequency')
          dispatch(addlowFrequencyZCalResult(response))
          console.log("response", response)
        }
      }
    }

    const updateValueListener = nativeEventBluetoothEmitter.addListener(
      BleEventType.BleManagerDidUpdateValueForCharacteristic,
      handleUpdateValue,
    );
    return () => {
      updateValueListener.remove();
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

    const handleDisconnectPeripheral = (data) => {
      console.log('Sensor Info handleDisconnectPeripheral:> ', data);
      if (Platform.OS == 'android') {
        if (data.status == 0) {
          navigation.goBack()
        }
      } else {
        if (data.code == 7) {
          navigation.goBack()
        }
      }
    }

    const disconnectPeripheralListener = nativeEventBluetoothEmitter.addListener(
      BleEventType.BleManagerDisconnectPeripheral,
      handleDisconnectPeripheral,
    );
    return () => {
      disconnectPeripheralListener.remove();
    };
  }, [])

  const fetchConnectedPeripheral = async (peripheralId) => {
    console.log("fetchConnectedPeripheral", peripheralId)
    const isPerpheralState = await isPeripheralConnected(peripheralId)
    if (isPerpheralState) {
      console.log("Peripheral is connected!");
      setIsConected(true)
      // await notifyNotification(peripheralId)
      // await sleep(200)
      await systemInformation(peripheralId)
      // await writeSettingsInfo(peripheralId)
      await settingsInfo(peripheralId)
      await sleep(100)
      await sensorParams(peripheralId)
      await sleep(100)
      await rawData(peripheralId)
      // await settingsInfo(peripheralId)
      // await sleep(200)
      // await readdataInfo(peripheralId)
     
    } else {
      setIsConected(false)
    }
  }
  const notifyNotification = async (peripheralId) => {
    console.log("notifyNotification for", peripheralId)

    let X_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_X_AXIS_CALCULATED)
    let Y_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_Y_AXIS_CALCULATED)
    let Z_AXIS_CALCULATED = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_AXIS_CALCULATED, DataLFServiceNotification.CHARACTERISTIC_Z_AXIS_CALCULATED)

    let X_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_X_LOW_FREQUENC)
    let Y_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_Y_LOW_FREQUENC)
    let Z_AXIS_LOW_FREQUENCY = await startNotification(peripheralId, DataLFServiceNotification.SERVICE_LOW_FREQUENCY, DataLFServiceNotification.CHARACTERISTIC_Z_LOW_FREQUENC)
  }

  const writeSettingsInfo = async (peripheralId) => {
    try {
      const uint8 = new Uint8Array(2);  //  //default 0x0800  (08:00 or 08:00 AM)
      uint8[0] = 8; //hours
      uint8[1] = 0; // minutes
      const buf1 = Buffer.from([uint8[1], uint8[0]]);
      const data = buf1.toJSON().data
      await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_WAKE_TIME)
    } catch (error) {
      console.error("WAKE_TIME error : ", error)
    }

    try {
      const uint8 = new Uint8Array(2);
      uint8[0] = 6;
      uint8[1] = 30;
      const buf1 = Buffer.from([uint8[1], uint8[0]]);
      const data = buf1.toJSON().data
      await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SLEEP_TIME)
    } catch (error) {
      console.error("SLEEP_TIME error :", error)
    }

    try {
      const buf1 = minutestoByteArray(5, 0) // minutes
      const data = buf1.toJSON().data
      await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_MEASUREMENT_INTERVAL)
    } catch (error) {
      console.error("MEASUREMENT_INTERVAL error :", error)
    }

    try {
      let bytes = stringToByteArray(120) //  600 sec = 10min
      if (bytes) {
        const uint8 = new Uint8Array(2);
        uint8[0] = bytes[0];
        uint8[1] = bytes[1];
        const buf1 = Buffer.from([uint8[1], uint8[0]]);
        const data = buf1.toJSON().data
        await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_INTERVAL)
      }
    } catch (error) {
      console.error("ADVERTISING_INTERVAL error :", error)
    }

    try {
      const buf1 = minutestoByteArray(20, 0) //not reflecting
      const data = buf1.toJSON().data
      await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
    } catch (error) {
      console.error("ADVERTISING_DURATION error : ", error)
    }
  }

  const systemInformation = async (peripheralId) => {
    console.log("readSystemInfo", peripheralId)
    let modelNumber = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_MODEL_NUMBER)
    if (modelNumber != undefined) {
      console.log('readCharacteristic modelNumber ', byteToString(modelNumber))
    }
    let manufacturerName = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_MONUFACTURE_NAME)
    if (manufacturerName != undefined) {
      console.log('readCharacteristic manufacturerName', byteToString(manufacturerName))
    }
    let firmwareRevision = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_FIRMWARE_VERSION)
    if (firmwareRevision != undefined) {
      console.log('readCharacteristic firmwareRevision', byteToString(firmwareRevision))
    }
    let serialNumber = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_SERIAL_NUMBER)
    if (serialNumber != undefined) {
      console.log('readCharacteristic serialNumber', byteToString(serialNumber))
    }
    setDeviceInformation([{
      "modelNumber": byteToString(modelNumber),
      "manufacturerName": byteToString(manufacturerName),
      "firmwareRevision": byteToString(firmwareRevision),
      "serialNumber": byteToString(serialNumber)
    }])
    sysInfo.reportedMacAddress = peripheralId,
    sysInfo.reportedSensorType = byteToString(modelNumber)
    sysInfo.reportedSerialNumber = byteToString(serialNumber)
    sysInfo.reportedManufacturerName = byteToString(manufacturerName)
    sysInfo.reportedFirmwareRevision = byteToString(firmwareRevision)
  }

  const settingsInfo = async (peripheralId) => {
    let systumCLock = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
    if (systumCLock) {
      const buffer = Buffer.from(systumCLock);
      const LSB = buffer.readUInt8(0, true);
      const MSB = buffer.readUInt8(1, true);
      let value = `${dateFormat()} ${zeroPad(MSB)}:${zeroPad(LSB)}`
      sysInfo.reportedSensorTime = value
      console.log("systumCLock", buffer, value);
    }
    let wakeTime = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_WAKE_TIME)
    if (wakeTime) {
      const buffer = Buffer.from(wakeTime);
      const LSB = buffer.readUInt8(0, true);
      const MSB = buffer.readUInt8(1, true);
      let value = `${zeroPad(MSB)}:${zeroPad(LSB)}`
      sysInfo.reportedWakeTime = value
      console.log("wakeTime", buffer, value);
    }

    let sleepTime = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SLEEP_TIME)
    if (sleepTime) {
      const buffer = Buffer.from(sleepTime);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      let value = `${zeroPad(MSB)}:${zeroPad(LSB)}`
      sysInfo.reportedSleepTime = value
      console.log("sleepTime", buffer, value);
    }

    let measurementInterval = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_MEASUREMENT_INTERVAL)
    if (measurementInterval) {
      const buffer = Buffer.from(measurementInterval);
      let value = `${convertToLittleEndianShortValue(buffer)} minutes`
      sysInfo.reportedMeasurementInterval = value
      console.log("measurementInterval", buffer, value);
    }

    let advertisinginterval = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_INTERVAL)
    if (advertisinginterval) {
      const buffer = Buffer.from(advertisinginterval);
      let value = `${convertToLittleEndianShortValue(buffer)} seconds`
      sysInfo.reportedAdvInterval = value
      console.log("advertisinginterval", buffer, value);
    }

    let advertisingDuration = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
    if (advertisingDuration) {
      const buffer = Buffer.from(advertisingDuration);
      let value = `${convertToLittleEndianShortValue(buffer)} seconds`
      sysInfo.reportedAdvDuration = value
      console.log("advertisingDuration", buffer, value);
    }

    let acceleraomate = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
    if (acceleraomate) {
      const buffer = Buffer.from(acceleraomate);
      let value = `${buffer.readUInt8()} g`
      sysInfo.reportedAccelRange = value
      console.log("advertisingDuration", buffer, value);
      setAcceleromater(buffer.readUInt8())
    }

    let batteryVoltage = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_BATTERY_VOLTAGE)
    if (batteryVoltage) {
      const buffer = Buffer.from(batteryVoltage); //by 1000 v  || 
      let value = `${convertToLittleEndianShortValue(buffer) / 1000} V`
      sysInfo.reportedBattery = value
      console.log("battery Voltage", buffer, value);
    }

    let temperature = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_TEMPERATURE)
    if (temperature != undefined) {
      const buffer = Buffer.from(temperature);
      let value = `${buffer.readUInt8()} °C`
      sysInfo.reportedTemerature = value
      console.log("advertisingDuration", buffer, value);
    }
    sysInfo.reportedSerialNumber = serialNumber
    dispatch(addSettings(sysInfo))
  }

  const sensorParams = async (peripheralId) => {
    try {
      let accele = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
    const buffer = Buffer.from(accele);
    let accelRange = buffer.readUInt8()
    let x_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_X_AXIS_CALCULATED)
    if (x_axis) {
      const buffer = Buffer.from(x_axis);
      let timeStamp = `${dateFormat()} ${zeroPad(buffer.readUInt8(1, true))}:${zeroPad(buffer.readUInt8(0, true))}`
      let rmsHoriz = convertToLittleEndianShort(buffer, 2, 4)
      rmsHoriz = (rmsHoriz / 32768) * accelRange;
      let peakHoriz = convertToLittleEndianShort(buffer, 4, 6)
      peakHoriz = (peakHoriz / 32768) * accelRange;
      let peakToPeakHoriz = convertToLittleEndianShort(buffer, 6, 8)
      peakToPeakHoriz = (peakToPeakHoriz / 65535) * accelRange
      let crestFactorHoriz = convertToLittleEndianFloat(buffer, 8, 12)
      sensorParameters.gwTime = timeStamp
      sensorParameters.rmsHoriz = rmsHoriz
      sensorParameters.peakHoriz = peakHoriz
      sensorParameters.peakToPeakHoriz = peakToPeakHoriz
      sensorParameters.crestFactorHoriz = crestFactorHoriz
      sensorParameters.xPackets = byteArrayString(x_axis)
    }

    let y_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_Y_AXIS_CALCULATED)
    if (y_axis) {
      const buffer = Buffer.from(y_axis);
      let timeStamp = `${dateFormat()} ${zeroPad(buffer.readUInt8(1, true))}:${zeroPad(buffer.readUInt8(0, true))}`
      let rmsVert = convertToLittleEndianShort(buffer, 2, 4)
      rmsVert = (rmsVert / 32768) * accelRange;
      let peakVert = convertToLittleEndianShort(buffer, 4, 6)
      peakVert = (peakVert / 32768) * accelRange;
      let peakToPeakVert = convertToLittleEndianShort(buffer, 6, 8)
      peakToPeakVert = (peakToPeakVert / 65535) * accelRange
      let crestFactorVert = convertToLittleEndianFloat(buffer, 8, 12)
      sensorParameters.gwTime = timeStamp
      sensorParameters.rmsVert = rmsVert
      sensorParameters.peakVert = peakVert
      sensorParameters.peakToPeakVert = peakToPeakVert
      sensorParameters.crestFactorVert = crestFactorVert
      sensorParameters.yPackets = byteArrayString(y_axis)
    }

    let z_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_Y_AXIS_CALCULATED)
    if (z_axis) {
      const buffer = Buffer.from(z_axis);
      let timeStamp = `${dateFormat()} ${zeroPad(buffer.readUInt8(1, true))}:${zeroPad(buffer.readUInt8(0, true))}`
      let rmsAxial = convertToLittleEndianShort(buffer, 2, 4)
      rmsAxial = (rmsAxial / 32768) * accelRange;
      let peakAxial = convertToLittleEndianShort(buffer, 4, 6)
      peakAxial = (peakAxial / 32768) * accelRange;
      let peakToPeakAxial = convertToLittleEndianShort(buffer, 6, 8)
      peakToPeakAxial = (peakToPeakAxial / 65535) * accelRange
      let crestFactorAxial = convertToLittleEndianFloat(buffer, 8, 12)
      sensorParameters.gwTime = timeStamp
      sensorParameters.rmsAxial = rmsAxial
      sensorParameters.peakAxial = peakAxial
      sensorParameters.peakToPeakAxial = peakToPeakAxial
      sensorParameters.crestFactorAxial = crestFactorAxial
      sensorParameters.zPackets = byteArrayString(z_axis)
    }
    sensorParameters.reportedTemerature = sysInfo.reportedTemerature
    sensorParameters.reportedBattery = sysInfo.reportedBattery
    sensorParameters.serialNumber = serialNumber
    console.log('sensorParameters',sensorParameters)
    setSensorParametersState(sensorParameters)
    dispatch(addCaculationResult(sensorParameters))
    
    } catch (error) {
      console.log('sensorParams Errror =>',error)
    }
    
  }

  const rawData = async (peripheralId) => {

    let xAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_X_DATA)
    if (xAxisRawData) {
      let response = xyzAxisRawDataParse(xAxisRawData,'xAxis')
      console.log("X", response)
      dispatch(addSensorXCalResult(response))

    }
    let yAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_Y_DATA)

    if (yAxisRawData) {
      let response = xyzAxisRawDataParse(yAxisRawData,'yAxis')
      dispatch(addSensorYCalResult(response))
      console.log("Y", response)
    }

    let zAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_Z_DATA)
    if (zAxisRawData) {
      let response = xyzAxisRawDataParse(zAxisRawData,'zAxis')
      dispatch(addSensorZCalResult(response))
      console.log("Z", response)
    }

    let xFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_X_DATA)
    if (xFrequency) {
      let response = xyzAxisRawDataParse(xFrequency,'xFrequency')
      dispatch(addlowFrequencyXCalResult(response))
      console.log("LX", response)
    }

    let yFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_Y_DATA)
    if (yFrequency) {
      let response = xyzAxisRawDataParse(yFrequency,'yFrequency')
      dispatch(addlowFrequencyYCalResult(response))
      console.log("LY", response)
    }

    let zFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_Z_DATA)
    if (zFrequency) {
      let response = xyzAxisRawDataParse(zFrequency,'zFrequency')
      dispatch(addlowFrequencyZCalResult(response))
      console.log("LZ", response)
    }
  }

  const readSystemInfo = async (peripheralId) => {

    await systemInformation(peripheralId)
    await writeSettingsInfo(peripheralId)
    await settingsInfo(peripheralId)


    let systumClockValue = ''
    let systomCLock = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SYSTEM_CLOCK)
    if (systomCLock.includes('Error reading')) {
      Alert.alert('Error reading Data ')
      return
    }

    if (systomCLock != undefined) {
      const buffer = Buffer.from(systomCLock);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      systumClockValue = `Sensor Time ${MSB} hr : ${LSB} min`
      console.log('readCharacteristic systomCLock', systomCLock) //26,8
    }


    let wakeTimeValue = ''
    let wakeTime = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_WAKE_TIME)
    if (wakeTime != undefined) {
      const buffer = Buffer.from(wakeTime);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      wakeTimeValue = `Wake Time ${MSB} hr : ${LSB} min`
      console.log(`LSB ${LSB} , MSB ${MSB}`)
      console.log('CHARACTERISTIC_WAKE_TIME => ', wakeTime)
    }


    let sleepTimeValue = ''
    let sleepTime = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SLEEP_TIME)
    if (sleepTime != undefined) {
      const buffer = Buffer.from(sleepTime);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      sleepTimeValue = `Sleep Time ${MSB} hr : ${LSB} min`
      console.log('CHARACTERISTIC_SLEEP_TIME => ', sleepTime)
    }




    let measurementIntervalValue = ''
    let measurementInterval = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_MEASUREMENT_INTERVAL)
    if (measurementInterval != undefined) {
      const buffer = Buffer.from(measurementInterval);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      measurementIntervalValue = `Measurement Interval ${convertToLittleEndianShortValue(buffer)} min`
      console.log('CHARACTERISTIC_MEASUREMENT_INTERVAL =>', measurementInterval, convertToLittleEndianShortValue(buffer))
    }



    let advertisingintervalValue = ''
    let advertisinginterval = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_INTERVAL)
    if (advertisinginterval != undefined) {
      const buffer = Buffer.from(advertisinginterval);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      advertisingintervalValue = `Advertising Interval ${convertToLittleEndianShortValue(buffer)} sec`
      console.log('CHARACTERISTIC_ADVERTISING_INTERVAL =>', advertisinginterval, convertToLittleEndianShortValue(buffer))
    }



    let advertisingDurationValue = ''
    let advertisingDuration = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
    if (advertisingDuration != undefined) {
      const buffer = Buffer.from(measurementInterval);
      const MSB = buffer.readUInt8(1, true);
      const LSB = buffer.readUInt8(0, true);
      advertisingDurationValue = `Advertising Duration : ${convertToLittleEndianShortValue(buffer)} sec`
      console.log('CHARACTERISTIC_ADVERTISING_DURATION =>', advertisingDuration, convertToLittleEndianShortValue(buffer))
    }


    let acceleraomateValue = ''
    let acceleraomate = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
    if (acceleraomate != undefined) {
      const buffer = Buffer.from(acceleraomate);
      setAcceleromater(buffer.readUInt8())
      acceleraomateValue = `Acceleromate Range ${buffer.readUInt8()}`
      console.log('CHARACTERISTIC_ACCELEROMATE_RANGE =>', acceleraomate)
    }

    let batteryVoltageValue = ''
    let batteryVoltage = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_BATTERY_VOLTAGE)
    if (batteryVoltage != undefined) {
      const buffer = Buffer.from(batteryVoltage);
      console.log("Battery", buffer, convertToLittleEndianShortValue(buffer))
      batteryVoltageValue = `Battery Voltage :- LSB ${buffer[0]} mv |` + ` MSB ${buffer[1]} mv`
    }

    let temperatureValue = ''
    let temperature = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_TEMPERATURE)
    if (temperature != undefined) {
      const buffer = Buffer.from(temperature);
      console.log("Temerature", buffer)
      temperatureValue = `Temerature ${buffer.readInt8()} °C`
    }

    let calibarationValue = ''
    // let calibaration = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_CALIBERATION)
    // if (calibaration != undefined) {
    //   const buffer = Buffer.from(calibaration);
    //   console.log("calibaration",buffer)
    //   calibarationValue = `Calibaration ${buffer.readUInt16BE()}`
    // }
    calibarationValue = "Calibaration service Not Found"
    setSettingsInformation([
      {
        "SystemTime": systumClockValue,
        "WakeTime": wakeTimeValue,
        "SleepTime": sleepTimeValue,
        "MeasurementInterval": measurementIntervalValue,
        "AdvertisingInterval": advertisingintervalValue,
        "AdvertisingDuration": advertisingDurationValue,
        "AcceleromateRange": acceleraomateValue,
        "BatteryVoltage": batteryVoltageValue,
        "Temperature": temperatureValue,
        "Calibaration": calibarationValue,
      }
    ])
  }

  const readdataInfo = async (peripheralId) => {
    console.log("------AXIS-------START---------");
    let x_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_X_AXIS_CALCULATED)
    let acceleromate = 0
    let accele = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
    if (accele != undefined) {
      const buffer = Buffer.from(accele);
      acceleromate = buffer.readUInt8()
    }
    setAcceleromater(acceleromate)
    let xtimeStamp = " "
    let xRms = ""
    let xpeak = ""
    let xpeak2Peak = ""
    let xcrestFactor = ""
    if (x_axis != undefined) {
      const buffer = Buffer.from(x_axis);
      console.log(buffer)
      xtimeStamp = `${buffer.readUInt8(1, true)} hr : ${buffer.readUInt8(0, true)} min`
      xRms = convertToLittleEndianShort(buffer, 2, 4)
      xRms = (xRms / 32768) * acceleromate;
      xpeak = convertToLittleEndianShort(buffer, 4, 6)
      xpeak = (xpeak / 32768) * acceleromate;
      xpeak2Peak = convertToLittleEndianShort(buffer, 6, 8)
      xpeak2Peak = (xpeak2Peak / 65535) * acceleromate
      xcrestFactor = convertToLittleEndianShort(buffer, 8, 12)
    }
    //58 -minutes,14 -houres,[15,3] -RMS,[190,3]-peak,[70,1]-peak2peak,[161,155,156,63]-crestfactor
    //RMS (g)=  rms / 32768 * acceleraomete range
    //Peak (g) = peak /  32768 * acceleraomete range
    //Peak2Peak (g) = peak2peak /  65535 * acceleraomete range
    //above for x, y , z
    let y_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_Y_AXIS_CALCULATED)
    let ytimeStamp = ""
    let yRms = ""
    let ypeak = ""
    let ypeak2Peak = ""
    let ycrestFactor = ""
    if (y_axis != undefined) {
      const buffer = Buffer.from(y_axis);
      console.log(buffer)
      ytimeStamp = `${buffer[1]} hr : ${buffer[0]} min`
      yRms = convertToLittleEndianShort(buffer, 2, 4)
      yRms = (yRms / 32768) * acceleromate;
      ypeak = convertToLittleEndianShort(buffer, 4, 6)
      ypeak = (ypeak / 32768) * acceleromate;
      ypeak2Peak = convertToLittleEndianShort(buffer, 6, 8)
      ypeak2Peak = (ypeak2Peak / 65535) * acceleromate
      ycrestFactor = convertToLittleEndianShort(buffer, 8, 12)
    }


    let z_axis = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_Z_AXIS_CALCULATED)
    let ztimeStamp = ""
    let zRms = ""
    let zpeak = ""
    let zpeak2Peak = ""
    let zcrestFactor = ""
    if (z_axis != undefined) {
      const buffer = Buffer.from(z_axis);
      console.log(buffer)
      ztimeStamp = `${buffer[1]} hr : ${buffer[0]} min`
      zRms = convertToLittleEndianShort(buffer, 2, 4)
      zRms = (zRms / 32768) * acceleromate;
      zpeak = convertToLittleEndianShort(buffer, 4, 6)
      zpeak = (zpeak / 32768) * acceleromate;
      zpeak2Peak = convertToLittleEndianShort(buffer, 6, 8)
      zpeak2Peak = (zpeak2Peak / 65535) * acceleromate
      zcrestFactor = convertToLittleEndianShort(buffer, 8, 12)
    }
    setDataPacktsInformation([{
      "x_timeStamp": xtimeStamp,
      "x_Rms": xRms,
      "x_peak": xpeak,
      "x_peak2Peak": xpeak2Peak,
      "x_crestFactor": xcrestFactor,
      "y_timeStamp": ytimeStamp,
      "y_Rms": yRms,
      "y_peak": ypeak,
      "y_peak2Peak": ypeak2Peak,
      "y_crestFactor": ycrestFactor,
      "z_timeStamp": ztimeStamp,
      "z_Rms": zRms,
      "z_peak": zpeak,
      "z_peak2Peak": zpeak2Peak,
      "z_crestFactor": zcrestFactor
    }])

    let xAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_X_DATA)
    let xresult = '';
    try {
      if (xAxisRawData != undefined) {
        const buffer = Buffer.from(xAxisRawData);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        // console.log("xAxisRawData", buffer.length, packetCount, minutes, hours, length, data)
        xresult += `packetCount : ${packetCount},`
        xresult += `hours : ${hours},`
        xresult += `minutes : ${minutes},`
        xresult += `length : ${length},      `
        let array = [];
        let tempArray = buffer.slice(6);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          xresult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }

    let yAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_Y_DATA)
    let yresult = '';
    try {
      if (yAxisRawData != undefined) {
        const buffer = Buffer.from(yAxisRawData);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        yresult += `packetCount : ${packetCount},`
        yresult += `hours : ${hours},`
        yresult += `minutes : ${minutes},`
        yresult += `length : ${length},       `
        let array = [];
        let tempArray = buffer.slice(6);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          yresult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }

    let zAxisRawData = await readCharacteristicData(peripheralId, DataService.SERVICE, DataService.CHARACTERISTIC_SENSOR_Z_DATA)
    let zresult = '';
    try {
      if (zAxisRawData != undefined) {
        const buffer = Buffer.from(zAxisRawData);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        zresult += `packetCount : ${packetCount},`
        zresult += `hours : ${hours},`
        zresult += `minutes : ${minutes},`
        zresult += `length : ${length},      `
        let array = [];
        let tempArray = buffer.slice(6);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          zresult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }



    let xFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_X_DATA)
    let xFrequencyResult = '';
    try {
      if (xFrequency != undefined) {
        const buffer = Buffer.from(xFrequency);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        xFrequencyResult += `packetCount : ${packetCount},`
        xFrequencyResult += `hours : ${hours},`
        xFrequencyResult += `minutes : ${minutes},`
        xFrequencyResult += `length : ${length},      `
        let array = [];
        let tempArray = buffer.slice(8);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          xFrequencyResult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }

    let yFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_Y_DATA)
    let yFrequencyResult = '';
    try {
      if (yFrequency != undefined) {
        const buffer = Buffer.from(yFrequency);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        yFrequencyResult += `packetCount : ${packetCount},`
        yFrequencyResult += `hours : ${hours},`
        yFrequencyResult += `minutes : ${minutes},`
        yFrequencyResult += `length : ${length},      `
        let array = [];
        let tempArray = buffer.slice(8);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          yFrequencyResult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }
    let zFrequency = await readCharacteristicData(peripheralId, LFDataService.SERVICE, LFDataService.CHARACTERISTIC_LOW_FREQUENCY_Z_DATA)
    let zFrequencyResult = '';
    try {
      if (zFrequency != undefined) {
        const buffer = Buffer.from(zFrequency);
        let packetCount = convertToLittleEndianShort(buffer, 0, 2)
        let minutes = buffer[2]
        let hours = buffer[3]
        let length = convertToLittleEndianShort(buffer, 4, 6)
        zFrequencyResult += `packetCount : ${packetCount},`
        zFrequencyResult += `hours : ${hours},`
        zFrequencyResult += `minutes : ${minutes},`
        zFrequencyResult += `length : ${length},      `
        let array = [];
        let tempArray = buffer.slice(8);
        for (let i = 0; i < tempArray.length; i += 2) {
          const packet = Buffer.from([tempArray[i], tempArray[i + 1]]);
          let value = convertToLittleEndianShortValue(packet)
          zFrequencyResult += value + ","
          array.push(value);
        }
      }
    } catch (error) {
      console.log(error)
    }

    setRawDataPacktsInformation([
      {
        "X_Raw_Data": xresult,
        "Y_Raw_Data": yresult,
        "Z_Raw_Data": zresult,
        "X_Frequency": xFrequencyResult,
        "Y_Frequency": yFrequencyResult,
        "Z_Frequency": zFrequencyResult
      }
    ])
    // console.log("xFrequency", xFrequency)
    // console.log("yFrequency", yFrequency)
    // console.log("zFrequency", zFrequency)

    console.log("------AXIS-------CLOSE---------");
    console.log(caculatedDataService, settings)
  }
  const _onPress = () => {
    navigation.navigate('SettingsInfo', {
      peripheralID: peripheralId
    })
  }
  const _onDisconnectPress = async () => {
    Alert.alert(
      'Caution',
      'Do you want to Disassociate or disconnect',
      [ 
        {
          text: 'Disconnect',
          onPress: () => {
            disconnect(true)
          },
        },
        {
          text: 'Disassociate',
          onPress: () => {
            disconnect(false)
          },
        },
      ],
      { cancelable: false }
    );
   
  }

  const disconnect = async (isDisconnect) => {
    if(isDisconnect){
      const satus = await disconnectBleDevice(peripheralId)
    }else{
      const satus = await disconnectDecommBleDevice(peripheralId)
    }
    sleep(200)
    navigation.goBack()
  }
  const _tableRowView = (lastItem) => {
    let dataRows = []
    if(lastItem){
          dataRows = [
            ['Temperature','-',lastItem.reportedTemerature.replace('°C',''),'°C',lastItem.gwTime],
            ['Crest Factor','X - Horizontal',lastItem.crestFactorHoriz,'ratio',lastItem.gwTime],
            ['Crest Factor','Y - Vertical',lastItem.crestFactorVert,'ratio',lastItem.gwTime],
            ['Crest Factor','Z - Axial',lastItem.crestFactorAxial,'ratio',lastItem.gwTime],
            ['Peak','X - Horizontal',lastItem.peakHoriz,'g',lastItem.gwTime],
            ['Peak','Y - Vertical',lastItem.peakVert,'g',lastItem.gwTime],
            ['Peak','Z - Axial',lastItem.peakAxial,'g',lastItem.gwTime],
            ['Peak-to-Peak','X - Horizontal',lastItem.peakToPeakHoriz,'g',lastItem.gwTime],
            ['Peak-to-Peak','Y - Vertical',lastItem.peakToPeakVert,'g',lastItem.gwTime],
            ['Peak-to-Peak','Z - Axial',lastItem.peakToPeakAxial,'g',lastItem.gwTime],
            ['RMS','X - Horizontal',lastItem.rmsHoriz,'g',lastItem.gwTime],
            ['RMS','Y - Vertical',lastItem.rmsVert,'g',lastItem.gwTime],
            ['RMS','Z - Axial',lastItem.rmsAxial,'g',lastItem.gwTime],
        ]
    }
    return (
        <View style={styles.container}>
            <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between', }}>
                <Row data={['Type', 'Axis', 'Last Value', 'Units','Timestamp']} style={styles.head} textStyle={styles.headText} />
                <Rows data={dataRows} textStyle={styles.text}/>
            </Table>
        </View>
    )
}

  return (
    <SafeAreaView forceInset={{ top: 'always' }} style={[globalstyles.safeContainerStyle, { marginBottom: 10 }]}>
      <View style={globalstyles.containerView} >
        <HeaderTitleSettingsView navigation={navigation} title={'DataService'} onPress={_onPress} isConnected={isConnected} onDisconnectPress={_onDisconnectPress} />
        <ScrollView>
          <View style={{ flex: 1,  justifyContent: 'flex-start', margin: 0, paddingLeft: 5 }}>
            {/*  {settings ? (
          <>
            <Text style={globalstyles.infoTitleText} >Device Information  </Text>
            <Text style={globalstyles.infoText} > Mac Address :  {settings.reportedMacAddress} </Text>
            <Text style={globalstyles.infoText} > Manufacturer Name :  {settings.reportedManufacturerName} </Text>
            <Text style={globalstyles.infoText} > Model Name :  {settings.reportedSensorType} </Text>
            <Text style={globalstyles.infoText} > Serial Number :  {settings.reportedSerialNumber} </Text>
            <Text style={globalstyles.infoText} > Firmware Name :  {settings.reportedFirmwareRevision} </Text>
            <Text style={globalstyles.infoTitleText} >Settings Information</Text>
            <Text style={globalstyles.infoText} > Sensor Time : {settings.reportedSensorTime} </Text>
            <Text style={globalstyles.infoText} > Wake Time : {settings.reportedWakeTime} </Text>
            <Text style={globalstyles.infoText} > Sleep Time : {settings.reportedSleepTime} </Text>
            <Text style={globalstyles.infoText} > Measurement Interval : {settings.reportedMeasurementInterval} </Text>
            <Text style={globalstyles.infoText} > Advertising Interval : {settings.reportedAdvInterval} </Text>
            <Text style={globalstyles.infoText} > Advertising Duration : {settings.reportedAdvDuration} </Text>
            <Text style={globalstyles.infoText} > Accelerometer Range : {settings.reportedAccelRange} </Text>
            <Text style={globalstyles.infoTitleText} >Status Information</Text>
            <Text style={globalstyles.infoText} > Battery : {settings.reportedBattery} </Text>
            <Text style={globalstyles.infoText} > Temperature : {settings.reportedTemerature} </Text>
          </>
        ) : (<></>)} */}
            <Text style={globalstyles.infoTitleText} >Sensor Data  </Text>
            {
              sensorParametersState ? (
                _tableRowView(sensorParametersState)
              ):(<></>)
            }
            {/* 
            <FlatList
              horizontal
              data={caculatedDataService}
              keyExtractor={(item, index) => item.gwTime + index}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > rmsHoriz :  {item.rmsHoriz} </Text>
                    <Text style={globalstyles.infoText} > peakHoriz :  {item.peakHoriz} </Text>
                    <Text style={globalstyles.infoText} > peakToPeakHoriz :  {item.peakToPeakHoriz} </Text>
                    <Text style={globalstyles.infoText} > crestFactorHoriz :  {item.crestFactorHoriz} </Text>
                    <Text style={globalstyles.infoText} > rmsVert :  {item.rmsVert} </Text>
                    <Text style={globalstyles.infoText} > peakVert :  {item.peakVert} </Text>
                    <Text style={globalstyles.infoText} > peakToPeakVert :  {item.peakToPeakVert} </Text>
                    <Text style={globalstyles.infoText} > crestFactorVert :  {item.crestFactorVert} </Text>
                    <Text style={globalstyles.infoText} > rmsAxial :  {item.rmsAxial} </Text>
                    <Text style={globalstyles.infoText} > peakAxial :  {item.peakAxial} </Text>
                    <Text style={globalstyles.infoText} > peakToPeakAxial :  {item.peakToPeakAxial} </Text>
                    <Text style={globalstyles.infoText} > crestFactorAxial :  {item.crestFactorAxial} </Text>
                  </View>
                </View>
              }
            >
            </FlatList> */}

            <Text style={globalstyles.infoTitleText} >Calculated Packets  </Text>
            <Text style={globalstyles.infoText} >    Calculated X Axis </Text>
            <FlatList
              horizontal
              data={sensorCalXDataService}
              keyExtractor={(item, index) => item.gwTime +'-'+ item.pk.toString()}
              renderItem={({ item }) =>
                <View    style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>

            <Text style={globalstyles.infoText} >    Calculated Y Axis </Text>
            <FlatList
              horizontal
              data={sensorCalYDataService}
              keyExtractor={(item, index) => item.gwTime + index}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>

            <Text style={globalstyles.infoText} >    Calculated Z Axis </Text>
            <FlatList
              horizontal
              data={sensorCalZDataService}
              keyExtractor={(item, index) => item.gwTime +'-'+ item.pk.toString()}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>
            <Text style={globalstyles.infoTitleText} >Low frequency  </Text>
            <Text style={globalstyles.infoText} >    Low frequency X Axis </Text>
            <FlatList
              horizontal
              data={lowFrequencyXDataService}
              keyExtractor={(item, index) => item.gwTime +'-'+ item.pk.toString()}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packet :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>

            <Text style={globalstyles.infoText} >    Low frequency Y Axis </Text>
            <FlatList
              horizontal
              data={lowFrequencyYDataService}
              keyExtractor={(item, index) => item.gwTime +'-'+ item.pk.toString()}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>
            <Text style={globalstyles.infoText} >    Low frequency Z Axis </Text>
            <FlatList
              horizontal
              data={lowFrequencyZDataService}
              keyExtractor={(item, index) => item.gwTime +'-'+ item.pk.toString()}
              renderItem={({ item }) =>
                <View style={[{ flex: 1, flexDirection: 'column', margin: 10 }]}>
                  <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                  </View>
                </View>
              }
            >
            </FlatList>

{/* 
            {dataPacktsInformation.length > 0 ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    if (isConnected)
                      readdataInfo()
                  }}
                >
                  <Text style={globalstyles.infoTitleText} >Calculated Data Service  </Text>
                </TouchableOpacity>

                <Text style={globalstyles.infoText} > X Axis TimeStamp  {dataPacktsInformation[0].x_timeStamp} </Text>
                <Text style={globalstyles.infoText} > X Axis RMS {dataPacktsInformation[0].x_Rms} </Text>
                <Text style={globalstyles.infoText} > X Axis Peak {dataPacktsInformation[0].x_peak} </Text>
                <Text style={globalstyles.infoText} > X Axis Peak2Peak {dataPacktsInformation[0].x_peak2Peak} </Text>
                <Text style={globalstyles.infoText} > X Axis CrestFactor {dataPacktsInformation[0].x_crestFactor} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Y Axis TimeStamp {dataPacktsInformation[0].y_timeStamp} </Text>
                <Text style={globalstyles.infoText} > Y Axis RMS {dataPacktsInformation[0].y_Rms} </Text>
                <Text style={globalstyles.infoText} > Y Axis Peak {dataPacktsInformation[0].y_peak} </Text>
                <Text style={globalstyles.infoText} > Y Axis Peak2Peak {dataPacktsInformation[0].y_peak2Peak} </Text>
                <Text style={globalstyles.infoText} > Y Axis CrestFactor {dataPacktsInformation[0].y_crestFactor} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Z Axis TimeStamp {dataPacktsInformation[0].z_timeStamp} </Text>
                <Text style={globalstyles.infoText} > Z Axis RMS {dataPacktsInformation[0].z_Rms} </Text>
                <Text style={globalstyles.infoText} > Z Axis Peak {dataPacktsInformation[0].z_peak} </Text>
                <Text style={globalstyles.infoText} > Z Axis Peak2Peak {dataPacktsInformation[0].z_peak2Peak} </Text>
                <Text style={globalstyles.infoText} > Z Axis CrestFactor {dataPacktsInformation[0].z_crestFactor} </Text>
              </>
            ) : (<></>)}
            {rawDataPacktsInformation.length > 0 ? (
              <>
                <Text style={globalstyles.infoText} > X =  {rawDataPacktsInformation[0].X_Raw_Data} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Y = {rawDataPacktsInformation[0].Y_Raw_Data} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Z = {rawDataPacktsInformation[0].Z_Raw_Data} </Text>
                <Text style={globalstyles.infoTitleText} >LF Data Service  </Text>
                <Text style={globalstyles.infoText} > X =  {rawDataPacktsInformation[0].X_Frequency} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Y = {rawDataPacktsInformation[0].Y_Frequency} </Text>
                <Text style={globalstyles.infoText} >  </Text>
                <Text style={globalstyles.infoText} > Z = {rawDataPacktsInformation[0].Z_Frequency} </Text>
              </>
            ) : (<></>)}
 */}            
            {/* <Text style={globalstyles.infoText} > Mac Address : {peripheralId} </Text> */}
          </View>
        </ScrollView>
      </View >
    </SafeAreaView >
  )
}

export default SensorInfoDashboard

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10,justifyContent: 'flex-start', backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: 'darkblue', justifyContent: 'space-between' },
  headText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: 'white' },
  text: { margin: 6, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
})