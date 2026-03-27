import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user") || "null");
const storeToken = localStorage.getItem("token") || null;

const initialState = {
    user: storedUser,
    token: storeToken,
    isAuthenticated: !!storeToken // true if token exists, false otherwise  
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess:(state , action)=>{
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            localStorage.setItem("token", action.payload.token);
        },
        updateProfileSuccess:(state, action) => {
            state.user = {
                ...state.user,
                ...action.payload,
            };
            localStorage.setItem("user", JSON.stringify(state.user));
        },
        logout :(state)=>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }
})

export const { loginSuccess, updateProfileSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
