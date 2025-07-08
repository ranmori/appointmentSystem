import axios from "axios";

// /**
//  * GetUserInfo Utility Function
//  *
//  * This function attempts to retrieve the current user's information and authentication token.
//  * It prioritizes fetching from localStorage for performance, and falls back to an API call
//  * if localStorage data is missing or incomplete.
//  *
//  * The returned object will always include `token` and `user` data (e.g., _id, username, role, name, image, location).
//  *
//  * @returns {Object|null} An object containing user info and token, or null if not authenticated.
//  */
const GetUserInfo = async () => {
  // api base url
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  try {
    let userInfo = null;
    const storedToken = localStorage.getItem("token"); // Always try to get the token directly
    const storedUserInfoString = localStorage.getItem("userInfo"); // Get the full user object string

    // 1. Attempt to get user info from localStorage
    if (storedToken && storedUserInfoString) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfoString);
        // Check if the parsed object is valid and has expected core properties
        if (parsedUserInfo && parsedUserInfo._id && parsedUserInfo.role) {
          // Combine the parsed user data with the token for a complete object
          userInfo = { ...parsedUserInfo, token: storedToken };
          console.log(
            "GetUserInfo.jsx: User info found in localStorage and is valid."
          );
          return userInfo;
        } else {
          console.warn(
            "GetUserInfo.jsx: Parsed userInfo from localStorage is incomplete or invalid. Clearing."
          );
          localStorage.removeItem("userInfo"); // Clear incomplete data
        }
      } catch (parseError) {
        console.warn(
          "GetUserInfo.jsx: Failed to parse userInfo from localStorage, clearing. Error:",
          parseError
        );
        localStorage.removeItem("userInfo"); // Clear corrupted data
      }
    }

    // 2. If not found or invalid in localStorage, try to fetch from API
    // This path is taken if localStorage was empty, incomplete, or corrupted.
    if (!storedToken) {
      // If no token available, cannot authenticate via API
      console.log(
        "GetUserInfo.jsx: No valid token in localStorage, cannot fetch user info from API."
      );
      return null; // Not authenticated
    }

    const config = {
      headers: {
        Authorization: `Bearer ${storedToken}`, // Use the retrieved token for API call
      },
    };

    console.log(
      "GetUserInfo.jsx: No valid user info in localStorage, attempting to fetch from /api/users/me..."
    );
    const response = await axios.get(`${API_BASE_URL}/api/users/me`, config);
    const fetchedUserData = response.data; // This is the user object (and doctorProfile if applicable) from /api/users/me

    // Combine fetched user data with the token for consistent return structure
    // /api/users/me returns { ...user, doctorProfile: {} } for doctors
    // For consistency, we'll return { ...user, token }
    const combinedUserInfo = { ...fetchedUserData, token: storedToken };

    // Save this newly fetched info to localStorage for future use
    localStorage.setItem("userInfo", JSON.stringify(combinedUserInfo));
    localStorage.setItem("token", storedToken); // Re-save token if it was only present as "token" but not in "userInfo"
    // Also ensure username is set for legacy uses or quick access
    localStorage.setItem(
      "username",
      fetchedUserData.username || fetchedUserData.name || "User"
    );

    console.log("GetUserInfo.jsx: User info fetched from API and saved.");
    return combinedUserInfo; // Return the complete object
  } catch (error) {
    console.error(
      "Error fetching user info in GetUserInfo:",
      error.response?.status,
      error.message
    );
    // If API call results in 401 (Unauthorized), token might be invalid/expired. Clear local storage.
    if (error.response && error.response.status === 401) {
      console.log(
        "GetUserInfo.jsx: API call Unauthorized (401), clearing local storage."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userInfo"); // Clear the full JSON string too
    }
    return null; // Return null on any error
  }
};

export default GetUserInfo;
