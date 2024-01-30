import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Button, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import globalStyles from '.././assets/css/style'
import { HeaderTitleView } from '../components/header'
import { useDispatch, useSelector } from 'react-redux';
import { advatisementDataSelector, dataBySensorNumberSelector, groupedDataIdSelector, groupedDataSelector, sacnnedAdvatisementDataSelector } from '../store/selector';
import { Table, Row, Rows } from 'react-native-table-component';
import Loader from '../components/Loader';
import { Buffer } from "buffer";
import { sleep } from '../components/bleModule/BleCommands';
import { CachesDirectoryPath, DocumentDirectoryPath, DownloadDirectoryPath, writeFile } from 'react-native-fs';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import RNFetchBlob from 'react-native-fetch-blob';
import XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import Share from 'react-native-share';
import moment from 'moment'
import { getAdvertismentHistroy, getSensorByNumber } from '../services/bleServices';
import SelectDropdown from 'react-native-select-dropdown'
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomTextinput from '../components/CustomTextinput';

const DashboardLog = ({ navigation }) => {
    const dispatch = useDispatch();
    const { promiseInProgress } = usePromiseTracker();
    const advertisementGrp = useSelector(groupedDataSelector)
    const dataBySensorNumberSel = useSelector(dataBySensorNumberSelector)
    const groupedDataId = useSelector(groupedDataIdSelector)
    const advatisementHistory = useSelector((state) => state.sensorData.advatisementHistory)
    const [dataList, setDataList] = useState();
    const [tableDataArray, setTableDataArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const pathDoc = `${DocumentDirectoryPath}`;
    // const pathDoc = `${RNFetchBlob.fs.dirs.DocumentDir}`;
    // const path = `${DownloadDirectoryPath}/${'advertisement'}.txt`;
    const tableColumn = ['DateTime', 'Mac Id/Name', 'Battery/Temp', 'flags']
    const [date, setDate] = useState(moment().format('MM-DD-YYYY'))
    const [sensorNumber, setSensorNumber] = useState('')
    const [open, setOpen] = useState(false)

    // console.log('advatisementHistory',advatisementHistory)
    useEffect(
        () => {
            // setLoading(true)
            // setTimeout(() => {
            //     setLoading(false)
            // }, 2000);

            // dispatch(getAdvertismentHistroy(dataBySensorNumberSel, advertisementGrp))
            //     .then((response) => {
            //         setTableDataArray(response.payload)
            //         setLoading(false)
            //         // console.log('getAdvertismentHistroy response',response.payload)
            //     })
            // exportToExcel1(worksheetsData, 'exported_data_multiple_woarksheets');
            // fetchData()
        }, [])
    const fetchData = async () => {
        // Use trackPromise to track the overall promise 
        trackPromise(groupedArray(groupedDataId, advertisementGrp))
            .then((result) => {
                // Handle the resolved result
                setTableDataArray(result)
                setLoading(false)
                // exportToAdvertisment(groupedDataId, result, 'advertiement')
                console.log('All promises resolved:', promiseInProgress);
            })
            .catch((error) => {
                // Handle the first rejected promise
                console.error('At least one promise rejected:', error);
            });
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
    const groupedArray = async (groupedDataId, data) => {
        // Create an array of promises
        const promises = groupedDataId.map(async (macId, index) => {
            const specificMacAddressData = data[macId];
            const tableRowPromise = Promise.resolve(
                specificMacAddressData.map((item) => [
                    item.sensorTime,
                    `${item.mac_address}\n${item.sensor_number ? item.sensor_number : ''}`,
                    `${item.battery}/${item.temperature}`,
                    flags(item.data)
                ])
            );
            return await trackPromise(tableRowPromise);
        });

        // Use Promise.all to wait for all promises to resolve or reject
        return await Promise.all(promises)
            .then((updatedTableDataArray) => {
                // Handle the resolved data array
                return updatedTableDataArray;
            })
            .catch((error) => {
                // Handle the first rejected promise
                console.error('At least one promise rejected:', error);
                throw error; // Re-throw the error to propagate it
            });
    }

    const _tableRowView = (item) => {
        setLoading(false)
        return (
            <View style={styles.container}>
                <Table borderStyle={{ borderWidth: 2, borderColor: 'grey', justifyContent: 'space-between', }}>
                    <Row data={tableColumn} style={styles.head} textStyle={styles.headText} />
                    <Rows data={item} textStyle={styles.text}
                        onPress={(rowData, rowID) => {
                            console.log(rowData)
                        }}
                    />
                </Table>
            </View>
        )
        setLoading(false)
    }
    const dataValue = (specificMacAddressData) => {
        const tableRow = []
        specificMacAddressData.map((item) => {
            tableRow.push([item.sensorTime, item.mac_address, item.sensor_number, `${item.battery}/${item.temperature}`])
        })
        // console.log("tableRow", tableRow)
        return tableRow
    }

    const TableContainer = (data) => {
        const macAddresses = Object.keys(data);
        console.log('macAddresses', macAddresses); // Output: ["C3:41:23:E0:46:26", "CD:A4:03:12:D6:FA", ...]
        macAddresses.map((macId) => {
            const specificMacAddressData = data[macId];
            // console.log(specificMacAddressData);
            const tableDataValues = {
            }
            const tableColumn = ['DateTime', 'Mac Id', 'Name', 'Battery/Temp']
            const tableRow = []
            specificMacAddressData.map((item) => {
                tableRow.push([item.sensorTime, item.mac_address, item.sensor_name, `${item.battery}/${item.temperature}`])
            })
            tableDataValues.tableHead = tableColumn
            tableDataValues.tableData = tableRow
            setDataList([{ specificMacAddressData }])

        })
        console.log("dataList", JSON.stringify(dataList))
    }

    const renderTable = ({ item }) => (
        <View>
            {_tableRowView(item)}
        </View>
    );

    const _onPress = () => {
        navigation.navigate('DataServiceHistory')
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

    const exportToAdvertisment = async (groupedDataId, worksheetsData, fileName) => {
        try {
            const workbook = new ExcelJS.Workbook();
            console.log(groupedDataId)
            groupedDataId.forEach((macId, sheetIndex) => {
                const worksheet = workbook.addWorksheet(`Sheet ${sheetIndex + 1}`);

                const tableColumn = ['DateTime', 'Mac Address', 'Sensor number', 'Battery', 'Temperature', 'flags']
                // Add headers
                worksheet.addRow(tableColumn);
                const specificMacAddressData = worksheetsData[macId];
                specificMacAddressData.map((item) => {
                    worksheet.addRow([item.sensorTime, item.mac_address, item.sensor_number, item.battery, item.temperature, flags(item.data)]);
                })
                // Add data
                // worksheetsData.forEach((row) => {
                //     console.log('row', row)
                //     console.log('Object.values(row)', Object.values(row))
                //     worksheet.addRow(Object.values(row));
                // });
            });

            // Save the workbook to a buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Convert buffer to base64-encoded string
            const base64String = buffer.toString('base64');

            // Save the base64-encoded string to a file
            RNFetchBlob.fs
                .writeFile(pathDoc + `/${fileName}.xls`, base64String, 'base64')
                .then(() => {
                    console.log(' advExcel file saved successfully.');
                })
                .catch((error) => {
                    console.error('Error saving Excel file:', error);
                });

        } catch (error) {
            console.log(error)
        }

    };

    // Example usage:
    const jsonData = [
        { Name: 'John', Age: 30, City: 'New York' },
        { Name: 'Alice', Age: 25, City: 'San Francisco' },
        // Add more data as needed
    ];

    const exportToExcel1 = async (worksheetsData, fileName) => {
        const workbook = new ExcelJS.Workbook();

        worksheetsData.forEach((worksheetData, sheetIndex) => {
            const worksheet = workbook.addWorksheet(`Sheet ${sheetIndex + 1}`);

            // Add headers
            console.log("worksheetData[0]", Object.keys(worksheetData[0]))
            worksheet.addRow(Object.keys(worksheetData[0]));
            // Add data
            worksheetData.forEach((row) => {
                console.log('Object.values(row)', Object.values(row))
                worksheet.addRow(Object.values(row));
            });
        });
        console.log('worksheetData after worksheet ', worksheet)
        // Save the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Convert buffer to base64-encoded string
        const base64String = buffer.toString('base64');

        // Save the base64-encoded string to a file
        RNFetchBlob.fs
            .writeFile(pathDoc + `/${fileName}.xls`, base64String, 'base64')
            .then(() => {
                console.log('Excel file saved successfully.');
            })
            .catch((error) => {
                console.error('Error saving Excel file:', error);
            });
    };

    // Example usage with multiple worksheets:
    const worksheetsData = [
        [
            { Name: 'John', Age: 30, City: 'New York' },
            { Name: 'Alice', Age: 25, City: 'San Francisco' },
            // Add more data for the first worksheet
        ],
        [
            { Product: 'Laptop', Price: 1000 },
            { Product: 'Phone', Price: 500 },
            // Add more data for the second worksheet
        ],
    ];


    const exportToExcel2 = async (jsonData, fileName) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');

            // Add headers
            const headerRow = worksheet.addRow(Object.keys(jsonData[0]));

            // Add data
            jsonData.forEach((row) => {
                const values = Object.values(row);
                worksheet.addRow(values);
            });

            // Save the workbook to a buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Convert buffer to base64-encoded string
            const base64String = buffer.toString('base64');
            // Save the buffer to a file
            RNFetchBlob.fs
                .writeFile(pathDoc + `/${fileName}.xls`, base64String, 'base64')
                .then((resp) => {
                    console.log('Excel file saved successfully.', resp);
                })
                .catch((error) => {
                    console.error('Error saving Excel file:', error);
                });
        } catch (error) {
            console.log(error)
        }

    };


    const exportToExcel = (jsonData, fileName) => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Add a worksheet using the provided JSON data
        const worksheet = XLSX.utils.json_to_sheet(jsonData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

        // Generate Excel file
        const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

        // Save the Excel file to device storage
        RNFetchBlob.fs
            .writeFile(pathDoc + `/${fileName}.xlsx`, excelFile, 'binary')
            .then(() => {
                console.log('Excel file saved successfully.');
            })
            .catch((error) => {
                console.error('Error saving Excel file:', error);
            });
    };

    const _onSharePress = async () => {
        try {
            exportToAdvertismentBySensorNumber(dataBySensorNumberSel, 'advertismentBySensorNumber')
        } catch (error) {
            console.log(error)
        }
    }


    const MyListItem = React.memo(({ item, index }) => {
        console.log('index', tableDataArray.length, index)
        if (tableDataArray.length == index + 1) {
            console.log('object equal false')
            setLoading(false)
        }
        return (
            <>
                <Table borderStyle={{ borderWidth: 0.5, borderColor: 'grey', justifyContent: 'space-between', }}>
                    <Row data={[
                        item.sensorTime,
                        `${item.mac_address}\n${item.sensor_number ? item.sensor_number : ''}`,
                        `${item.battery}/${item.temperature}`,
                        flags(item.data)
                    ]} textStyle={styles.text} />
                </Table>
            </>
        )
    });

    const refreshTable = async (sensorNumber, date) => {
        console.log('refreshTable', sensorNumber, date)
        setTableDataArray([])

        // setTimeout(() => {
        //     setLoading(false)
        // }, 3000);
        console.log('sensorNumber', sensorNumber)
        dispatch(getSensorByNumber({ key1: sensorNumber, key2: dataBySensorNumberSel, key3: date })).then((response) => {
            // console.log('response', response)
            if (response.payload) {
                setTableDataArray(response.payload)
                setLoading(true)
                // setLoading(false)
            }
        })
    }

    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={globalStyles.safeContainerStyle}>
            <HeaderTitleView navigation={navigation} title={'Advertisement'} onPress={_onPress} isShare={true} onSharePress={_onSharePress} />
            <View style={globalStyles.containerView} >
                <ScrollView >
                    <>
                        <View style={{ flex: 1 }}>
                            {/* <Text style={{
                                color: "#000", justifyContent: 'center', alignSelf: 'center'
                            }}>Please Wait untill data load.....</Text>
                            */}
                            {
                                loading ? (<>
                                    <ActivityIndicator size="large" color="#0000ff" />
                                </>) : (<>
                                </>)
                            }
                            <Text style={styles.buttonTextStyle}>Select sensor number</Text>
                            <View style={styles.SectionStyle}>
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
                                    buttonStyle={styles.dropdown1BtnStyle}
                                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                                    renderDropdownIcon={isOpened => {
                                        return <Material name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={18} />;
                                    }}
                                    dropdownIconPosition={'right'}
                                    dropdownStyle={styles.dropdown1DropdownStyle}
                                    rowStyle={styles.dropdown1RowStyle}
                                    rowTextStyle={styles.dropdown1RowTxtStyle}
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
                                    <Text style={{ marginTop: 10, marginStart: 5, fontSize: 16, fontFamily: '400', textAlign: 'center', color:'#000', }}>{date}</Text>
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
                        <Table borderStyle={{ borderWidth: 2, borderColor: 'grey', justifyContent: 'space-between', }}>
                            <Row data={tableColumn} style={[styles.head, { marginTop: 10, }]} textStyle={styles.headText} />
                        </Table>
                        <FlatList
                            data={tableDataArray}
                            renderItem={({ item, index }) => <MyListItem item={item} index={index} />}
                            keyExtractor={(item, index) => item.sensorTime + index}
                        />

                    </>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default DashboardLog

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, justifyContent: 'flex-start', backgroundColor: '#fff' },
    head: { height: 30, backgroundColor: 'lightgrey', justifyContent: 'space-between' },
    headText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: 'black', fontWeight: '600' },
    text: { margin: 6, fontSize: 8, fontWeight: 'bold', textAlign: 'center', color:'#000', },
    SectionStyle: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        marginLeft: 10,
        marginRight: 10,
    },
    buttonTextStyle: {
        color: '#000000',
        paddingVertical: 10,
        paddingHorizontal: 15, fontSize: 16,
        fontWeight: '500'
    },
    dropdown1BtnStyle: {
        width: '50%',
        height: 40,
        color:'#000',
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dadae8',
    },
    dropdown1BtnTxtStyle: { color: '#000', textAlign: 'left', fontSize: 14, },
    dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
    dropdown1RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#dadae8' },
    dropdown1RowTxtStyle: { color: '#444', textAlign: 'left', },
})


/* 

                            tableDataArray ? (
                                <>
                                    <Table borderStyle={{ borderWidth: 2, borderColor: 'grey', justifyContent: 'space-between', }}>
                                        <Row data={tableColumn} style={[styles.head, { marginTop: 10, }]} textStyle={styles.headText} />
                                    </Table>
                                    <FlatList
                                        data={tableDataArray}
                                        renderItem={({ item ,index }) => <MyListItem item={item} index={index} />}
                                        keyExtractor={(item, index) => item.sensorTime + index}
                                    />

                                     <FlatList
                                        horizontal
                                        data={tableDataArray}
                                        renderItem={renderTable}
                                        keyExtractor={(item) => item.key}
                                    />  
                                tableDataArray ? (<>
                                    <FlatList
                                        data={tableDataArray}
                                        renderItem={renderTable}
                                        keyExtractor={(item) => item.key}
                                    />
                                </>) : (<></>)
                            }  
                            </>

                            ) : (
                                <Loader loading={loading} />
                            )
                        }

                         <FlatList
                    data={groupedDataId}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item, index }) =>
                        <View style={styles.container}>
                            <Table borderStyle={{ borderWidth: 2, borderColor: 'grey', justifyContent: 'space-between' }}>
                                <Row data={tableColumn} style={styles.head} textStyle={styles.headText} />
                                <Rows data={dataValue(advertisementGrp[item])} textStyle={styles.text}
                                    onPress={(rowData, rowID) => {
                                        console.log(rowData)
                                    }}
                                />
                            </Table>
                        </View>
                    }
                />  



*/