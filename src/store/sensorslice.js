import { createSlice } from "@reduxjs/toolkit";
import { getAdvertismentHistroy } from "../services/bleServices";

const initialState = {
  settings: [],
  scanAdvatisementPackts: [],
  advatisementPackts: [],
  statusInformation: [],
  caculatedDataService: [],
  caculatedSensorDataService: [],
  sensorCalXDataService: [],
  sensorCalYDataService: [],
  sensorCalZDataService: [],
  lowFrequencyXDataService: [],
  lowFrequencyYDataService: [],
  lowFrequencyZDataService: [],
  advatisementHistory: [],
};

export const sensorSlice = createSlice(
  {
    name: 'sensorData',
    initialState,
    reducers: {
      clearScanState: (state) => {
        state.scanAdvatisementPackts = []
      },
      clearState: (state) => {
        state.caculatedDataService = [],
          state.caculatedSensorDataService = [],
          state.sensorCalXDataService = [],
          state.sensorCalYDataService = [],
          state.sensorCalZDataService = [],
          state.lowFrequencyXDataService = [],
          state.lowFrequencyZDataService = [],
          state.lowFrequencyZDataService = []
      },

      addSettings: (state, action) => {
        state.settings = action.payload;
      },
      addStatusInformation: (state, action) => {
        state.statusInformation = action.payload;
      },
      addScanAdvatisementPakest: (state, action) => {
        const newData = action.payload;
        if (state.scanAdvatisementPackts == undefined)
          state.scanAdvatisementPackts = []
        const existingItem = state.scanAdvatisementPackts.find(data =>
          data.mac_address === newData.mac_address
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.scanAdvatisementPackts = state.scanAdvatisementPackts.map(data =>
            data.mac_address === newData.mac_address ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          state.scanAdvatisementPackts.push(newData);
        }
      },
      addAdvatisementPakest: (state, action) => {
        const newData = action.payload;
        if (state.advatisementPackts == undefined)
          state.advatisementPackts = []
        const existingItem = state.advatisementPackts.find(data =>
          data.sensorTime === newData.sensorTime && data.mac_address === newData.mac_address
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.advatisementPackts = state.advatisementPackts.map(data =>
            (data.sensorTime === newData.sensorTime && data.mac_address === newData.mac_address) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          state.advatisementPackts.push(newData);
        }
      },
      addCaculationResult: (state, action) => {
        const newData = action.payload;
        const existingItem = state.caculatedDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.caculatedDataService = state.caculatedDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.caculatedDataService.push(newData);
        }
      },
      addSensorXCalResult: (state, action) => {
        const newData = action.payload;
        console.log(newData)
        if (state.sensorCalXDataService == undefined)
          state.sensorCalXDataService = []

        const existingItem = state.sensorCalXDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.sensorCalXDataService = state.sensorCalXDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.sensorCalXDataService.push(newData);
        }
      },
      addSensorYCalResult: (state, action) => {
        const newData = action.payload;
        if (state.sensorCalYDataService == undefined)
          state.sensorCalYDataService = []
        const existingItem = state.sensorCalYDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.sensorCalYDataService = state.sensorCalYDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.sensorCalYDataService.push(newData);
        }
      },
      addSensorZCalResult: (state, action) => {
        const newData = action.payload;
        if (state.sensorCalZDataService == undefined)
          state.sensorCalZDataService = []
        const existingItem = state.sensorCalZDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.sensorCalZDataService = state.sensorCalZDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.sensorCalZDataService.push(newData);
        }
      },
      addlowFrequencyXCalResult: (state, action) => {
        const newData = action.payload;
        if (state.lowFrequencyXDataService == undefined)
          state.lowFrequencyXDataService = []
        const existingItem = state.lowFrequencyXDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.lowFrequencyXDataService = state.lowFrequencyXDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.lowFrequencyXDataService.push(newData);
        }
      },
      addlowFrequencyYCalResult: (state, action) => {
        const newData = action.payload;
        if (state.lowFrequencyYDataService == undefined)
          state.lowFrequencyYDataService = []
        const existingItem = state.lowFrequencyYDataService.find(data =>
          data.gwTime === newData.gwTime
          && data.pkc === newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.lowFrequencyYDataService = state.lowFrequencyYDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added")
          // If the data doesn't exist, add it
          state.lowFrequencyYDataService.push(newData);
        }
      },
      addlowFrequencyZCalResult: (state, action) => {
        const newData = action.payload;
        if (state.lowFrequencyZDataService == undefined)
          state.lowFrequencyZDataService = []
        // console.log("object", state.lowFrequencyZDataService)
        const existingItem = state.lowFrequencyZDataService.find(data =>
          data.gwTime == newData.gwTime
          && data.pkc == newData.pkc
        );
        if (existingItem) {
          console.log("updated")
          // If the data exists, update it
          state.lowFrequencyZDataService = state.lowFrequencyZDataService.map(data =>
            (data.gwTime === newData.gwTime && data.pkc === newData.pkc) ? { ...data, ...newData } : data
          );
        } else {
          console.log("added", newData)
          // If the data doesn't exist, add it
          state.lowFrequencyZDataService.push(newData);
        }
      },
      addLowFreqData: (state, action) => {
        state.lowFrequencyXDataService = action.payload;
      },
      addCalculatesSensorData: (state, action) => {
        state.caculatedSensorDataService = action.payload;
      },
      clearStatusInfos: (state) => {
        state.statusInformation = [];
      },
    },
    extraReducers: (builder) => {
      builder.addCase(getAdvertismentHistroy.fulfilled, (state, { payload }) => {
        state.advatisementHistory = payload;
      });
    },
    //  extraReducers: {
    //   [getAdvertismentHistroy.fulfilled]: (state, { payload }) => {
    //     state.advatisementHistory = payload.Body;
    //   },
    // },

  }
)

export const { clearState, clearScanState, addScanAdvatisementPakest, addAdvatisementPakest, addSettings, addStatusInformation, addCaculationResult, addLowFreqData, addCalculatesSensorData,
  addSensorXCalResult, addSensorYCalResult, addSensorZCalResult, addlowFrequencyXCalResult, addlowFrequencyYCalResult, addlowFrequencyZCalResult } =
  sensorSlice.actions;

export default sensorSlice.reducer;
