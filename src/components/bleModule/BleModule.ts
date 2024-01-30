import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import BleManager, { Peripheral, PeripheralInfo } from 'react-native-ble-manager';
import { BleEventType, BleState } from './type';
import { byteToString } from './utils';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

export default class BleModule {
  /** paired bluetooth id */
  peripheralId: string;
  /** bluetooth on */
  bleState: BleState;

  readServiceUUID!: any[];
  readCharacteristicUUID!: any[];
  writeWithResponseServiceUUID!: any[];
  writeWithResponseCharacteristicUUID!: any[];
  writeWithoutResponseServiceUUID!: any[];
  writeWithoutResponseCharacteristicUUID!: any[];
  nofityServiceUUID!: any[];
  nofityCharacteristicUUID!: any[];

  constructor() {
    this.peripheralId = '';
    this.bleState = BleState.Off;
    this.initUUID();
  }

  initUUID() {
    this.readServiceUUID = [];
    this.readCharacteristicUUID = [];
    this.writeWithResponseServiceUUID = [];
    this.writeWithResponseCharacteristicUUID = [];
    this.writeWithoutResponseServiceUUID = [];
    this.writeWithoutResponseCharacteristicUUID = [];
    this.nofityServiceUUID = [];
    this.nofityCharacteristicUUID = [];
  }

  /** add listener */
  addListener(
    eventType: BleEventType,
    listener: (data: any) => void,
    context?: any,
  ) {
    return bleManagerEmitter.addListener(eventType, listener, context);
  }

  /** Initialize the bluetooth module */
  start() {
    BleManager.start({ showAlert: true ,forceLegacy:true })
      .then(() => {
        // Check Bluetooth status after successful initialization
        this.checkState();
        console.log('Init the module success');
      })
      .catch(error => {
        console.log('Init the module fail', error);
      });
  }

  /** Mandatory check of bluetooth state and trigger BleManagerDidUpdateState event */
  checkState() {
    BleManager.checkState();
  }

  /** Scan for available devices and end after 5 seconds */
  scan(): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.scan([], 30, true)
        .then(() => {
          console.log('Scan started');
          resolve();
        })
        .catch(error => {
          console.log('Scan started fail', error);
          reject(error);
        });
    });
  }

  /** stop scanning */
  stopScan(): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.stopScan()
        .then(() => {
          console.log('Scan stopped');
          resolve();
        })
        .catch(error => {
          console.log('Scan stopped fail', error);
          reject();
        });
    });
  }

  /** Return scanned bluetooth devices */
  getDiscoveredPeripherals(): Promise<Peripheral[]> {
    return new Promise((resolve, reject) => {
      BleManager.getDiscoveredPeripherals()
        .then(peripheralsArray => {
          console.log('Discovered peripherals: ', peripheralsArray);
          resolve(peripheralsArray);
        })
        .catch(error => {
          console.log('Discovered peripherals fail', error);
          reject(error);
        });
    });
  }

  /** Convert 16, 32, 128-bit UUIDs to 128-bit uppercase UUIDs */
  fullUUID(uuid: string) {
    if (uuid.length === 4) {
      return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    if (uuid.length === 8) {
      return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    return uuid.toUpperCase();
  }

  /** Get the serviceUUID and characteristicUUID of Notify, Read, Write, WriteWithoutResponse */
  getUUID(peripheralInfo: PeripheralInfo) {
    try {
      this.readServiceUUID = [];
      this.readCharacteristicUUID = [];
      this.writeWithResponseServiceUUID = [];
      this.writeWithResponseCharacteristicUUID = [];
      this.writeWithoutResponseServiceUUID = [];
      this.writeWithoutResponseCharacteristicUUID = [];
      this.nofityServiceUUID = [];
      this.nofityCharacteristicUUID = [];
      for (let item of peripheralInfo.characteristics!) {
        item.service = this.fullUUID(item.service);
        item.characteristic = this.fullUUID(item.characteristic);
        if (Platform.OS == 'android') {
          if (item.properties.Notify == 'Notify') {
            this.nofityServiceUUID.push(item.service);
            this.nofityCharacteristicUUID.push(item.characteristic);
          }
          if (item.properties.Read == 'Read') {
            this.readServiceUUID.push(item.service);
            this.readCharacteristicUUID.push(item.characteristic);
          }
          if (item.properties.Write == 'Write') {
            this.writeWithResponseServiceUUID.push(item.service);
            this.writeWithResponseCharacteristicUUID.push(item.characteristic);
          }
          if (item.properties.WriteWithoutResponse == 'WriteWithoutResponse') {
            this.writeWithoutResponseServiceUUID.push(item.service);
            this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
          }
        } else {
          // ios
          for (let property of item.properties as string[]) {
            if (property == 'Notify') {
              this.nofityServiceUUID.push(item.service);
              this.nofityCharacteristicUUID.push(item.characteristic);
            }
            if (property == 'Read') {
              this.readServiceUUID.push(item.service);
              this.readCharacteristicUUID.push(item.characteristic);
            }
            if (property == 'Write') {
              this.writeWithResponseServiceUUID.push(item.service);
              this.writeWithResponseCharacteristicUUID.push(item.characteristic);
            }
            if (property == 'WriteWithoutResponse') {
              this.writeWithoutResponseServiceUUID.push(item.service);
              this.writeWithoutResponseCharacteristicUUID.push(
                item.characteristic,
              );
            }
          }
        }
      }
      // console.log('readServiceUUID', this.readServiceUUID);
      // console.log('readCharacteristicUUID', this.readCharacteristicUUID);
      // console.log(
      //   'writeWithResponseServiceUUID',
      //   this.writeWithResponseServiceUUID,
      // );
      // console.log(
      //   'writeWithResponseCharacteristicUUID',
      //   this.writeWithResponseCharacteristicUUID,
      // );
      // console.log(
      //   'writeWithoutResponseServiceUUID',
      //   this.writeWithoutResponseServiceUUID,
      // );
      // console.log(
      //   'writeWithoutResponseCharacteristicUUID',
      //   this.writeWithoutResponseCharacteristicUUID,
      // );
      // console.log('nofityServiceUUID', this.nofityServiceUUID);
      // console.log('nofityCharacteristicUUID', this.nofityCharacteristicUUID);
    } catch (error) {
      console.log(error)
    }

  }

  /**
   * Try to connect to bluetooth. If you can't connect, you may need to scan for devices first.
   * In iOS, attempts to connect to Bluetooth devices don't time out, so you may need to explicitly set the timer if you don't want this to happen.
   */
  connect(id: string): Promise<PeripheralInfo> {
    return new Promise((resolve, reject) => {
      BleManager.connect(id)
        .then(() => {
          console.log('Connected success');
          // Get services and characteristics of connected bluetooth devices
          return BleManager.retrieveServices(id);
        })
        .then(peripheralInfo => {
          // console.log('Connected peripheralInfo', peripheralInfo);
          this.peripheralId = id;
          console.log("Connected peripheralId", this.peripheralId)
          if (Platform.OS == 'android') {
            this.getUUID(peripheralInfo);
          }
          resolve(peripheralInfo);
        })
        .catch(error => {
          console.log('Connected fail', error);
          reject(error);
        });
    });
  }

  connectBond(id: string,pin:string): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      BleManager.createBond(id,pin)
        .then(() => {
          console.log('createBond success');
          // Get services and characteristics of connected bluetooth devices
          return resolve(true);
        })
        .catch(error => {
          console.log('createBond fail', error);
          reject(error);
        });
    });
  }

  /** disconnect bluetooth */
  disconnect() {
    BleManager.disconnect(this.peripheralId)
      .then(() => {
        console.log('Disconnected');
      })
      .catch(error => {
        console.log('Disconnected fail', error);
      });
  }

  /** open notification */
  startNotification(index = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.startNotification(
        this.peripheralId,
        this.nofityServiceUUID[index],
        this.nofityCharacteristicUUID[index],
      )
        .then(() => {
          console.log('Notification started');
          resolve();
        })
        .catch(error => {
          console.log('Start notification fail', error);
          reject(error);
        });
    });
  }

  /** close notification*/
  stopNotification(index = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.stopNotification(
        this.peripheralId,
        this.nofityServiceUUID[index],
        this.nofityCharacteristicUUID[index],
      )
        .then(() => {
          console.log('Stop notification success!');
          resolve();
        })
        .catch(error => {
          console.log('Stop notification fail', error);
          reject(error);
        });
    });
  }

  /** write data to bluetooth */
  write(data: any, index = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.write(
        this.peripheralId,
        this.writeWithResponseServiceUUID[index],
        this.writeWithResponseCharacteristicUUID[index],
        data,
      )
        .then(() => {
          console.log('Write success', data.toString());
          resolve();
        })
        .catch(error => {
          console.log('Write failed', data);
          reject(error);
        });
    });
  }

  

  /** Write data to bluetooth, no response */
  writeWithoutResponse(data: any, index = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      BleManager.writeWithoutResponse(
        this.peripheralId,
        this.writeWithoutResponseServiceUUID[index],
        this.writeWithoutResponseCharacteristicUUID[index],
        data,
      )
        .then(() => {
          console.log('Write success', data);
          resolve();
        })
        .catch(error => {
          console.log('Write failed', data);
          reject(error);
        });
    });
  }

  /** Read the data of the specified characteristic */
  read(index = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      BleManager.read(
        this.peripheralId,
        this.readServiceUUID[index],
        this.readCharacteristicUUID[index],
      )
        .then(data => {
          const str = byteToString(data);
          console.log('Read', data, str);
          resolve(str);
        })
        .catch(error => {
          console.log('Read fail', error);
          reject(error);
        });
    });
  }

  

  /** Returns connected bluetooth devices */
  getConnectedPeripherals(): Promise<Peripheral[]> {
    return new Promise((resolve, reject) => {
      BleManager.getConnectedPeripherals([])
        .then(peripheralsArray => {
          console.log('Get connected peripherals', peripheralsArray);
          resolve(peripheralsArray);
        })
        .catch(error => {
          console.log('Get connected peripherals fail', error);
          reject(error);
        });
    });
  }

  /** Determine whether the specified device is connected*/
  isPeripheralConnected(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      BleManager.isPeripheralConnected(this.peripheralId, [])
        .then(isConnected => {
          console.log(
            isConnected
              ? 'Peripheral is connected'
              : 'Peripheral is NOT connected',
          );
          resolve(isConnected);
        })
        .catch(error => {
          console.log('Get peripheral is connected fail', error);
          reject(error);
        });
    });
  }

  /** (Android only) Get the bound device */
  getBondedPeripherals(): Promise<Peripheral[]> {
    return new Promise((resolve, reject) => {
      BleManager.getBondedPeripherals()
        .then(bondedPeripheralsArray => {
          console.log('Bonded peripherals', bondedPeripheralsArray);
          resolve(bondedPeripheralsArray);
        })
        .catch(error => {
          console.log('Bonded peripherals fail', error);
          reject(error);
        });
    });
  }

  /** (Android only) turn on bluetooth */
  enableBluetooth() {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('The bluetooh is already enabled or the user confirm');
      })
      .catch(error => {
        console.log('The user refuse to enable bluetooth', error);
      });
  }

  /** (Android only) Remove disconnected peripherals from the cache list. It is useful when the device is turned off as it will be rediscovered when turned on again */
  removePeripheral() {
    BleManager.removePeripheral(this.peripheralId)
      .then(() => {
        console.log('Remove peripheral success');
      })
      .catch(error => {
        console.log('Remove peripheral fail', error);
      });
  }


  /* Custom Read and write Commands */

  readBond(peripheralID:string): Promise<string> {
    console.log("this.peripheralId",this.peripheralId)
    console.log("this.peripheralId",peripheralID)
    return new Promise((resolve, reject) => {
      try {
        BleManager.read(
          this.peripheralId,
          '75c27600-8f97-20bc-a143-b354244886d4',
          '75c27602-8f97-20bc-a143-b354244886d4',
        )
          .then(data => {
            console.log('Read', data);
            if (data != null) {
              const str = byteToString(data);
              console.log('Read str', data, str);
              resolve(str);
            } else {
              resolve(data);
            }
          })
          .catch(error => {
            console.log('Read fail', error);
            reject(error);
          });
      } catch (error) {
        console.log(error)
      }
    });
  }

  writeData(peripheralID:string,data: any,writeWithResponseServiceUUID:string, writeWithResponseCharacteristicUUID: string): Promise<void> {
    console.log('Write callled', data.toString(),this.peripheralId);
    return new Promise((resolve, reject) => {
      BleManager.write(
        this.peripheralId,
        writeWithResponseServiceUUID,
        writeWithResponseCharacteristicUUID,
        data.toJSON().data,
      )
        .then(() => {
          console.log('Write success', data.toString());
          resolve();
        })
        .catch(error => {
          console.log('Write failed', data);
          reject(error);
        });
    });
  }

  readData(peripheralID:string,serviceUUID:string, characteristicUUID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        BleManager.read(
          this.peripheralId,
          serviceUUID,
          characteristicUUID,
        )
          .then(data => {
            console.log('Read', data);
            resolve(data);
            // if (data != null) {
            //   const str = byteToString(data);
            //   console.log('Read str', data, str);
            //   resolve(str);
            // } else {
            //   resolve(data);
            // }
          })
          .catch(error => {
            console.log('Read fail', error);
            reject(error);
          });
      } catch (error) {
        console.log(error)
      }
    });
  }


}


