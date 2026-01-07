/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertOptions } from "@/types/alert.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Omit<Alert, "id">>) => {
      const id = Date.now() + Math.random();
      const newAlert: Alert = {
        ...action.payload,
        type: action.payload.type || "info",
        autoClose: action.payload.autoClose ?? true,
        duration: action.payload.duration || 5000,
        startTime: Date.now(),
        id,
      };
      state.alerts.push(newAlert);
    },
    removeAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    clearAllAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { addAlert, removeAlert, clearAllAlerts } = alertSlice.actions;

export const showSuccess = (message: string, options: AlertOptions = {}) => {
  return (dispatch: any) => {
    const id = Date.now() + Math.random();
    const alert = {
      ...options,
      type: "success" as const,
      message,
      id,
    };
    dispatch(addAlert(alert));

    const duration = options.duration || 5000;
    const autoClose = options.autoClose ?? true;

    if (autoClose) {
      setTimeout(() => {
        dispatch(removeAlert(id));
      }, duration);
    }

    return id;
  };
};

export const showError = (message: string, options: AlertOptions = {}) => {
  return (dispatch: any) => {
    const id = Date.now() + Math.random();
    const alert = {
      ...options,
      type: "error" as const,
      message,
      duration: options.duration || 8000,
      id,
    };
    dispatch(addAlert(alert));

    const duration = options.duration || 8000;
    const autoClose = options.autoClose ?? true;

    if (autoClose) {
      setTimeout(() => {
        dispatch(removeAlert(id));
      }, duration);
    }

    return id;
  };
};

export const showWarning = (message: string, options: AlertOptions = {}) => {
  return (dispatch: any) => {
    const id = Date.now() + Math.random();
    const alert = {
      ...options,
      type: "warning" as const,
      message,
      id,
    };
    dispatch(addAlert(alert));

    const duration = options.duration || 5000;
    const autoClose = options.autoClose ?? true;

    if (autoClose) {
      setTimeout(() => {
        dispatch(removeAlert(id));
      }, duration);
    }

    return id;
  };
};

export const showInfo = (message: string, options: AlertOptions = {}) => {
  return (dispatch: any) => {
    const id = Date.now() + Math.random();
    const alert = {
      ...options,
      type: "info" as const,
      message,
      id,
    };
    dispatch(addAlert(alert));

    const duration = options.duration || 5000;
    const autoClose = options.autoClose ?? true;

    if (autoClose) {
      setTimeout(() => {
        dispatch(removeAlert(id));
      }, duration);
    }

    return id;
  };
};

export default alertSlice.reducer;
