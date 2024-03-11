import React, { useEffect, useState } from 'react'

import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import {   DocumentDirectoryPath } from 'react-native-fs';

import globalStyles from '.././assets/css/style'
import { HeaderTitleView } from '../components/header'
import Loader from '../components/Loader'
import SelectDropdown from 'react-native-select-dropdown'
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux';
import { dataBySensorNumberSelector } from '../store/selector'
import { getSensorByNumber } from '../services/bleServices'
import { Table, Row, Rows } from 'react-native-table-component';
import RNFetchBlob from 'react-native-fetch-blob';
import XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import Share from 'react-native-share';

const AdvertisementLogScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const dataBySensorNumberSel = useSelector(dataBySensorNumberSelector)
    const [tableDataArray, setTableDataArray] = useState([]);
    const tableColumn = ['DateTime', 'Mac Id/Name', 'Battery/Temp', 'flags']
    const pathDoc = `${DocumentDirectoryPath}`;
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(moment().format('MM-DD-YYYY'))
    const [sensorNumber, setSensorNumber] = useState('')
    const [open, setOpen] = useState(false)


    const _onPress = () => {
        console.log('_onPress DataServiceHistory')
        navigation.navigate('DataServiceHistory')
    }
    
    const _onSharePress =   () => {
        console.log('_onSharePress called')
        setLoading(true)
        try {
             exportToAdvertismentBySensorNumber(dataBySensorNumberSel, 'advertismentBySensorNumber')
        } catch (error) {
            console.log(error)
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    const exportToAdvertismentBySensorNumber = async (worksheetsData, fileName) => {
        try {
            const workbook = new ExcelJS.Workbook();
            let groupedDataId = Object.keys(worksheetsData)
            console.log(groupedDataId)
            groupedDataId.forEach((id, sheetIndex) => {
                const worksheet = workbook.addWorksheet(`${id}`, {
                    state: 'frozen',
                    xSplit: 0,
                    ySplit: 1, // Set to 1 to freeze the first row
                });
                const tableColumn = ['DateTime', 'Mac Address', 'Sensor Name','Sensor number', 'Battery', 'Temperature',
                    'Bit 0', 'Bit 1', 'Bit 2', 'Bit 3', 'Bit 4',
                    'Bit 5', 'Bit 6', 'Bit 7', 'Bit 8']
                // Add headers
                worksheet.addRow(tableColumn);
                const specificMacAddressData = worksheetsData[id];
                specificMacAddressData.map((item) => {
                    worksheet.addRow([item.sensorTime, item.mac_address, item.sensor_name,item.sensor_number, item.battery, item.temperature,
                    item.data.commission ? 1 : 0, item.data.accelerometer ? 1 : 0, item.data.lowFeq ? 1 : 0, item.data.bty ? 1 : 0,
                    item.data.temp ? 1 : 0, item.data.accelError ? 1 : 0, item.data.adcError ? 1 : 0, item.data.DeviceSettings ? 1 : 0, item.data.gpioError ? 1 : 0
                    ]);
                })

                // Auto-fit all columns
                worksheet.columns.forEach((column) => {
                    console.log('worksheet.columns', column.header)
                    // column.width = column.header.length < 12 ? 12 : column.header.length;
                    column.alignment = { horizontal: 'center' };
                });
            });

            // Save the workbook to a buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Convert buffer to base64-encoded string
            const base64String = buffer.toString('base64');

            // Save the base64-encoded string to a file
            RNFetchBlob.fs
                .writeFile(pathDoc + `/${fileName}.xlsx`, base64String, 'base64')
                .then(() => {
                    console.log(' advExcel file saved successfully.');
                    setLoading(false)
                    RNFetchBlob.fs.exists(pathDoc + `/${fileName}.xlsx`)
                        .then((exists) => {
                            if (exists) {
                                // File exists, proceed with sharing
                                const filePath = `file://${pathDoc}/${fileName}.xlsx`;
                                const options = {
                                    title: 'Share Excel File',
                                    message: 'Check out Advertisement histroy file!',
                                    url: filePath,
                                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                };

                                Share.open(options)
                                    .then((res) => {
                                        console.log(res);
                                    })
                                    .catch((err) => {
                                        err && console.log(err);
                                    });
                            } else {
                                console.error('File does not exist.');
                            }
                        })
                        .catch((error) => {
                            console.error('Error checking file existence:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error saving Excel file:', error);
                });

        } catch (error) {
            console.log(error)
        }

    };

    const refreshTable = async (sensorNumber, date) => {
        console.log('refreshTable', sensorNumber, date)
        setTableDataArray([])
        setLoading(true)
        console.log('sensorNumber', sensorNumber)
        dispatch(getSensorByNumber({ key1: sensorNumber, key2: dataBySensorNumberSel, key3: date })).then((response) => {
            console.log('response', response)
            if (response.payload) {
                console.log('response', response.payload.length)
                setTableDataArray(response.payload)
                setTimeout(() => {
                    setLoading(false)
                }, 2000);
            } else {
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            }
        })
    }

    const flags = (flags) => {
        let bit0 = flags.commission ? 1 : 0
        let bit1 = flags.accelerometer ? 1 : 0
        let bit2 = flags.lowFeq ? 1 : 0
        let bit3 = flags.bty ? 1 : 0
        let bit4 = flags.temp ? 1 : 0
        let bit5 = flags.accelError ? 1 : 0
        let bit6 = flags.adcError ? 1 : 0
        let bit7 = flags.DeviceSettings ? 1 : 0
        let bit8 = flags.gpioError ? 1 : 0
        return `0-${bit0} 1-${bit1} 2-${bit2} 3-${bit3} 4-${bit4}\n5-${bit5} 6-${bit6}7-${bit7} 8-${bit8}`
    }

    const _renderItem = (data) => {
        let item = data.item
        return (
            <>
                <Table borderStyle={{ borderWidth: 0.5, borderColor: 'grey', justifyContent: 'space-between', }}>
                    <Row data={[
                        item.sensorTime,
                        `${item.mac_address}\n${item.sensor_number ? item.sensor_number : ''}`,
                        `${item.battery}/${item.temperature}`,
                        flags(item.data)
                    ]} textStyle={globalStyles.text} />
                </Table>
            </>
        )
    };

    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={globalStyles.safeContainerStyle}>
            <HeaderTitleView navigation={navigation} title={'Advertisement'} onPress={_onPress} isShare={true} onSharePress={_onSharePress} />
            <Loader loading={loading} />
            <View style={globalStyles.containerView} >
                <View style={{ flex: 1 }}>
                    <Text style={globalStyles.buttonTextStyle}>Select sensor</Text>
                    <View style={globalStyles.SectionStyle}>
                        <SelectDropdown
                            style={{
                                color: '#000000',
                                paddingVertical: 10,
                                fontSize: 16,
                                fontWeight: '500'
                            }}
                            data={Object.keys(dataBySensorNumberSel)}
                            defaultButtonText="Select Sensor name"
                            onSelect={(selectedItem, index) => {
                                console.log(selectedItem, index)
                                setSensorNumber(selectedItem)
                                refreshTable(selectedItem, date)
                            }}
                            buttonTextAfterSelection={(selectedItem, index) => {
                                // text represented after item is selected
                                // if data array is an array of objects then return selectedItem.property to render after item is selected
                                return selectedItem
                            }}
                            rowTextForSelection={(item, index) => {
                                // text represented for each item in dropdown
                                // if data array is an array of objects then return item.property to represent item in dropdown
                                return item
                            }}
                            buttonStyle={globalStyles.dropdown1BtnStyle}
                            buttonTextStyle={globalStyles.dropdown1BtnTxtStyle}
                            renderDropdownIcon={isOpened => {
                                return <Material name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={18} />;
                            }}
                            dropdownIconPosition={'right'}
                            dropdownStyle={globalStyles.dropdown1DropdownStyle}
                            rowStyle={globalStyles.dropdown1RowStyle}
                            rowTextStyle={globalStyles.dropdown1RowTxtStyle}
                        />
                        <TouchableOpacity style={[{
                            flex: 1,
                            flexDirection: "row",
                            marginTop: 0,
                            height: 40,
                            marginLeft: 10,
                            justifyContent: 'space-between',
                            backgroundColor: '#FFF',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#dadae8',
                        }]}

                            onPress={() => {
                                setOpen(true)
                            }}
                        >
                            <Text style={{ marginTop: 10, marginStart: 5, fontSize: 16, fontFamily: '400', textAlign: 'center', color: '#000', }}>{date}</Text>
                            <Material name={'calendar'} color={'#0273CC'} size={24} style={{ marginLeft: 0, marginTop: 10, marginRight: 10 }}
                                onPress={() => {
                                    setOpen(true)
                                }} />
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={open}
                            mode="date"
                            maximumDate={new Date()}
                            // display="spinner"
                            is24Hour={true}
                            onConfirm={(date) => {
                                setOpen(false)
                                try {
                                    let mDate = moment(date).format('MM-DD-YYYY');
                                    setDate(mDate)
                                    console.log('selected format date', mDate, sensorNumber)
                                    refreshTable(sensorNumber, mDate)
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                            onCancel={() => {
                                setOpen(false)
                            }}
                        />

                    </View>
                </View>
                <View style={{ flex: 8 }}>
                    <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between' }}>
                        <Row data={tableColumn} style={[globalStyles.head, { marginTop: 10, }]} textStyle={globalStyles.headText} />
                    </Table>
                    {
                        tableDataArray.length > 0 ? (<>
                            <FlatList
                                data={tableDataArray}
                                renderItem={_renderItem}
                                keyExtractor={(item, index) => item.sensorTime + '-' + index}
                            />

                        </>) : (
                            <Table borderStyle={{ borderWidth: 1, borderColor: 'grey', justifyContent: 'space-between' }}>
                                <Row data={['No Data Found']} style={[globalStyles.no_head, { marginTop: 2, }]} textStyle={globalStyles.text} />
                            </Table>
                        )
                    }
                </View>

            </View>
        </SafeAreaView>
    )
}

export default AdvertisementLogScreen

const styles = StyleSheet.create({})