import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { BleEventType, BleState } from './type';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

export default class NativeEventBluetoothEmitter {

    constructor() {
        this.peripheralId = '';
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
    addListener(eventType, listener, context) {
        return bleManagerEmitter.addListener(eventType, listener, context);
    }

    /** Convert 16, 32, 128-bit UUIDs to 128-bit uppercase UUIDs */
    fullUUID(uuid) {
        if (uuid.length === 4) {
            return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
        }
        if (uuid.length === 8) {
            return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
        }
        return uuid.toUpperCase();
    }

     /** Get the serviceUUID and characteristicUUID of Notify, Read, Write, WriteWithoutResponse */
     getUUID(peripheralInfo) {
        this.readServiceUUID = [];
        this.readCharacteristicUUID = [];
        this.writeWithResponseServiceUUID = [];
        this.writeWithResponseCharacteristicUUID = [];
        this.writeWithoutResponseServiceUUID = [];
        this.writeWithoutResponseCharacteristicUUID = [];
        this.nofityServiceUUID = [];
        this.nofityCharacteristicUUID = [];

        for (const item of peripheralInfo.characteristics) {

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
                item.properties.map(property => {
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
                        this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
                    }
                })
            }
                 
        }

        console.log('readServiceUUID', this.readServiceUUID);
        console.log('readCharacteristicUUID', this.readCharacteristicUUID);
        console.log('writeWithResponseServiceUUID', this.writeWithResponseServiceUUID);
        console.log('writeWithResponseCharacteristicUUID', this.writeWithResponseCharacteristicUUID);
        console.log('writeWithoutResponseServiceUUID', this.writeWithoutResponseServiceUUID);
        console.log('writeWithoutResponseCharacteristicUUID', this.writeWithoutResponseCharacteristicUUID);
        console.log('NotifyServiceID', this.nofityServiceUUID, this.readCharacteristicUUID);

    }

}