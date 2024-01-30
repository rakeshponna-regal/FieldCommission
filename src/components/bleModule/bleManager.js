// BleManager.js
import { NativeEventEmitter, NativeModules,PermissionsAndroid, Platform } from 'react-native';
import { discoverDevice, connectToDevice, disconnectDevice } from '../../store/bleSlice'; // Importing actions
import BleManager, { Peripheral, PeripheralInfo } from 'react-native-ble-manager';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

export const initializeBleManager = async (dispatch) => {
  // await BleManager.start({ showAlert: false, forceLegacy: true });
   enableBluetooth()
  console.log("Bluetooth Module initialized");
//   bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
//     console.log("BleManagerDiscoverPeripheral => ",peripheral)
//     dispatch(discoverDevice({ device: peripheral }));
//   });

//   bleManagerEmitter.addListener('BleManagerConnectPeripheral', (peripheral) => {
//     dispatch(connectToDevice({ device: peripheral }));
//   });

//   bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (peripheral) => {
//     dispatch(disconnectDevice());
//   });
};

export const enableBluetooth = () => {
  if (Platform.OS == "android") {
      BleManager.enableBluetooth()
          .then(() => {
              console.log('The bluetooh is already enabled or the user confirm');
              handleAndroidPermissions()
          })
          .catch(error => {
              console.log('The user refuse to enable bluetooth', error);
          });
  } else {
      BleManager.enableBluetooth()
          .then(() => {
              console.log('The bluetooh is already enabled or the user confirm');
              handleAndroidPermissions()
          })
          .catch(error => {
              start()
              console.log('The user refuse to enable bluetooth', error);
          });
  }

}

const handleAndroidPermissions = () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
          if (result) {
              start()
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
              start()
              console.debug(
                  '[handleAndroidPermissions] runtime permission Android <12 already OK',
              );
          } else {
              PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              ).then(requestResult => {
                  if (requestResult) {
                      start()
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
      start()
  }
};