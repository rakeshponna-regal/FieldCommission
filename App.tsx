// In App.js in a new project
import './localization/translations/i18n'
import * as React from 'react';
import { View, Text, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SensorInfoDashboard from './src/screens/SensorInfoDashboard';
import SensorScanning from './src/screens/SensorScanning';
import { useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { persistStore } from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react';
// Import App Center Crashes at the top of the file.
import store from './src/store/store';
import DeviceScanList from './src/screens/DeviceScanList';
import DashboardLog from './src/screens/DashboardLog';
import DataServiceHistory from './src/screens/dataServiceHistroy';
import SettingsInfo from './src/screens/settingsInfo';
import FlashMessage from 'react-native-flash-message';
import codePush from "react-native-code-push";
import AdvertisementLogScreen from './src/screens/AdvertiementLogScreen';
import OktaLogin from './src/screens/oktalogin';
import LoginScreen from './src/screens/loginScreen';
import { isAuthenticated, createConfig } from '@okta/okta-react-native';
import configFile from './okta.config';
import ProfileScreen from './src/screens/profileScreen';

const Stack = createNativeStackNavigator();
let persistor = persistStore(store);

export const oktaConfigs = {
  issuer: configFile.oidc.discoveryUri,
  clientId: configFile.oidc.clientId,
  redirectUrl: configFile.oidc.redirectUri,
  scopes: configFile.oidc.scopes,
  serviceConfiguration: configFile.oidc.serviceConfiguration,
  additionalParameters: configFile.oidc.additionalParameters,
  iosPrefersEphemeralSession:true,
};
function App() {
  LogBox.ignoreAllLogs()


  const [progress, setProgress] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);



  useEffect(() => {
    const checkAuthentication = async () => {
      const result = await isAuthenticated();
      console.log("checkAuthentication => ", result)
      setAuthenticated(result.authenticated);
      setProgress(false);
    };

    createConfig({
      clientId: configFile.oidc.clientId,
      redirectUri: configFile.oidc.redirectUri,
      endSessionRedirectUri: configFile.oidc.endSessionRedirectUri,
      discoveryUri: configFile.oidc.discoveryUri,
      scopes: configFile.oidc.scopes,
      requireHardwareBackedKeyStore: configFile.oidc.requireHardwareBackedKeyStore,
    });
    checkAuthentication();
  }, []);

  useEffect(() => {
    SplashScreen.hide()
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='login'>
            <Stack.Screen name="login" component={LoginScreen} options={{ title: 'Login', headerShown: false }} />
            <Stack.Screen name="profile" component={ProfileScreen} options={{ title: 'Login', headerShown: false }} />
            <Stack.Screen name="OktaLogin" component={OktaLogin} options={{ title: 'Login', headerShown: false }} />
            <Stack.Screen name="deviceScan" component={DeviceScanList} options={{ title: 'Scan', headerShown: false }} />
            <Stack.Screen name="dashboardLogs" component={DashboardLog} options={{ title: 'Advatisement', headerShown: false }} />
            <Stack.Screen name="advertiementLogs" component={AdvertisementLogScreen} options={{ title: 'Advatisement', headerShown: false }} />
            <Stack.Screen name="dashboard" component={SensorInfoDashboard} options={{ headerShown: false }} />
            <Stack.Screen name="DataServiceHistory" component={DataServiceHistory} options={{ title: 'Advatisement', headerShown: false }} />
            <Stack.Screen name="SettingsInfo" component={SettingsInfo} options={{ title: 'Advatisement', headerShown: false }} />

          </Stack.Navigator>
        </NavigationContainer>
        <FlashMessage position="center"
          icon="auto"
          duration={2000} />
      </PersistGate>
    </Provider>

  );
}
export default codePush(App);