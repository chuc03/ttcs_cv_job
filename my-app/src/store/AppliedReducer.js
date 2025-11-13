import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appliedJobs: JSON.parse(localStorage.getItem("appliedJobs") || "[]"),
};

const appliedSlice = createSlice({
  name: "appliedJobs",
  initialState,
  reducers: {
    setAppliedJobs: (state, action) => {
      state.appliedJobs = action.payload;
      localStorage.setItem("appliedJobs", JSON.stringify(state.appliedJobs));
    },
    addAppliedJob: (state, action) => {
      if (!state.appliedJobs.includes(action.payload)) {
        state.appliedJobs.push(action.payload);
        localStorage.setItem("appliedJobs", JSON.stringify(state.appliedJobs));
      }
    },
    removeAppliedJob: (state, action) => {
      state.appliedJobs = state.appliedJobs.filter(
        (jobId) => jobId !== action.payload
      );
      localStorage.setItem("appliedJobs", JSON.stringify(state.appliedJobs));
    },
  },
});

export const { setAppliedJobs, addAppliedJob, removeAppliedJob } =
  appliedSlice.actions;
export default appliedSlice.reducer;
