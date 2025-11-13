import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserReducer";
import appliedReducer from "./AppliedReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    appliedJobs: appliedReducer,
  },
});

export default store;
