import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAccountInfo, login, ResponseState } from "../thunk";
import { LoginStatus, MessageType } from "../../constants";
import _ from "lodash";
import { Admin } from "../../types";

interface AppState {
  isAuthenticated: boolean;
  tabSelected: string[];
  loginStatus: string;
  admin: Admin | null;
  message: { type: string; content: string } | null;
  openActionWordModal: boolean;
  loadingFullScreen: boolean;
  language: "vi" | "en";
}

const initialState: AppState = {
  isAuthenticated: true,
  tabSelected: ["1"],
  loginStatus: LoginStatus.IDLE,
  admin: null,
  message: null,
  openActionWordModal: false,
  loadingFullScreen: false,
  language: "vi",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.tabSelected = ["1"];
      sessionStorage.clear();
    },
    selectMenuSidebar: (state, action: PayloadAction<string[]>) => {
      state.tabSelected = action.payload;
    },
    toggleActionWordModal: (state, action: PayloadAction<boolean>) => {
      state.openActionWordModal = action.payload;
    },
    callMessage: (
      state,
      action: PayloadAction<{ type: string; content: string }>
    ) => {
      state.message = action.payload;
    },
    loadingFullScreen: (state, action: PayloadAction<boolean | undefined>) => {
      state.loadingFullScreen = _.isUndefined(action.payload)
        ? !state.loadingFullScreen
        : action.payload;
    },
    updateAccountInfo: (state, action: PayloadAction<Partial<Admin>>) => {
      state.admin = {
        ...state.admin,
        ...action.payload,
      } as Admin;
    },
    setLanguage: (state, action: PayloadAction<"vi" | "en">) => {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isAuthenticated = false;
        state.loginStatus = LoginStatus.PENDING;
        state.admin = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loginStatus = LoginStatus.FULFILLED;
        state.admin = action.payload.data.info;
        state.message = {
          type: MessageType.SUCCESS,
          content: action.payload.message,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loginStatus = LoginStatus.REJECTED;
        state.admin = null;
        state.message = {
          type: MessageType.ERROR,
          content:
            (action.payload as ResponseState).message ||
            "Lỗi không xác định <appSlice.ts>",
        };
      })
      .addCase(getAccountInfo.pending, (state) => {
        state.loadingFullScreen = true;
      })
      .addCase(getAccountInfo.fulfilled, (state, action) => {
        state.loadingFullScreen = false;
        state.admin = action.payload.data.info;
      })
      .addCase(getAccountInfo.rejected, (state, action) => {
        state.loadingFullScreen = false;
        state.admin = null;
        state.message = {
          type: MessageType.ERROR,
          content:
            (action.payload as ResponseState).message ||
            "Lỗi không xác định <appSlice.ts>",
        };
      });
  },
});

export const {
  logout,
  selectMenuSidebar,
  toggleActionWordModal,
  callMessage,
  loadingFullScreen,
  updateAccountInfo,
  setLanguage,
} = appSlice.actions;

export default appSlice.reducer;

export type AppReducer = ReturnType<typeof appSlice.reducer>;
