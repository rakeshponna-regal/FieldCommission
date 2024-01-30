import { Buffer } from "buffer";

/** Add 0 in front of the string, the default is 2 digits */
export function addZero(str, bit = 2) {
    for (let i = str.length; i < bit; i++) {
        str = '0' + str;
    }
    return str;
}

export function byteArrayString(bytes) {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
}
export function byteArrayRawString(bytes) {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function byteString(byte) {
    return byte.toString(16).padStart(2, '0');
}

/** Convert string to byte array */
export function stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10ffff) {
            bytes.push(((c >> 18) & 0x07) | 0xf0);
            bytes.push(((c >> 12) & 0x3f) | 0x80);
            bytes.push(((c >> 6) & 0x3f) | 0x80);
            bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00ffff) {
            bytes.push(((c >> 12) & 0x0f) | 0xe0);
            bytes.push(((c >> 6) & 0x3f) | 0x80);
            bytes.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007ff) {
            bytes.push(((c >> 6) & 0x1f) | 0xc0);
            bytes.push((c & 0x3f) | 0x80);
        } else {
            bytes.push(c & 0xff);
        }
    }
    return bytes;
}

/** byte convert array to string */
export function byteToString(arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
}

export function utf8ArrayToString(aBytes) {
    var sView = "";
    // console.log("utf8ArrayToString", aBytes, byteArrayRawString(aBytes))
    for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];

        sView += String.fromCharCode(
            nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
                /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
                (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
                    (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                    : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
                        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                        : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
                            (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                            : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                                (nPart - 192 << 6) + aBytes[++nIdx] - 128
                                : /* nPart < 127 ? */ /* one byte */
                                nPart
        );
    }

    return sView;
}

export function convertToLittleEndianShortValue(buffer) {
    const littleEndianShort = buffer.readInt16LE();
    return littleEndianShort;
}

export function convertToLittleEndianShort(byteArray, from, to) {
    const buffer = Buffer.from(byteArray.slice(from, to));
    const littleEndianShort = buffer.readInt16LE();
    return littleEndianShort;
}
export function convertToLittleEndianInt(byteArray, from, to) {
    const buffer = Buffer.from(byteArray.slice(from, to));
    const littleEndianInt = buffer.readInt32LE();
    return littleEndianInt;
}
export function convertToLittleEndianFloat(byteArray, from, to) {
    const buffer = Buffer.from(byteArray.slice(from, to));
    const littleEndianInt = buffer.readFloatLE();
    return littleEndianInt;
}

export function convertToLittleEndian(byteArray) {
    const buffer = Buffer.from(byteArray);
    console.log("buffer", buffer)
    const littleEndianInt = buffer.readInt32LE();
    return littleEndianInt;
}

export function stringToByteArray(decimalNumber) {
    const hexString = decimalNumber.toString(16).toUpperCase();
    const paddedHexString = hexString.padStart(4, '0');
    const byteArray = [];
    for (let i = 0; i < paddedHexString.length; i += 2) {
        const byte = parseInt(paddedHexString.substr(i, 2), 16);
        byteArray.push(byte);
    }
    return byteArray
}

export function minutestoByteArray(minutes, seconds) {
    const uint8 = new Uint8Array([minutes, seconds]);
    const buf1 = Buffer.from(uint8);
    return buf1
}

export const convertBinaryValue = (hex) => {
    return hex.split('').map(hexDigit =>
        parseInt(hexDigit, 16).toString(2).padStart(4, '0')
    ).join('');
}

export const parseSensorFlags = (inputString) => {
    const charArray = inputString.split("");
    // console.log(charArray, charArray.length)
    //["0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0", "1", "1"]
    const dataSet = []
    let data = {

    }
    //Commissioned :
    //New Accelerometer data : true
    //New Low Freq Data :true
    //New Battery Data : true
    //New Temperature Data : true
    //Accelerometer Error : true
    //ADC fault : true
    //Device Config Settings : Default 
    //GPIO Error : true

    if (charArray.length == 16) {
        if (parseInt(charArray[15]) == 1)
            data.commission = true
        else
            data.commission = false
        if (parseInt(charArray[14]) == 1)
            data.accelerometer = true
        else
            data.accelerometer = false
        if (parseInt(charArray[13]) == 1)
            data.lowFeq = true
        else
            data.lowFeq = false
        if (parseInt(charArray[12]) == 1)
            data.bty = true
        else
            data.bty = false
        if (parseInt(charArray[11]) == 1)
            data.temp = true
        else
            data.temp = false
        if (parseInt(charArray[10]) == 1)
            data.accelError = true
        else
            data.accelError = false
        if (parseInt(charArray[9]) == 1)
            data.adcError = true
        else
            data.adcError = false
        if (parseInt(charArray[8]) == 1)
            data.DeviceSettings = true
        else
            data.DeviceSettings = false
        if (parseInt(charArray[7]) == 1)
            data.gpioError = true
        else
            data.gpioError = false
    }
    return data
}

/// 300 -> hex 
// hex - little indian 
// 