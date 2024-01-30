import { createAsyncThunk } from "@reduxjs/toolkit";
import { startScanning, stopScanning } from "../store/bleSlice";
import BleManager from 'react-native-ble-manager';
import { trackPromise } from "react-promise-tracker";
import moment from 'moment'
import { useMemo } from "react";

export const listenForBleEvents = createAsyncThunk(
  'ble/listenForBleEvents',
  async (_, { dispatch }) => {
    try {
      // Set up event listeners for BLE events
      const didUpdateStateListener = bleManagerEmitter.addListener(
        'BleManagerDidUpdateState',
        (peripheral) => {
          // Dispatch actions based on discovered peripherals
          dispatch(didUpdatePeripheral({ peripheral }));
        }
      );

      // Set up event listeners for BLE events
      const stopScanListener = bleManagerEmitter.addListener(
        'BleManagerStopScan',
        (peripheral) => {
          // Dispatch actions based on discovered peripherals
          dispatch(stopScanPeripheral({ peripheral }));
        }
      );

      // Set up event listeners for BLE events
      const discoverPeripheralListener = bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        (peripheral) => {
          console.log("BleManagerDiscoverPeripheral", peripheral)
          // Dispatch actions based on discovered peripherals
          dispatch(discoverPeripheral({ peripheral }));
        }
      );

      const connectPeripheralListener = bleManagerEmitter.addListener(
        'BleManagerConnectPeripheral',
        (peripheral) => {
          // Dispatch actions based on connected peripherals
          dispatch(connectPeripheral({ peripheral }));
        }
      );

      // You can add more event listeners as needed

      // Cleanup function to remove event listeners when the thunk is completed
      return () => {
        didUpdateStateListener.remove();
        stopScanListener.remove();
        discoverPeripheralListener.remove();
        connectPeripheralListener.remove();
        // Remove other event listeners if any
      };
    } catch (error) {
      // Handle errors or throw them to be caught by the rejectWithValue handler
      throw new Error(error.toString());
    }
  }
);


export const scanBleDevices = createAsyncThunk(
  'ble/scanBleDevices',
  async (_, thunkAPI) => {
    console.log("scanBleDevices")
    try {
      BleManager.scan([], 0, true)
        .then(() => {
          console.log('Scan started');
          thunkAPI.dispatch(startScanning);
        })
        .catch(error => {
          console.log('Scan started fail', error);
          throw new Error(error.toString());
        });
    } catch (error) {
      console.log("scanBleDevices", error)
      throw new Error(error.toString());
    }
  }
);
export const stopBleDevices = createAsyncThunk(
  'ble/stopBleDevices',
  async (_, thunkAPI) => {
    try {
      BleManager.stopScan()
        .then(() => {
          console.log('Scan Stopped');
          thunkAPI.dispatch(stopScanning);
        })
        .catch(error => {
          console.log('Scan Stopped fail', error);
          throw new Error(error.toString());
        });
    } catch (error) {
      throw new Error(error.toString());
    }
  }
);

export const getSensorByNumber = createAsyncThunk(
  'adv/sensorNumber',
  async (data, thunkAPI) => {
    try {
      // console.log('sensorNumber',data.key1,data.key2)
      let filterData = await data.key2[data.key1]
      let result = filterData.filter((item) => {
        // Convert item's datetime to date string
        let itemDate = moment(item.sensorTime, 'MM-DD-YYYY HH:mm:ss').format('MM-DD-YYYY');
        // Compare with the target date
        // console.log('itemDate',itemDate,data.key3)
        return itemDate === data.key3 && item.sensor_number === data.key1;
      });

      // const result = useMemo(() => {
      //   return filterData.filter((item) => {
      //     let itemDate = moment(item.sensorTime, 'MM-DD-YYYY HH:mm:ss').format('MM-DD-YYYY');
      //     return itemDate === data.key3 && item.sensor_number === data.key1;
      //   });
      // }, [filterData, data.key1, data.key3]);
      // console.log('result',result)
      return result;
     
    } catch (error) {
      console.log(error)
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getAdvertismentHistroy = createAsyncThunk(
  'adv/histroy',
  async (advertisementGrp, thunkAPI) => {
    try {
      const result = await fetchDataa(advertisementGrp);
     return result;
      // return await thunkAPI.fulfillWithValue(parseDataBySerialNumber( advertisementGrp));
      // trackPromise(parseDataBySerialNumber( advertisementGrp))
      // .then((result) => {
      //   console.log('All promises resolved:');
      //   return thunkAPI.fulfillWithValue(result);
      // })
      // .catch((error) => {
      //     // Handle the first rejected promise
      //     console.error('At least one promise rejected:', error);
      // });
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

const fetchDataa = async (data) => {
  try {
    let groupedDataId = Object.keys(data);
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

    const updatedTableDataArray = await Promise.all(promises);
    return updatedTableDataArray;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};


 
const fetchData = async () => {
  // Use trackPromise to track the overall promise
  trackPromise(parseDataBySerialNumber(groupedDataId, advertisementGrp))
      .then((result) => {
        return thunkAPI.fulfillWithValue(result);
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
const parseDataBySerialNumber = async ( data) => {
  // Create an array of promises
  let groupedDataId = Object.keys(data)
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
          console.log('updatedTableDataArray',updatedTableDataArray)
          return updatedTableDataArray;
      })
      .catch((error) => {
          // Handle the first rejected promise
          console.error('At least one promise rejected:', error);
          throw error; // Re-throw the error to propagate it
      });
}

const groupedArray = (data) => {
  let groupedDataId = Object.keys(data)

  const updatedTableDataArray = groupedDataId.map((macId, index) => {
    const specificMacAddressData = data[macId];
    const tableRow = specificMacAddressData.map((item) => [
      item.sensorTime,
      `${item.mac_address}\n${item.sensor_number ? item.sensor_number : ''}`,
      `${item.battery}/${item.temperature}`,
      flags(item.data)
    ]);
    const keyIndex = `key${index}`;
    return tableRow;
  });
  return updatedTableDataArray;
};


