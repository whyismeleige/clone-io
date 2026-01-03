import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConfigState {
  tabsState: "preview" | "code";
}

const initialState: ConfigState = {
  tabsState: "preview",
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    toggleTabs: (state, action: PayloadAction<"preview" | "code">) => {
      state.tabsState = action.payload;
    },
  },
});

export const { toggleTabs } = configSlice.actions;
export default configSlice.reducer;
