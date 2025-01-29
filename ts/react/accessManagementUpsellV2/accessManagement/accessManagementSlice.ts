import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import fetchFeatureCheckResponse from './accessManagementAPI';
import { Access, ReportEvent, UpsellStage } from '../enums';
import reportEvent from '../services/reportEventService';
import AmpResponse from './AmpResponse';
import { ExtraParameter, RecourseResponse } from '../types/AmpTypes';

export interface AccessState {
  loading: boolean;
  data: AmpResponse | null;
  error: string | null;
}

const initialAccessState: AccessState = {
  loading: false,
  data: null,
  error: null
};

export interface UpsellState {
  featureName: string | null;
  ampFeatureCheckData: ExtraParameter[] | undefined;
  stage: UpsellStage | null;
  verificationStageRecourse: RecourseResponse | null;
  featureAccess: AccessState;
  showUpsell: boolean;
  redirectLink: string | null;
  loading: boolean;
}

const initialState: UpsellState = {
  featureName: null,
  ampFeatureCheckData: undefined,
  stage: null,
  verificationStageRecourse: null,
  featureAccess: initialAccessState,
  showUpsell: false,
  redirectLink: null,
  loading: false
};

export const fetchFeatureAccess = createAsyncThunk(
  'accessManagement/fetchFeatureAccess',
  async (
    arg: {
      featureName: string;
      ampFeatureCheckData?: ExtraParameter[];
      successfulAction?: string;
    },
    thunkAPI
  ) => {
    try {
      const { featureName, ampFeatureCheckData, successfulAction } = arg;
      const response = await fetchFeatureCheckResponse(
        featureName,
        ampFeatureCheckData,
        successfulAction
      );
      return response;
    } catch (error) {
      reportEvent(ReportEvent.AMPCheckFailed, null, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to fetch AMP response');
    }
  }
);

export const accessManagementSlice = createSlice({
  name: 'accessManagement',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    resetAccessManagementStore: () => initialState,
    setFeatureName: (state, action: PayloadAction<string>) => {
      state.featureName = action.payload;
    },
    setAmpFeatureCheckData: (state, action: PayloadAction<ExtraParameter[]>) => {
      state.ampFeatureCheckData = action.payload;
    },
    showUpsell: (state, action: PayloadAction<boolean>) => {
      state.showUpsell = action.payload;
    },
    setFeatureAccess: (state, action: PayloadAction<AccessState>) => {
      state.featureAccess = action.payload;
    },
    setRedirectLink: (state, action: PayloadAction<string>) => {
      state.redirectLink = action.payload;
    },
    setStage: (state, action: PayloadAction<UpsellStage>) => {
      state.stage = action.payload;
    },
    setVerificationStageRecourse: (state, action: PayloadAction<RecourseResponse>) => {
      state.verificationStageRecourse = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFeatureAccess.pending, state => {
        state.featureAccess.loading = true;
      })
      .addCase(fetchFeatureAccess.fulfilled, (state, action) => {
        const ampResponse = action.payload as AmpResponse;

        state.featureAccess = {
          ...state.featureAccess,
          loading: false,
          data: ampResponse
        };
        state.featureName = ampResponse.featureName;
        if (ampResponse.access === Access.Actionable) {
          state.showUpsell = true;
          // Set default recourse to be the first one
          [state.verificationStageRecourse] = ampResponse.recourses;
        }
      })
      .addCase(fetchFeatureAccess.rejected, (state, action) => {
        state.featureAccess = {
          ...state.featureAccess,
          loading: false,
          error: action.error.message || 'Something went wrong'
        };
      });
  }
});

export const {
  resetAccessManagementStore,
  setFeatureAccess,
  setFeatureName,
  setAmpFeatureCheckData,
  setRedirectLink,
  setVerificationStageRecourse,
  showUpsell,
  setStage
} = accessManagementSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectAccessManagement = (state: RootState) => state.accessManagement;
export const selectShowUpsell = (state: RootState) => state.accessManagement.showUpsell;
export const selectFeatureName = (state: RootState) => state.accessManagement.featureName;
export const selectAmpFeatureCheckData = (state: RootState) =>
  state.accessManagement.ampFeatureCheckData;
export const selectFeatureAccess = (state: RootState) => state.accessManagement.featureAccess;
export const selectCurrentStage = (state: RootState) => state.accessManagement.stage;
export const selectVerificationStageRecourse = (state: RootState) =>
  state.accessManagement.verificationStageRecourse;

export default accessManagementSlice.reducer;
