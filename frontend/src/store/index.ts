import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import configReducer, { ConfigState } from "./slices/config.slice";
import chatReducer, { ChatState } from "./slices/chat.slice";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/auth.slice";
import alertReducer, { AlertState } from "./slices/alert.slice";
import { AuthState } from "@/types/auth.types";

export interface RootState {
  config: ConfigState;
  chat: ChatState;
  auth: AuthState;
  alert: AlertState;
}

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"],
};

const chatPersistConfig = {
  key: "chat",
  storage,
  whitelist: ["prompt"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedChatReducer = persistReducer(chatPersistConfig, chatReducer);

const rootReducer = combineReducers({
  config: configReducer,
  chat: persistedChatReducer,
  auth: persistedAuthReducer,
  alert: alertReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
