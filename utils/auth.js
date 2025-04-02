import * as SecureStore from "expo-secure-store";

export const storeToken = async (token, email) => {
    try {
        if (!token || !email) throw new Error("Token or Email is empty!");
        await SecureStore.setItemAsync("authToken", token);
        await SecureStore.setItemAsync("userEmail", email);
        await SecureStore.setItemAsync("status","Active");
        console.log("Token & Email Stored Securely");
        console.log(email);
        
    } catch (error) {
        console.error("Error storing token and email:", error);
    }
};

export const getToken = async () => {
    try {
        return await SecureStore.getItemAsync("authToken");
    } catch (error) {
        console.error("Error retrieving token:", error);
        return null;
    }
};

export const getEmail = async () => {
    try {
        return await SecureStore.getItemAsync("userEmail");
    } catch (error) {
        console.error("Error retrieving email:", error);
        return null;
    }
};

export const removeToken = async () => {
    try {
        await SecureStore.deleteItemAsync("authToken");
        await SecureStore.deleteItemAsync("userEmail");
        await SecureStore.setItemAsync("status","InActive");
        console.log("Token & Email Removed");
    } catch (error) {
        console.error("Error removing token and email:", error);
    }
};
