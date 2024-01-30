// In App.js in a new project

import * as React from 'react';
import { View, Text, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SensorInfoDashboard from './src/screens/SensorInfoDashboard';
import SensorScanning from './src/screens/SensorScanning';
import { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { persistStore } from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react';
// Import App Center Crashes at the top of the file.
import Crashes from 'appcenter-crashes';
import store from './src/store/store';
import DeviceScanList from './src/screens/DeviceScanList';
import DashboardLog from './src/screens/DashboardLog';
import DataServiceHistory from './src/screens/dataServiceHistroy';
import SettingsInfo from './src/screens/settingsInfo';
import FlashMessage from 'react-native-flash-message';
import codePush from "react-native-code-push";
import AdvertiementLogScreen from './src/screens/AdvertiementLogScreen';

const Stack = createNativeStackNavigator();
let persistor = persistStore(store);

function App() {
  LogBox.ignoreAllLogs()
  useEffect(() => {
    SplashScreen.hide()
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="deviceScan" component={DeviceScanList} options={{ title: 'Scan', headerShown: false }} />
            {/* <Stack.Screen name="deviceScan" component={SensorScanning} options={{ title: 'Scan', headerShown: false }} /> */}
            <Stack.Screen name="dashboardLogs" component={DashboardLog} options={{ title: 'Advatisement', headerShown: false }} />
            <Stack.Screen name="advertiementLogs" component={AdvertiementLogScreen} options={{ title: 'Advatisement', headerShown: false }} />
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