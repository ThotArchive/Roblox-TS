import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { Recourse, ReportEvent } from '../../enums';
import reportEvent from '../../services/reportEventService';
import { getUserEmailStatus, updateEmailAddress } from './services/emailVerificationAPI';

export interface EmailVerificationState {
  emailAddress: string | null;
  isEmailVerified: boolean;
  isEmailAdded: boolean;
  loading: boolean;
  error: boolean;
}

const initialState: EmailVerificationState = {
  emailAddress: null,
  isEmailVerified: false,
  isEmailAdded: false,
  loading: false,
  error: false
};

export const updateUserEmail = createAsyncThunk(
  'emailVerification/updateUserEmail',
  async (emailAddress: string, thunkAPI) => {
    try {
      const response = await updateEmailAddress({ emailAddress });
      return response;
    } catch (error) {
      reportEvent(ReportEvent.EmailUpdateFailed, Recourse.AddedEmail, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to update email address');
    }
  }
);

export const fetchUserEmailStatus = createAsyncThunk(
  'emailVerification/getUserEmailStatus',
  async (_, thunkAPI) => {
    try {
      const response = await getUserEmailStatus();
      return response;
    } catch (error) {
      reportEvent(ReportEvent.EmailUpdateFailed, Recourse.AddedEmail, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to fetch email address');
    }
  }
);

export const emailVerificationSlice = createSlice({
  name: 'emailVerification',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    resetEmailVerificationStore: () => initialState,
    setUserEmailData: (state, action: PayloadAction<string>) => {
      state.emailAddress = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(updateUserEmail.pending, state => {
        state.loading = true;
      })
      .addCase(updateUserEmail.fulfilled, (state, action) => {
        state.isEmailAdded = true;
        state.loading = false;
      })
      .addCase(updateUserEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(fetchUserEmailStatus.pending, state => {
        state.loading = true;
      })
      .addCase(fetchUserEmailStatus.fulfilled, (state, action) => {
        const userEmailData = action.payload as EmailVerificationState;
        state.emailAddress = userEmailData.emailAddress;
        state.isEmailVerified = userEmailData.isEmailVerified;
        state.loading = false;
      })
      .addCase(fetchUserEmailStatus.rejected, state => {
        state.loading = false;
      });
  }
});

export const { resetEmailVerificationStore, setUserEmailData } = emailVerificationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectEmailVerification = (state: RootState) => state.emailVerification;
export const selectUserEmailData = (state: RootState) => state.emailVerification.emailAddress;

export default emailVerificationSlice.reducer;
