import React, { useEffect, useState } from 'react'
import { Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native'
import globalstyles from '.././assets/css/style'
import { HeaderTitleSettingsView, HeaderTitleView } from '../components/header'
import { useDispatch, useSelector } from 'react-redux';
import { caculatedDataSelector, caculatedSensorDataSelector, calXDataServiceSelector, calYDataServiceSelector, calZDataServiceSelector, lowFrequencyXSelector, lowFrequencyYSelector, lowFrequencyZSelector, settingsInfoSelector } from '../store/selector';
import { Table, Row, Rows } from 'react-native-table-component';
import Loader from '../components/Loader';
import { isPeripheralConnected, readCharacteristicData, sleep, writeData } from '../components/bleModule/BleCommands';
import CustomTextinput from '../components/CustomTextinput';
import CustomButton from '../components/CustomButton';
import { DeviceInformationService, SettingsService, StatusService } from '../components/bleModule/Characteristic';
import { Buffer } from "buffer";
import { byteToString, convertToLittleEndianShort, convertToLittleEndianShortValue, minutestoByteArray, stringToByteArray } from '../components/bleModule/utils';
import { addSettings } from '../store/sensorslice';
import { dateFormat, zeroPad } from '../utils/utils';
import { showMessage } from 'react-native-flash-message';

const SettingsInfo = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const settings = useSelector(settingsInfoSelector)
    const settingsIn = useSelector((state) => state.sensorData.settings);

    const [loading, setLoading] = useState(false);
    const [wakeTime, setWakeTime] = useState('');
    const [sleepTime, setSleepTime] = useState('');
    const [measuremntItrvl, setMeasuremntItrvl] = useState('');
    const [advertisingItrvl, setAdvertisingItrvl] = useState('');
    const [advDuration, setAdvDuration] = useState('');
    const [peripheralId, setPeripheralId] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const sysInfo = {
        reportedMacAddress: peripheralId,
    }
    useEffect(
        () => {
            const id = route.params?.peripheralID
            if (id) {
                isDeviceConnected(id)
                setPeripheralId(id)
            }
        }
        , []
    )
    const isDeviceConnected = async (peripheralId) => {
        const isPerpheralState = await isPeripheralConnected(peripheralId)
        if (isPerpheralState) {
            setIsConnected(true)
            await settingsInfo(peripheralId)
        } else {
            setIsConnected(false)
        }
    }

    const _wakeTimeReadWrite = async () => {
        if (wakeTime) {
            if (wakeTime.includes('.')) {
                let temp = wakeTime.split('.')
                let msb = parseInt(temp[0])
                let lsb = parseInt(temp[1])
                console.log("msb:lsb", msb, lsb)
                try {
                    const uint8 = new Uint8Array(2);  //  //default 0x0800  (08:00 or 08:00 AM)
                    uint8[0] = parseInt(temp[0]); //hours
                    uint8[1] = parseInt(temp[1]); // minutes
                    const buf1 = Buffer.from([uint8[1], uint8[0]]);
                    const data = buf1.toJSON().data
                    await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_WAKE_TIME)
                    showMessage({
                        message: "writing...",
                        position: 'top',
                    });
                    await settingsInfo(peripheralId)
                    showMessage({
                        message: "Success"
                    });
                    setWakeTime('')

                } catch (error) {
                    console.error("WAKE_TIME error : ", error)
                }


            } else {
                Alert.alert('Enter correct format, check hint')
            }
        } else {
            Alert.alert('Field should not be empty')
        }
    }
    const _sleepTimeReadWrite = async () => {

        if (sleepTime) {
            if (sleepTime.includes('.')) {
                let temp = sleepTime.split('.')
                let msb = parseInt(temp[0])
                let lsb = parseInt(temp[1])
                console.log("msb:lsb", msb, lsb)
                try {
                    const uint8 = new Uint8Array(2);  //  //default 0x0800  (08:00 or 08:00 AM)
                    uint8[0] = parseInt(temp[0]); //hours
                    uint8[1] = parseInt(temp[1]); // minutes
                    const buf1 = Buffer.from([uint8[1], uint8[0]]);
                    const data = buf1.toJSON().data
                    await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_SLEEP_TIME)
                    showMessage({
                        message: "writing...",
                        position: 'top',
                    });
                    await settingsInfo(peripheralId)
                    showMessage({
                        message: "Success"
                    });
                    setSleepTime('')
                } catch (error) {
                    console.error("SLEEP_TIME error : ", error)
                }


            } else {
                Alert.alert('Enter correct format, check hint')
            }
        } else {
            Alert.alert('Field should not be empty')
        }

    }
    const _measurementIntrvlReadWrite = async () => {
        if (measuremntItrvl) {
            try {
                const buf1 = minutestoByteArray(parseInt(measuremntItrvl), 0) // minutes
                console.log("minutestoByteArray buf ", buf1, parseInt(measuremntItrvl))
                const data = buf1.toJSON().data
                await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_MEASUREMENT_INTERVAL)
                showMessage({
                    message: "writing...",
                    position: 'top',
                });
                await settingsInfo(peripheralId)
                showMessage({
                    message: "Success"
                });
                setMeasuremntItrvl('')

            } catch (error) {
                console.error("MEASUREMENT_INTERVAL error : ", error)
            }
        } else {
            Alert.alert('Field should not be empty')
        }
    }
    const _advIntrvlReadWrite = async () => {

        if (advertisingItrvl) {
            try {
                let bytes = stringToByteArray(parseInt(advertisingItrvl)) //  600 sec = 10min
                console.log("minutestoByteArray buf ", bytes, parseInt(advertisingItrvl))
                if (bytes) {
                    const uint8 = new Uint8Array(2);
                    uint8[0] = bytes[0];
                    uint8[1] = bytes[1];
                    const buf1 = Buffer.from([uint8[1], uint8[0]]);
                    const data = buf1.toJSON().data
                    await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_INTERVAL)
                }
                showMessage({
                    message: "writing...",
                    position: 'top',
                });
                await settingsInfo(peripheralId)
                showMessage({
                    message: "Success"
                });
                setAdvertisingItrvl('')

            } catch (error) {
                console.error("ADVERTISING_INTERVAL error : ", error)
            }
        } else {
            Alert.alert('Field should not be empty')
        }

    }
    const _advDurationReadWrite = async () => {
        if (advDuration) {
            try {
                const buf1 = minutestoByteArray(parseInt(advDuration), 0) // minutes
                console.log("minutestoByteArray buf ", buf1, parseInt(advDuration))
                const data = buf1.toJSON().data
                await writeData(peripheralId, data, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
                showMessage({
                    message: "writing...",
                    position: 'top',
                });
                await settingsInfo(peripheralId)
                showMessage({
                    message: "Success"
                });
                setAdvDuration('')

            } catch (error) {
                console.error("MEASUREMENT_INTERVAL error : ", error)
            }
        } else {
            Alert.alert('Field should not be empty')
        }
    }

    const settingsInfo = async (peripheralId) => {
        try {
            console.log("readSystemInfo", peripheralId)
            let modelNumber = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_MODEL_NUMBER)
            if (modelNumber) {
                console.log('readCharacteristic modelNumber ', byteToString(modelNumber))
            }
            let manufacturerName = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_MONUFACTURE_NAME)
            if (manufacturerName) {
                console.log('readCharacteristic manufacturerName', byteToString(manufacturerName))
            }
            let firmwareRevision = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_FIRMWARE_VERSION)
            if (firmwareRevision) {
                console.log('readCharacteristic firmwareRevision', byteToString(firmwareRevision))
            }
            let serialNumber = await readCharacteristicData(peripheralId, DeviceInformationService.SERVICE, DeviceInformationService.CHARACTERISTIC_SERIAL_NUMBER)
            if (serialNumber) {
                console.log('readCharacteristic serialNumber', byteToString(serialNumber))
            }
            sysInfo.reportedMacAddress = peripheralId,
                sysInfo.reportedSensorType = byteToString(modelNumber)
            sysInfo.reportedSerialNumber = byteToString(serialNumber)
            sysInfo.reportedManufacturerName = byteToString(manufacturerName)
            sysInfo.reportedFirmwareRevision = byteToString(firmwareRevision)

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
            }

            let advertisingDuration = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ADVERTISING_DURATION)
            if (advertisingDuration) {
                const buffer = Buffer.from(advertisingDuration);
                let value = `${convertToLittleEndianShortValue(buffer)} seconds`
                sysInfo.reportedAdvDuration = value
            }

            let acceleraomate = await readCharacteristicData(peripheralId, SettingsService.SERVICE, SettingsService.CHARACTERISTIC_ACCELEROMATE_RANGE)
            if (acceleraomate) {
                const buffer = Buffer.from(acceleraomate);
                let value = `${buffer.readUInt8()} g`
                sysInfo.reportedAccelRange = value
                console.log("advertisingDuration", buffer, value);
            }

            let batteryVoltage = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_BATTERY_VOLTAGE)
            if (batteryVoltage) {
                const buffer = Buffer.from(batteryVoltage); //by 1000 v  || 
                let value = `${convertToLittleEndianShortValue(buffer) / 1000} V`
                sysInfo.reportedBattery = value
            }

            let temperature = await readCharacteristicData(peripheralId, StatusService.SERVICE, StatusService.CHARACTERISTIC_TEMPERATURE)
            if (temperature != undefined) {
                const buffer = Buffer.from(temperature);
                let value = `${buffer.readUInt8()} °C`
                sysInfo.reportedTemerature = value
            }
            dispatch(addSettings(sysInfo))
        } catch (error) {
            console.log('settingsInfo error => ', error)
        }

    }

    const _renderTable = () => {

        if (settings) {
            return (
                <>
                    <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between', margin: 5 }}>
                        <Row data={['Mac Address', settings.reportedMacAddress]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Manufacturer Name', settings.reportedManufacturerName]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Model Name', settings.reportedSensorType]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Serial Number', settings.reportedSerialNumber]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Sensor Time', settings.reportedSensorTime]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Wake Time', settings.reportedWakeTime]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Sleep Time', settings.reportedSleepTime]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Measurement Interval', settings.reportedMeasurementInterval]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Advertising Interval', settings.reportedAdvInterval]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Advertising Duration', settings.reportedAdvDuration]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Accelerometer Range', settings.reportedAccelRange]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Battery', settings.reportedBattery]} style={styles.head} textStyle={styles.headText} />
                        <Row data={['Temperature', settings.reportedTemerature]} style={styles.head} textStyle={styles.headText} />
                    </Table>
                </>
            )
        }


    }

    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={[globalstyles.safeContainerStyle, { marginBottom: 10 }]}>
            <View style={globalstyles.containerView} >
                <HeaderTitleView navigation={navigation} title={'Settings'} isVisible={false} isConnected={isConnected} />
                <Loader loading={loading} />
                <ScrollView >
                    <View>
                        {(settings && !isConnected) ? (
                            <>
                                <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between', margin: 5 }}>
                                    <Row data={['Mac Address', settings.reportedMacAddress]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Manufacturer Name', settings.reportedManufacturerName]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Model Name', settings.reportedSensorType]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Serial Number', settings.reportedSerialNumber]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Sensor Time', settings.reportedSensorTime]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Wake Time', settings.reportedWakeTime]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Sleep Time', settings.reportedSleepTime]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Measurement Interval', settings.reportedMeasurementInterval]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Advertising Interval', settings.reportedAdvInterval]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Advertising Duration', settings.reportedAdvDuration]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Accelerometer Range', settings.reportedAccelRange]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Battery', settings.reportedBattery]} style={styles.head} textStyle={styles.headText} />
                                    <Row data={['Temperature', settings.reportedTemerature]} style={styles.head} textStyle={styles.headText} />
                                </Table>
                            </>
                        ) : (<>

                            {
                                settingsIn ? (<>
                                    <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between', margin: 5 }}>
                                        <Row data={['Mac Address', settingsIn.reportedMacAddress]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Manufacturer Name', settingsIn.reportedManufacturerName]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Model Name', settingsIn.reportedSensorType]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Serial Number', settingsIn.reportedSerialNumber]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Sensor Time', settingsIn.reportedSensorTime]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Wake Time', settingsIn.reportedWakeTime]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Sleep Time', settingsIn.reportedSleepTime]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Measurement Interval', settingsIn.reportedMeasurementInterval]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Advertising Interval', settingsIn.reportedAdvInterval]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Advertising Duration', settingsIn.reportedAdvDuration]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Accelerometer Range', settingsIn.reportedAccelRange]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Battery', settingsIn.reportedBattery]} style={styles.head} textStyle={styles.headText} />
                                        <Row data={['Temperature', settingsIn.reportedTemerature]} style={styles.head} textStyle={styles.headText} />
                                    </Table>
                                </>) : (<></>)
                            }

                        </>)}
                        {
                            isConnected ? (<>
                                <View>

                                    <View style={
                                        {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowRadius: 6,
                                            shadowOpacity: 0.26,
                                            elevation: 8,
                                            marginLeft: 10,
                                            marginEnd: 10,
                                            marginTop: 10,
                                            backgroundColor: '#ededed',
                                            paddingTop: 5,
                                            paddingBottom: 20,
                                            borderRadius: 10
                                        }
                                    }>
                                        <Text style={{  color:'#000',fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginTop: 10, marginStart: 20, }}>
                                            Wake time [ex: 08.12 ]</Text>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            paddingHorizontal: 10,
                                            marginBottom: 5,
                                        }}>

                                            <CustomTextinput
                                                value={wakeTime}
                                                placeholder="Wake time"
                                                onChangeText={value => setWakeTime(value)}
                                                keyboardType='numeric'
                                                multiline={false}
                                                autoCapitalize="sentences"
                                                returnKeyType="next"
                                                style={{ textAlignVertical: 'top' }}
                                            />

                                            <CustomButton
                                                title={'write'}
                                                customClick={
                                                    () => {
                                                        _wakeTimeReadWrite()
                                                    }
                                                }
                                            />
                                        </View>

                                    </View>

                                    <View style={
                                        {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowRadius: 6,
                                            shadowOpacity: 0.26,
                                            elevation: 8,
                                            marginLeft: 10,
                                            marginEnd: 10,
                                            marginTop: 10,
                                            backgroundColor: '#ededed',
                                            paddingTop: 5,
                                            paddingBottom: 20,
                                            borderRadius: 10
                                        }
                                    }>
                                        <Text style={{  color:'#000',fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginTop: 10, marginStart: 20, }}>
                                            Sleep time [ex: 08.12 ]</Text>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            paddingHorizontal: 10,
                                            marginBottom: 5,
                                        }}>

                                            <CustomTextinput
                                                value={sleepTime}
                                                placeholder="Sleep time"
                                                onChangeText={value => setSleepTime(value)}
                                                keyboardType='numeric'
                                                multiline={false}
                                                autoCapitalize="sentences"
                                                returnKeyType="next"
                                                style={{ textAlignVertical: 'top' }}
                                            />

                                            <CustomButton
                                                title={'write'}
                                                customClick={
                                                    () => {
                                                        _sleepTimeReadWrite()
                                                    }
                                                }
                                            />
                                        </View>

                                    </View>

                                    <View style={
                                        {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowRadius: 6,
                                            shadowOpacity: 0.26,
                                            elevation: 8,
                                            marginLeft: 10,
                                            marginEnd: 10,
                                            marginTop: 10,
                                            backgroundColor: '#ededed',
                                            paddingTop: 5,
                                            paddingBottom: 20,
                                            borderRadius: 10
                                        }
                                    }>
                                        <Text style={{ color:'#000', fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginTop: 10, marginStart: 20, }}>
                                            Measurement interval [ex: 5 = 5 mintes ]</Text>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            paddingHorizontal: 10,
                                            marginBottom: 5,
                                        }}>

                                            <CustomTextinput
                                                value={measuremntItrvl}
                                                placeholder="Measurement interval"
                                                onChangeText={value => setMeasuremntItrvl(value)}
                                                keyboardType='numeric'
                                                multiline={false}
                                                autoCapitalize="sentences"
                                                returnKeyType="next"
                                                style={{ textAlignVertical: 'top' }}
                                            />

                                            <CustomButton
                                                title={'write'}
                                                customClick={
                                                    () => {
                                                        _measurementIntrvlReadWrite()
                                                    }
                                                }
                                            />
                                        </View>

                                    </View>

                                    <View style={
                                        {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowRadius: 6,
                                            shadowOpacity: 0.26,
                                            elevation: 8,
                                            marginLeft: 10,
                                            marginEnd: 10,
                                            marginTop: 10,
                                            backgroundColor: '#ededed',
                                            paddingTop: 5,
                                            paddingBottom: 20,
                                            borderRadius: 10
                                        }
                                    }>
                                        <Text style={{  color:'#000',fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginTop: 10, marginStart: 20, }}>
                                            Advertising interval [ex: 60 = 60 seconds ]</Text>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            paddingHorizontal: 10,
                                            marginBottom: 5,
                                        }}>

                                            <CustomTextinput
                                                value={advertisingItrvl}
                                                placeholder="Advertising interval"
                                                onChangeText={value => setAdvertisingItrvl(value)}
                                                keyboardType='numeric'
                                                multiline={false}
                                                autoCapitalize="sentences"
                                                returnKeyType="next"
                                                style={{ textAlignVertical: 'top' }}
                                            />

                                            <CustomButton
                                                title={'write'}
                                                customClick={
                                                    () => {
                                                        _advIntrvlReadWrite()
                                                    }
                                                }
                                            />
                                        </View>

                                    </View>

                                    <View style={
                                        {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowRadius: 6,
                                            shadowOpacity: 0.26,
                                            elevation: 8,
                                            marginLeft: 10,
                                            marginEnd: 10,
                                            marginTop: 10,
                                            backgroundColor: '#ededed',
                                            paddingTop: 5,
                                            paddingBottom: 20,
                                            borderRadius: 10
                                        }
                                    }>
                                        <Text style={{  color:'#000',fontSize: 14, fontWeight: 'bold', textAlign: 'left', marginTop: 10, marginStart: 20, }}>
                                            Advertising duration [ex: 20 = 20 seconds ]</Text>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            paddingHorizontal: 10,
                                            marginBottom: 5,
                                        }}>

                                            <CustomTextinput
                                                value={advDuration}
                                                placeholder="Advertising duration"
                                                onChangeText={value => setAdvDuration(value)}
                                                keyboardType='numeric'
                                                multiline={false}
                                                autoCapitalize="sentences"
                                                returnKeyType="next"
                                                style={{ textAlignVertical: 'top' }}
                                            />

                                            <CustomButton
                                                title={'write'}
                                                customClick={
                                                    () => {
                                                        _advDurationReadWrite()
                                                    }
                                                }
                                            />
                                        </View>

                                    </View>

                                </View>
                            </>) : (<></>)
                        }



                    </View>
                </ScrollView>
            </View >
        </SafeAreaView >
    )
}

export default SettingsInfo

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, justifyContent: 'flex-start', backgroundColor: '#fff' },
    head: { height: 30, backgroundColor: '#ededed', justifyContent: 'space-between', alignContent: 'flex-start', },
    headText: { marginStart: 10, fontSize: 12, fontWeight: 'bold', textAlign: 'left', color: 'black' },
    text: { margin: 6, fontSize: 8, fontWeight: 'bold', textAlign: 'center', color:'#000', },
})
