import {StyleSheet, Dimensions} from 'react-native';

const windowHeight = Dimensions.get('window').height;
export const styles = StyleSheet.create({
  safeContainerStyle: {
    backgroundColor: '#ededed',
    flex: 1,
    justifyContent: "flex-start",
  },
  containerView: {
    marginEnd: 5,
    width: "100%",
    height: '100%',
    backgroundColor: '#ffffff',
    color: "white"
  },
  container: {
    paddingHorizontal: 10,
  },
  buttonBg :{
    backgroundColor: '#2196F3',
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
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
    backgroundColor:"",
    textAlign: 'center',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoText: {
    textAlign: 'left',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoTitleText: {
    fontSize: 20,
    marginTop:10,
    textAlign: 'left',
    fontStyle: 'normal',
  },
  deviceContainer: {
    flexDirection:'row',
    marginBottom:40,
    justifyContent: 'space-between',
  },
  deviceItem: {
    marginBottom: 40,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  deviceInfo: {
    fontSize: 16,
  },
  deviceButton: {
    padding: 8,
    height:40,
    alignContent:'center',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 10,
    marginBottom: 0,
    marginEnd:40,
    paddingHorizontal: 0,
  }, 
  buttonView: {
    backgroundColor: 'rgb(33, 150, 243)',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  cardContainer: {
    marginHorizontal: 20,
    paddingEnd: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomWidth: 6,
    borderBottomColor: '#ccc',
  },
});