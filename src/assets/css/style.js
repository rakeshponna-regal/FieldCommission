'use strict';
import {StyleSheet, Dimensions} from 'react-native';

module.exports = StyleSheet.create({
  safeContainerStyle: {
    backgroundColor: '#ededed',
    flex: 1,
    marginBottom:50,
    justifyContent: "flex-start",
  },
  containerView: {
    marginEnd: 5,
    width: "100%",
    height: '100%',
    backgroundColor: '#ffffff',
    color: "white"
  },
  text: {
    textAlign: 'center',
    color: 'yellow',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },

  helpText: {
    textAlign: 'justify',
    letterSpacing: 1,
  },
  activationRow: {
    flexDirection: 'row',
  },
  column30: {
    width: '30%',
    backgroundColor: 'red',
  },
  column70: {
    width: '30%',
    flex: 1,
  },
  column100: {
    width: '100%',
    flex: 1,
  },
  text: {
    padding: 10,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    alignItems: 'center',
  },
  rowContainer: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    marginBottom: 0,
  },

  boxContainer: {
    flexDirection: 'row',
    padding: 12,
    height: Dimensions.get('window').height,
    flexWrap: 'wrap',
    paddingTop: 20,
  },
  label: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    textTransform: 'uppercase',
    paddingTop: 4,
    width: '100%',
    letterSpacing: 0.5,
    alignItems: 'center',
  },
  iconWidth: {width: '110%', height: '100%'},
  iconContainer: {
    padding: 10,
    width: '33.3%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1.25,
  },
  imageContainerDark: {
    borderColor: 'rgba(0,0,0,.5)',
  },
  imageContainerLight: {
    borderColor: 'white',
  },

  inputfieldContainer: {width: '73%', paddingRight: 5},
  inputField: {paddingVertical: 4, flex: 1},

  containerBox: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 8,
    padding: 8,
  },

  productcontainerBox: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    // paddingTop: 3,
    textAlignVertical: 'center',
    letterSpacing: 4,
  },
  closeiconCircle: {
    width: 28,
    height: 28,
    left: 6,
    top: 6,
    backgroundColor: 'white',
    color: 'blue',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0273CC',
    padding: 4,
  },

  pclabelContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderRadius: 6,
  },
  smpclabelContainer: {
    flexDirection: 'row',
    padding: 0,
    paddingVertical: 12,
    borderRadius: 6,
  },
  pcLabel: {
    textTransform: 'uppercase',
    //    color: '#333',
    letterSpacing: 1,
    fontWeight: '500',
  },
  buttonLabel: {
    color: 'black',
    textTransform: 'uppercase',
    fontSize: 16,
    letterSpacing: 1.5,
  },
  icon: {
    position: 'absolute',
    right: 10,
  },

  barcodeIcon: {position: 'absolute', right: 4},
  faIcon: {position: 'absolute', right: 3},
  scanContainer: {
    flexDirection: 'column',
    width: '100%',
    flex: 1,
  },
  LayoutPadding: {padding: 12},
  divider90: {
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 6,
    opacity: 0.2,
  },
  Container: {flexDirection: 'column', width: '100%', flex: 1},

  detailsContainer: {
    //backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 5,
  },
  row: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  Listhead: {width: '37%', letterSpacing: 0.6},
  ListValue: {width: '63%'},
  padbottom10: {padbottom: 10},
  width81: {width: '81%', paddingRight: 5},
  flex9: {flex: 0.9, flexDirection: 'row'},
  flex8: {flex: 0.8, flexDirection: 'row'},
  flex7: {flex: 0.7, flexDirection: 'row'},
  flex6: {flex: 0.6, flexDirection: 'row'},
  flex5: {flex: 0.5, flexDirection: 'row'},
  flex4: {flex: 0.4, flexDirection: 'row'},
  flex3: {flex: 0.3, flexDirection: 'row'},
  flex2: {flex: 0.2, flexDirection: 'row'},
  flex1: {flex: 0.1, flexDirection: 'row'},

  footerContainer: {paddingVertical: 20},

  bodyContainer: {
    paddingBottom: 10,
    height: Dimensions.get('window').height - 300,
  },
  bodyContainer1: {
    
    height: Dimensions.get('window').height - 200,
  },
  bodyContainer2: {
    height: Dimensions.get('window').height - 300,
  },
  pad10: {paddingVertical: 10},
  screenLayout: {padding: 16, width: '100%'},
  buttonMargin20: {marginTop: 10},
  customStyle: {backgroundColor: 'red'},
  messageText: {color: '#333', textAlign: 'justify', paddingBottom: 10},
  alignCenter: {textAlign: 'center'},
  rdLabelcontainer: {
    width: '100%',
    flex: 1,
    paddingBottom: 15,
    textAlign: 'center',
  },
  italic: {fontStyle: 'italic'},
  paddVertical: {paddingVertical: 10},
  buttonSpace: {paddingTop: 5},
  //pad8: {paddingHorizontal: 8},
  smContainerBox: {
    // marginTop: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  labelAlignment: {paddingTop: 4, textAlign: 'center'},
  fontBold: {fontWeight: 'bold', marginLeft: 10},

  paddProdbin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  binProuctcontainer: {
    height: Dimensions.get('window').height - 300,
  },
  binHeadercontainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 8,
  },
  lotDivider: {
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 3,
    opacity: 0.2,
  },
  pclabelbinContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },

  pad6: {padding: 6},
  width35: {width: 35},
  fdRow: {flexDirection: 'row'},
  ml9: {marginLeft: -5},

  select: {
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 4,
  },

  flexrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layoutContainer: {
    paddingTop: 15,
  },
  productWrapper: {
    height: Dimensions.get('window').height - 360,
  },
  labelInputContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
  },
  setDefaultBinContainer: {
    marginHorizontal: 6,
    marginBottom: 0,
    paddingBottom: 2,
    paddingHorizontal: 8,
    borderColor: '#999',
    borderRadius: 6,
  },
  cardContainer: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginBottom: 8,
  },
  customModal: {
    width: '90%',
    padding: 0,
  },
  modalHeader: {
    paddingVertical: 5,
    backgroundColor: '#3366FF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  modalBody: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  ModalcloseBtn: {
    width: 35,
    height: 35,
    backgroundColor: '#fff',
    fontWeight: '700',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  modalButton: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  // spacing Css

  ml5: {marginRight: 5},

  //padding Vertical Spacing
  padVertical2: {paddingVertical: 2},
  padVertical3: {paddingVertical: 3},
  padVertical4: {paddingVertical: 4},
  padVertical5: {paddingVertical: 5},
  padVertical6: {paddingVertical: 6},
  padVertical8: {paddingVertical: 8},
  padVertical10: {paddingVertical: 10},
  padVertical12: {paddingVertical: 12},
  padVertical15: {paddingVertical: 15},
  padVertical20: {paddingVertical: 20},
  padVertical25: {paddingVertical: 25},
  padVertical30: {paddingVertical: 30},
  padVertical35: {paddingVertical: 35},

  //padding Horizontal Spacing
  padHorizontal3: {paddingHorizontal: 3},
  padHorizontal4: {paddingHorizontal: 4},
  padHorizontal5: {paddingHorizontal: 5},
  padHorizontal6: {paddingHorizontal: 6},
  padHorizontal8: {paddingHorizontal: 8},
  padHorizontal10: {paddingHorizontal: 10},
  padHorizontal12: {paddingHorizontal: 12},
  padHorizontal15: {paddingHorizontal: 15},
  padHorizontal20: {paddingHorizontal: 20},
  padHorizontal25: {paddingHorizontal: 25},
  padHorizontal30: {paddingHorizontal: 30},
  padHorizontal35: {paddingHorizontal: 35},

  //Margin Vertical Spacing
  marVertical5: {marginVertical: 5},
  marVertical6: {marginVertical: 6},
  marVertical8: {marginVertical: 8},
  marVertical10: {marginVertical: 10},
  marVertical15: {marginVertical: 15},
  marVertical20: {marginVertical: 20},
  marVertical25: {marginVertical: 25},
  marVertical30: {marginVertical: 30},
  marVertical35: {marginVertical: 35},

  //Margin Horizontal Spacing
  marHorizontal5: {marginHorizontal: 5},
  marHorizontal6: {marginHorizontal: 6},
  marHorizontal8: {marginHorizontal: 8},
  marHorizontal10: {marginHorizontal: 10},
  marHorizontal15: {marginHorizontal: 15},
  marHorizontal20: {marginHorizontal: 20},
  marHorizontal25: {marginHorizontal: 25},
  marHorizontal30: {marginHorizontal: 30},
  marHorizontal35: {marginHorizontal: 35},

  //Margin Top Spacing
  mt5: {marginTop: 5},
  mt8: {marginTop: 8},
  mt10: {marginTop: 10},
  mt15: {marginTop: 15},
  mt20: {marginTop: 20},
  mt25: {marginTop: 25},
  mt30: {marginTop: 30},
  mt35: {marginTop: 35},

  //Margin Right Spacing
  right3: {right: -3},
  mr5: {marginRight: 5},
  mr8: {marginRight: 8},
  mr10: {marginRight: 10},
  mr15: {marginRight: 15},
  mr20: {marginRight: 20},
  mr25: {marginRight: 25},
  mr30: {marginRight: 30},
  mr35: {marginRight: 35},

  //Margin Left Spacing
  ml5: {marginLeft: 5},
  ml8: {marginLeft: 8},
  ml10: {marginLeft: 10},
  ml15: {marginLeft: 15},
  ml20: {marginLeft: 20},
  ml25: {marginLeft: 25},
  ml30: {marginLeft: 30},
  ml35: {marginLeft: 35},

  //Margin Bottom Spacing
  mb5: {marginBottom: 5},
  mb8: {marginBottom: 8},
  mb10: {marginBottom: 10},
  mb15: {marginBottom: 15},
  mb20: {marginBottom: 20},
  mb25: {marginBottom: 25},
  mb30: {marginBottom: 30},
  mb35: {marginBottom: 35},

  //Padding Top Spacing
  pt2: {paddingTop: 2},
  pt5: {paddingTop: 5},
  pt8: {paddingTop: 8},
  pt10: {paddingTop: 10},
  pt15: {paddingTop: 15},
  pt20: {paddingTop: 20},
  pt25: {paddingTop: 25},
  pt30: {paddingTop: 30},
  pt35: {paddingTop: 35},

  //Padding Right Spacing
  pr5: {paddingRight: 5},
  pr8: {paddingRight: 8},
  pr10: {paddingRight: 10},
  pr15: {paddingRight: 15},
  pr20: {paddingRight: 20},
  pr25: {paddingRight: 25},
  pr30: {paddingRight: 30},
  pr35: {paddingRight: 35},

  //Padding Left Spacing
  pl8: {paddingLeft: 8},
  pl10: {paddingLeft: 10},
  pl15: {paddingLeft: 15},
  pl20: {paddingLeft: 20},
  pl25: {paddingLeft: 25},
  pl30: {paddingLeft: 30},
  pl35: {paddingLeft: 35},

  //Padding Bottom Spacing
  pb2: {paddingBottom: 2},
  pb4: {paddingBottom: 4},
  pb5: {paddingBottom: 5},
  pb8: {paddingBottom: 8},
  pb10: {paddingBottom: 10},
  pb15: {paddingBottom: 15},
  pb20: {paddingBottom: 20},
  pb25: {paddingBottom: 25},
  pb30: {paddingBottom: 30},
  pb35: {paddingBottom: 35},

  //width
  width5: {width: 5},
  width10: {width: 10},
  width15: {width: 15},
  width20: {width: 20},
  width25: {width: 25},
  width30: {width: 30},
  width35: {width: 35},
  width40: {width: 40},
  width45: {width: 45},
  width50: {width: 50},
  width55: {width: 55},
  width60: {width: 60},
  width65: {width: 65},
  width70: {width: 70},
  width75: {width: 75},
  width80: {width: 80},
  width85: {width: 85},
  width90: {width: 90},
  width100: {width: 100},
  width150: {width: 150},

  width_10: {width: '10%'},
  width_20: {width: '20%'},
  width_25: {width: '25%'},
  width_30: {width: '30%'},
  width_33: {width: '33%'},
  width_40: {width: '40%'},
  width_47: {width: '47%'},
  width_45: {width: '45%'},
  width_50: {width: '50%'},
  width_60: {width: '60%'},
  width_70: {width: '70%'},
  width_72: {width: '72%'},
  width_80: {width: '80%'},
  width_88: {width: '88%'},
  width_90: {width: '90%'},
  width_95: {width: '95%'},
  width_100: {width: '100%'},
  width_150: {width: '150%'},

  fdrow: {flexDirection: 'row'},
  fdcolumn: {flexDirection: 'column'},
  flex: {flex: 1},
  hyperlink: {
    textDecorationLine: 'underline',
    color: 'blue',
  },

  textCaptial: {textTransform: 'uppercase', fontWeight: '700'},

  serverNotRechable: {
    borderBottomColor: 'red',
    borderBottomWidth: 5,
  },

  scanIconBG: {
    height: 38,
    top: 1,
    right: 2,
    padding: 9,
    backgroundColor: 'lightgrey',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  scanIconDefaultBin: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    borderRadius: 4,
  },
  textBoxLabelPadding: {paddingRight: 30},
  textAlignCenter: {textAlignVertical: 'center'},
  iconAlignment: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 6,
    right: 40,
  },

  fontBld: {fontWeight: '700'},

  fontItalic: {fontStyle: 'italic'},
  teal: {color: '#0d7c8f'},
  divider: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
  },
  insidePadding: {
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  container: {
    paddingHorizontal: 10,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  noDevicesText: {
    color:'#000',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoText: {
    color:'#000',
    textAlign: 'left',
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoTitleText: {
    color:'#000',
    fontSize: 18,
    marginTop:5,
    marginStart:8,
    textAlign: 'left',
    fontStyle: 'normal',
  },
  deviceContainer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deviceItem: {
     color:'#000',
    marginBottom: 10,
  },
  deviceName: {
    color:'#000',
    fontSize: 22,
    fontWeight: 'bold',
  },
  deviceInfo: {
    color:'#000',
    fontSize: 14,
  },
  deviceButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 10,
    marginBottom: 20,
    marginEnd:10,
    paddingHorizontal: 20,
  },

  container: { flex: 1, padding: 10, justifyContent: 'flex-start', backgroundColor: '#fff' },
  head: { height: 30, backgroundColor: 'lightgrey', justifyContent: 'space-between' },
  no_head: { height: 30, backgroundColor: 'white', justifyContent: 'space-between' },

  headText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: 'black', fontWeight: '600' },
  text: { margin: 6, fontSize: 8, fontWeight: 'bold', textAlign: 'center', color:'#000', },
  SectionStyle: {
      flex: 1,
      flexDirection: 'row',
      height: 40,
      marginLeft: 10,
      marginRight: 10,
  },
  buttonTextStyle: {
      color: '#000000',
      paddingVertical: 10,
      paddingHorizontal: 15, fontSize: 16,
      fontWeight: '500'
  },
  dropdown1BtnStyle: {
      width: '50%',
      height: 40,
      color:'#000',
      backgroundColor: '#FFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#dadae8',
  },
  dropdown1BtnTxtStyle: { color: '#000', textAlign: 'left', fontSize: 14, },
  dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
  dropdown1RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#dadae8' },
  dropdown1RowTxtStyle: { color: '#444', textAlign: 'left', },
});
