import React, { useEffect, useState } from 'react'
import { Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native'
import globalstyles from '.././assets/css/style'
import { HeaderTitleSettingsView, HeaderTitleView } from '../components/header'
import { useDispatch, useSelector } from 'react-redux';
import { caculatedDataSelector, caculatedSensorDataSelector, calXDataServiceSelector, calYDataServiceSelector, calZDataServiceSelector, lowFrequencyXSelector, lowFrequencyYSelector, lowFrequencyZSelector } from '../store/selector';
import { Table, Row, Rows } from 'react-native-table-component';
import Loader from '../components/Loader';
import { sleep } from '../components/bleModule/BleCommands';
import RNFetchBlob from 'react-native-fetch-blob';
import XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import Share from 'react-native-share';
import { DocumentDirectoryPath } from 'react-native-fs';
const DataServiceHistory = ({ navigation }) => {
    const dispatch = useDispatch();
    const caculatedDataSel = useSelector((state) => state.sensorData.caculatedDataService)
    const calXDataServiceSel = useSelector((state) => state.sensorData.sensorCalXDataService)
    const calYDataServiceSel = useSelector((state) => state.sensorData.sensorCalYDataService)
    const calZDataServiceSel = useSelector((state) => state.sensorData.sensorCalZDataService)
    const lowFrequencyXSel = useSelector((state) => state.sensorData.lowFrequencyXDataService)
    const lowFrequencyYSel = useSelector((state) => state.sensorData.lowFrequencyYDataService)
    const lowFrequencyZSel = useSelector((state) => state.sensorData.lowFrequencyZDataService)
    const settings = useSelector((state) => state.sensorData.settings)
    const pathDoc = `${DocumentDirectoryPath}`;
    const [loading, setLoading] = useState(false);
    console.log(settings)

    const _onPress = () => {
        navigation.navigate('SettingsInfo')
    }

    const _onSharePress = async () => {
        exportDataService('RawDataService')
    }

    const exportDataService = async (fileName) => {
        try {
            const workbook = new ExcelJS.Workbook();

            const settingsworksheet = workbook.addWorksheet(`Calculated Data`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const settingsTableColumn = ['Sensor Name', 'serial Number',
                'Mac Address', 'Date time', 'Manufacturer Name',
                'Measurement Interval', 'Sleep Time', 'Wake Time', 'Temerature',
                'Battery', 'Advertisement Interval',
                'Advertisement Duration', 'Accelerometer Range']
            settingsworksheet.addRow(settingsTableColumn);
            if (settings) {
                settingsworksheet.addRow([settings.reportedSensorType, settings.reportedSerialNumber, settings.reportedMacAddress, settings.reportedSensorTime, settings.reportedManufacturerName,
                settings.reportedMeasurementInterval, settings.reportedSleepTime, settings.reportedWakeTime, settings.reportedTemerature, settings.reportedBattery, settings.reportedAdvInterval,
                ]);
            }

            // Auto-fit all columns
            settingsworksheet.columns.forEach((column) => {
                console.log('worksheet.columns', column.header)
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });

            const worksheet = workbook.addWorksheet(`Calculated Data`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const calCulatedTableColumn = ['DateTime', 'serial Number',
                'X Crest Factor', 'Y Crest Factor', 'Z Crest Factor',
                'X Peak', 'Y Peak', 'Z Peak',
                'X Peak-to-Peak', 'Y Peak-to-Peak', 'Z Peak-to-Peak',
                'X RMS', 'Y RMS', 'Z RMS', 'X Axis Calculated Data', 'Y Axis Calculated Data', 'Z Axis Calculated Data']
            worksheet.addRow(calCulatedTableColumn);

            caculatedDataSel.map((item) => {
                worksheet.addRow([item.gwTime, item.serialNumber, item.crestFactorHoriz, item.crestFactorVert, item.crestFactorAxial,
                item.peakHoriz, item.peakVert, item.peakAxial, item.peakToPeakHoriz, item.peakToPeakVert, item.peakToPeakAxial,
                item.rmsHoriz, item.rmsVert, item.rmsAxial, item.xPackets, item.yPackets, item.zPackets
                ]);
            })
            // Auto-fit all columns
            worksheet.columns.forEach((column) => {
                console.log('worksheet.columns', column.header)
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });
            // x Axis
            const xworksheet = workbook.addWorksheet(`X Axis`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const xTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            xworksheet.addRow(xTableColumn);

            calXDataServiceSel.map((item) => {
                xworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            // Auto-fit all columns
            xworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });
            // Y Axis
            const yworksheet = workbook.addWorksheet(`Y Axis`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const yTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            yworksheet.addRow(yTableColumn);

            calYDataServiceSel.map((item) => {
                yworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            // Auto-fit all columns
            yworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });
            // Z Axis

            const zworksheet = workbook.addWorksheet(`Z Axis`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const zTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            zworksheet.addRow(zTableColumn);

            calZDataServiceSel.map((item) => {
                zworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            zworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });

            // X Low Frequency

            const xLFworksheet = workbook.addWorksheet(`X Low Frequency`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const xLFTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            xLFworksheet.addRow(xLFTableColumn);

            lowFrequencyXSel.map((item) => {
                xLFworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            // Auto-fit all columns
            xLFworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });

            // Y Low Frequency
            const yLFworksheet = workbook.addWorksheet(`Y Low Frequency`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const yLFTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            yLFworksheet.addRow(yLFTableColumn);

            lowFrequencyYSel.map((item) => {
                yLFworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            // Auto-fit all columns
            yLFworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
            });

            // Z Low Frequency
            const zLFworksheet = workbook.addWorksheet(`Z Low Frequency`, {
                state: 'frozen',
                xSplit: 0,
                ySplit: 1, // Set to 1 to freeze the first row
            });
            const zLFTableColumn = ['DateTime', 'serial Number', 'Hex Data',
                'Packet length', 'Packet Count', 'Data Packets'
            ]
            zLFworksheet.addRow(zLFTableColumn);

            lowFrequencyZSel.map((item) => {
                zLFworksheet.addRow([item.gwTime, item.serialNumber, item.type, item.len, item.pkc, item.pk
                ]);
            })
            // Auto-fit all columns
            zLFworksheet.columns.forEach((column) => {
                // column.width = column.header.length < 12 ? 12 : column.header.length;
                column.alignment = { horizontal: 'center' };
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
                                    message: 'Check Raw data file!',
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

    const _renderItem = (data) => {
        let item = data.item
        return (
            <View style={[{ flex: 1, flexDirection: 'column', margin: 5 }]}>
                <View style={[globalstyles.cardContainer, { flex: 1, flexDirection: 'column' }]}>
                    <Text style={globalstyles.infoText} > Time :  {item.gwTime} </Text>
                    <Text style={globalstyles.infoText} > Packet count :  {item.pkc} </Text>
                    <Text style={globalstyles.infoText} > Packet length :   {item.len} </Text>
                    <Text style={globalstyles.infoText} > Packets :  {item.pk.toString()} </Text>
                </View>
            </View>         
        )
    }
    const _renderItemCalculated = (data) => {
        let item = data.item
        return (
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
        )
    }
    return (
        <SafeAreaView forceInset={{ top: 'always' }} style={[globalstyles.safeContainerStyle, { marginBottom: 10 }]}>
            <View style={globalstyles.containerView} >
                <HeaderTitleSettingsView navigation={navigation} title={'DataService'} onPress={_onPress} isShare={true} onSharePress={_onSharePress} />
                <Loader loading={loading} />
                <ScrollView >
                    <View style={globalstyles.containerView}>
                        <Text style={globalstyles.infoTitleText} >Data Service  </Text>
                        <FlatList
                            horizontal
                            data={caculatedDataSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItemCalculated}
                        >
                        </FlatList>

                        <Text style={globalstyles.infoTitleText} >Calculated Packets  </Text>
                        <Text style={globalstyles.infoText} >    Calculated X Axis </Text>
                        <FlatList
                            horizontal
                            data={calXDataServiceSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}
                        >
                        </FlatList>
                        <Text style={globalstyles.infoText} >    Calculated Y Axis </Text>
                        <FlatList
                            horizontal
                            data={calYDataServiceSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}
                        >
                        </FlatList>
                        <Text style={globalstyles.infoText} >    Calculated Z Axis </Text>
                        <FlatList
                            horizontal
                            data={calZDataServiceSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}
                        >
                        </FlatList>

                        <Text style={globalstyles.infoTitleText} >Low frequency  </Text>
                        <Text style={globalstyles.infoText} >    Low frequency X Axis </Text>
                        <FlatList
                            horizontal
                            data={lowFrequencyXSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}

                        >
                        </FlatList>

                        <Text style={globalstyles.infoText} >    Low frequency Y Axis </Text>
                        <FlatList
                            horizontal
                            data={lowFrequencyYSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}
                        >
                        </FlatList>
                        <Text style={globalstyles.infoText} >    Low frequency Z Axis </Text>
                        <FlatList
                            horizontal
                            data={lowFrequencyZSel}
                            keyExtractor={(item, index) => item.gwTime + index}
                            renderItem={_renderItem}
                        >
                        </FlatList>
                    </View>
                </ScrollView>
            </View >
        </SafeAreaView >
    )
}

export default DataServiceHistory

const styles = StyleSheet.create({
    container: { justifyContent: 'flex-start', backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: 'darkblue', justifyContent: 'space-between' },
    headText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: 'white' },
    text: { margin: 6, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
})
