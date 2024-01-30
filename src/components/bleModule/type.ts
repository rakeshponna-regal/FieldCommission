/** react-native-ble-manager event */
export enum BleEventType {
    /** scan end monitor */
    BleManagerStopScan = 'BleManagerStopScan',
    /** Scan to a new device */
    BleManagerDiscoverPeripheral = 'BleManagerDiscoverPeripheral',
    /** bluetooth state change */
    BleManagerDidUpdateState = 'BleManagerDidUpdateState',
    /** new data received */
    BleManagerDidUpdateValueForCharacteristic = 'BleManagerDidUpdateValueForCharacteristic',
    /** Bluetooth device connected */
    BleManagerConnectPeripheral = 'BleManagerConnectPeripheral',
    /** Bluetooth device disconnected */
    BleManagerDisconnectPeripheral = 'BleManagerDisconnectPeripheral',
    /** [iOS only] exist centralManager:WillRestoreState:Fired when called (the app is restarted in the background to handle bluetooth events) */
    BleManagerCentralManagerWillRestoreState = 'BleManagerCentralManagerWillRestoreState',
    /** [iOS only] The peripheral received a request to start or stop providing notifications for the specified characteristic value */
    BleManagerDidUpdateNotificationStateFor = 'BleManagerDidUpdateNotificationStateFor',
  }
  
  export enum BleState {
    Unknown = 'unknown', // [iOS only]
    Resetting = 'resetting', // [iOS only]
    Unsupported = 'unsupported',
    Unauthorized = 'unauthorized', // [iOS only]
    On = 'on',
    Off = 'off',
    TurningOn = 'turning_on', // [android only]
    TurningOff = 'turning_off', // [android only]
  }