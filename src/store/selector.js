import { createSelector } from "@reduxjs/toolkit";

const advatisementPacktsSelector = (state) => state.sensorData.advatisementPackts;
const scanAdvatisementPacktsSelector = (state) => state.sensorData.scanAdvatisementPackts;
const settingsSelector = (state) => state.sensorData.settings;
const statusInformationSelector = (state) => state.sensorData.statusInformation;
const caculatedDataServiceSelector = (state) => state.sensorData.caculatedDataService;
// const caculatedSensorDataServiceSelector = (state) => state.sensorData.caculatedSensorDataService;
const sensorCalXDataServiceSelector = (state) => state.sensorData.sensorCalXDataService;
const sensorCalYDataServiceSelector = (state) => state.sensorData.sensorCalYDataService;
const sensorCalZDataServiceSelector = (state) => state.sensorData.sensorCalZDataService;
const lowFrequencyXDataServiceSelector = (state) => state.sensorData.lowFrequencyXDataService;
const lowFrequencyYDataServiceSelector = (state) => state.sensorData.lowFrequencyYDataService;
const lowFrequencyZDataServiceSelector = (state) => state.sensorData.lowFrequencyZDataService;

export const settingsInfoSelector = createSelector([settingsSelector], (data) => data);


export const advatisementDataSelector = createSelector([advatisementPacktsSelector], (data) => data);

export const sacnnedAdvatisementDataSelector = createSelector([scanAdvatisementPacktsSelector], (data) => data);

// Selector function to group data by date
const groupDataByMacId = (data) => {
    return data.reduce((groupedData, item) => {
        const mac_address = item.mac_address;
        if (!groupedData[mac_address]) {
            groupedData[mac_address] = [];
        }
        groupedData[mac_address].push(item);
        return groupedData;
    }, {});
};

// Selector function to group data by date
const groupDataBySensorNumber = (data) => {
    return data.reduce((groupedData, item) => {
        const sensor_number = item.sensor_number;
        if (!groupedData[sensor_number]) {
            groupedData[sensor_number] = [];
        }
        groupedData[sensor_number].push(item);
        return groupedData;
    }, {});
};

const groupDataByMacIds = (data) => {
    return Object.keys(data.reduce((groupedData, item) => {
        const mac_address = item.mac_address;
        if (!groupedData[mac_address]) {
            groupedData[mac_address] = [];
        }
        groupedData[mac_address].push(item);
        return groupedData;
    }, {}));
};

// Create a reselect selector
export const groupedDataSelector = createSelector(
    [advatisementPacktsSelector],
    (data) => groupDataByMacId(data)
);

// Create a reselect selector
export const dataBySensorNumberSelector = createSelector(
    [advatisementPacktsSelector],
    (data) => groupDataBySensorNumber(data)
);

export const groupedDataIdSelector = createSelector(
    [advatisementPacktsSelector],
    (data) => groupDataByMacIds(data)
);
export const caculatedDataSelector = createSelector([caculatedDataServiceSelector], (data) => data);

export const calXDataServiceSelector = createSelector([sensorCalXDataServiceSelector], (data) => data);
export const calYDataServiceSelector = createSelector([sensorCalYDataServiceSelector], (data) => data);
export const calZDataServiceSelector = createSelector([sensorCalZDataServiceSelector], (data) => data);

export const lowFrequencyXSelector = createSelector([lowFrequencyXDataServiceSelector], (data) => data);
export const lowFrequencyYSelector = createSelector([lowFrequencyYDataServiceSelector], (data) => data);
export const lowFrequencyZSelector = createSelector([lowFrequencyZDataServiceSelector], (data) => data);
