import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listenForBleEvents ,scanBleDevices,stopBleDevices} from '../services/bleServices';
import BleManager from 'react-native-ble-manager';

const initialState = {
    scanning: false,
    devices: [],
    discoveredPeripherals: [],
    connectedPeripherals: [],
    didUpdatePeripheral: [],
    connectedDevice: null,
};

export const bleSlice = createSlice({
    name: 'ble',
    initialState,
    reducers: {
        discoverPeripheral: (state, action) => {
            state.discoveredPeripherals.push(action.payload.peripheral);
        },
        connectPeripheral: (state, action) => {
            state.connectedPeripherals.push(action.payload.peripheral);
        },
        didUpdatePeripheral: (state, action) => {
            state.didUpdatePeripheral.push(action.payload.peripheral);
        },
        startScanning: (state) => {
            state.scanning = true;
        },
        stopScanning: (state) => {
            state.scanning = false;
        },
        discoverDevice: (state, action) => {
            const { device } = action.payload;
            state.devices.push(device);
        },
        connectToDevice: (state, action) => {
            const { device } = action.payload;
            state.connectedDevice = device;
        },
        disconnectDevice: (state) => {
            state.connectedDevice = null;
        },
        startDeviceScan(state, action) {
            BleManager.scan([], 0, true);
        },
        stopDeviceScan(state, action) {
            BleManager.stopScan();
        },
    },
});

export const { startScanning, stopScanning, discoverDevice, connectToDevice, disconnectDevice,
    discoverPeripheral,connectPeripheral,didUpdatePeripheral,stopScanPeripheral } =
    bleSlice.actions;

export default bleSlice.reducer;

export  { listenForBleEvents,scanBleDevices,stopBleDevices }

