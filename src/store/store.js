// store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from "redux-persist";
import sensorslice, { sensorSlice } from './sensorslice';

const reducers = combineReducers(
  {
    sensorData:  sensorSlice.reducer
  }
);


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  timeout: null,
};
const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
