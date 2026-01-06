import { AuthState } from "@/types/auth.types";
import { BACKEND_URL } from "@/utils/config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const TokenService = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  },
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },
  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  },
  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  isTokenExpired: (token: string) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      console.error("Error in Token Expiration", error);
      return true;
    }
  },
};

const initialState: AuthState = {
  user: null,
  accessToken: TokenService.getAccessToken() || null,
  isAuthenticated: !!TokenService.getAccessToken(),
  isLoading: false,
  error: null,
};

// Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    credentials: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.type !== "success") {
        return rejectWithValue(data.message);
      }

      // Store tokens
      TokenService.setAccessToken(data.accessToken);
      TokenService.setRefreshToken(data.refreshToken);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registration Error"
      );
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.type !== "success") {
        return rejectWithValue(data.message);
      }

      // Store tokens
      TokenService.setAccessToken(data.accessToken);
      TokenService.setRefreshToken(data.refreshToken);

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login Error";
      return rejectWithValue(message);
    }
  }
);

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = TokenService.getAccessToken();

      if (!accessToken) {
        throw new Error("No access token");
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();

      if (data.type !== "success") {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch profile";
      return rejectWithValue(message);
    }
  }
);

// Refresh Access Token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = TokenService.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.type !== "success") {
        TokenService.clearTokens();
        return rejectWithValue(data.message);
      }

      // Update access token
      TokenService.setAccessToken(data.accessToken);

      return data;
    } catch (error) {
      TokenService.clearTokens();
      const message =
        error instanceof Error ? error.message : "Token refresh failed";
      return rejectWithValue(message);
    }
  }
);

// Exchange OAuth Code for Tokens
export const exchangeOAuthCode = createAsyncThunk(
  "auth/exchangeOAuthCode",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.type !== "success") {
        return rejectWithValue(data.message);
      }

      // Store tokens
      TokenService.setAccessToken(data.accessToken);
      TokenService.setRefreshToken(data.refreshToken);

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OAuth exchange failed";
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();

      const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.type !== "success") {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error Logging Out";
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Manual logout without API call
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      TokenService.clearTokens();
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set tokens manually (useful for OAuth flow)
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      TokenService.setAccessToken(action.payload.accessToken);
      TokenService.setRefreshToken(action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        TokenService.clearTokens();
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Exchange OAuth Code
    builder
      .addCase(exchangeOAuthCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exchangeOAuthCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(exchangeOAuthCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    // Logout Current Session
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuth, clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;
