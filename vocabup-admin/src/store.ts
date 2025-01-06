import { configureStore } from "@reduxjs/toolkit";
import {
  AppReducer,
  appReducer,
  callMessage,
  loadingFullScreen,
  logout,
  toggleActionWordModal,
  wordReducer,
  WordReducer,
} from "./redux/slice";
// import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import { default as sessionStorageRedux } from "redux-persist/lib/storage/session";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import axiosInstance from "./axios";
import { MessageType } from "./constants";

const persistSessionConfig = {
  storage: sessionStorageRedux,
  stateReconciler: autoMergeLevel2,
};

const appPersistConfig = {
  key: "app",
  ...persistSessionConfig,
  whitelist: [
    "isAuthenticated",
    "tabSelected",
    "admin",
    "openActionWordModal",
    "language",
  ],
};

const wordPersistConfig = {
  key: "word",
  ...persistSessionConfig,
  whitelist: ["currentWord", "topics"],
};

const store = configureStore({
  reducer: {
    app: persistReducer<AppReducer>(appPersistConfig, appReducer),
    word: persistReducer<WordReducer>(wordPersistConfig, wordReducer),
  },
});

// Interceptors for axios
const isTokenExpireError = (response: Response) => response.status === 401;
const isForbiddenError = (response: Response) => response.status === 403;
const isNotFound = (response: Response) => response.status === 404;
const isServerError = (response: Response) => response.status > 500;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    dispatch(loadingFullScreen(false));
    const { response } = error;
    if (!response) {
      dispatch(logout());

      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content: "Lỗi kết nối!",
        })
      );

      return {
        data: {
          data: {},
        },
      };
    }

    if (isTokenExpireError(response) || isForbiddenError(response)) {
      dispatch(logout());
      dispatch(toggleActionWordModal(false));
    } else {
      let content = response.data.message;
      if (isServerError(response)) {
        content = response.data;
      }

      if (isNotFound(response)) {
        content = "Không tìm thấy API endpoint";
      }

      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content,
        })
      );
    }

    return error;
  }
);

export default store;
export const persistor = persistStore(store);
export type IRootState = ReturnType<typeof store.getState>;
export const dispatch = store.dispatch;
export const getState = store.getState;
export type AppDispatch = typeof store.dispatch;
