/**
 * Note: The code under this document is the code for the Bluetooth protocol
 * Not applicable to all situations, here is the example code of my original project 对控 Bluetooth
 *
 * The function of the tool to handle the Bluetooth protocol is as follows.
 * Return data：FEFD048D010203FCFB(16 progress)
 */
import {Peripheral} from 'react-native-ble-manager';
import { addZero } from './utils';

// Definition of bluetooth protocol
const BLE_HEAD = 'FEFD';
// Definition of Bluetooth protocol
const BLE_TRAIL = 'FCFB';
/** Maximum delay in receiving data */
const DELAY_TIME = 300;

export default class BleProtocol {
  /** Receiving state of receiving package, receiving state of complete data package */
  trailStatus: boolean;
  /** Receive Bluetooth data cache */
  receiveData: string[];
  /** Delayed receiving data */
  receivedDelayTimer?: number;

  constructor() {
    this.trailStatus = true;
    this.receiveData = [];
  }

  /** Bluetooth returned data */
  parseData(data: string) {
    // Some bluetooth devices ios receive 16bit，android receive 16bit，here the unit is converted to 16bytes
    this.receiveData.push(data.toUpperCase());

    // Convert array to string
    let packet = this.receiveData.join('');

    //  command
    let command;
    //  data length
    let packetLen;

    // header received
    if (this.isHead(packet)) {
      this.trailStatus = false;
      packetLen = this.getPacketByteLen(packet);
    }

    // trail received
    if (this.isTrail(packet)) {
      // Check data length: packet data length = actual received packet length
      if (packetLen === this.getDataByteLen(packet)) {
        // end of packet received
        this.trailStatus = true;
        command = this.getResponseCommand(packet);
        // After a packet is received, clear the received Bluetooth data cache
        this.receiveData = [];
      }
    }

    this.receivedDelayTimer && clearTimeout(this.receivedDelayTimer);
    // After receiving the packet header, if the end of the packet has not been received within 300ms, the incomplete packet data will be discarded，
    // Generally, 100ms is enough, but in some cases it may be greater than 100ms. To ensure that you are ready to receive, set 300ms here
    this.receivedDelayTimer = setTimeout(() => {
      if (!this.trailStatus) {
        this.receiveData = [];
      }
    }, DELAY_TIME);

    // A data packet is not processed until it is received
    if (!this.trailStatus) return;
    this.trailStatus = false;

    // Perform corresponding operations according to specific package commands
    if (command === '8D') {
      console.log('包命令: ', command);
    }
  }

  /** Determine whether the returned data contains a complete data header */
  isHead(str: string) {
    return str.substring(0, 4) == BLE_HEAD;
  }

  /** Determine whether the returned data contains a complete data packet end */
  isTrail(str: string) {
    const len = str.length;
    return str.substring(len - 4, len) == BLE_TRAIL;
  }

  /** Get package commands that return data*/
  getResponseCommand(str: string) {
    return str.substring(6, 8);
  }

  /** Returns the packet data length of a packet */
  getPacketByteLen(str: string) {
    let hexLen = str.substring(4, 6);
    return parseInt(hexLen, 16);
  }

  /**
   * Data actual Byte length
   * 2 hexadecimal strings represent 1 Byte
   */
  getDataByteLen(str: string) {
    return str.substring(6, str.length - 4).length / 2;
  }

  /**
   * Add Bluetooth protocol format, packet header, data length, packet tail
   * @param string    0A
   * @returns string  FEFD010AFCFB
   */
  addProtocol(data: string) {
    return BLE_HEAD + this.getHexByteLength(data) + data + BLE_TRAIL;
  }

  /** Calculate the length of the hexadecimal data, every two bits is 1 length, return the length in hexadecimal format */
  getHexByteLength(str: string) {
    let length = str.length / 2;
    let hexLength = addZero(length.toString(16));
    return hexLength;
  }

  /** The ios system obtains the Bluetooth Mac address from the Bluetooth broadcast information */
  getMacFromAdvertising(data: Peripheral) {
    let manufacturerData = data.advertising?.manufacturerData?.data;
    // console.log("manufacturerData",manufacturerData)
    // When it is empty, it means that the Bluetooth broadcast information does not include the Mac address
    if (!manufacturerData) {
      return;
    }

    return this.swapEndianWithColon(manufacturerData);
  }

  /**
   * ios The Mac address obtained from the broadcast is exchanged in big and small endian formats, and a colon is added
   * @param string         010000CAEA80
   * @returns string       80:EA:CA:00:00:01
   */
  swapEndianWithColon(str: string) {
    let format = '';
    let len = str.length;
    for (let j = 2; j <= len; j = j + 2) {
      format += str.substring(len - j, len - (j - 2));
      if (j != len) {
        format += ':';
      }
    }
    return format.toUpperCase();
  }
}