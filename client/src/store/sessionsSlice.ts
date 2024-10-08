import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TrainingSession } from "@shared/types";
import {
  insertSessionId,
  updateSessionsState,
  updateSessionCalculations,
} from "../utils/sessionUtils";
import { RootState } from "./store";
import {
  getSessionsForDateRange,
  getSessionById,
} from "../services/sessionService";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { fetchMetricsWithSessionsForDateRange } from "./metricsSlice";
import { SessionsState } from "../types/sessionState";
import { compareDates } from "../utils/comparisons";

const initialState: SessionsState = {
  sessions: {},
  sessionIds: [],
  loading: false,
  error: null,
};

/* Selectors Definitions */

export const selectSessionById = createSelector(
  (state: RootState) => state.sessions.sessions,
  (_: RootState, sessionId: number) => sessionId,
  (sessions, sessionId) => sessions[sessionId] || null
);

export const selectSessionsForDateRange = createSelector(
  (state: RootState) => state.sessions.sessions,
  (state: RootState) => state.sessions.sessionIds,
  (
    _: RootState,
    { startDate, endDate }: { startDate: string; endDate: string }
  ) => ({ startDate, endDate }),
  (sessions, sessionIds, { startDate, endDate }) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    const relevantSessions = sessionIds
      .map((id) => sessions[id])
      .filter((session) => {
        const sessionDate = DateTime.fromISO(session.completedOn);
        return sessionDate >= start && sessionDate <= end;
      });

    return relevantSessions.length > 0 ? relevantSessions : null;
  }
);

/* Thunks Definions */

/**
 * Fetches a session for a specified id.
 * @param sesssionId Number id of the session to fetch.
 * @return Fetched session with complete stats.
 */
export const fetchSessionById = createAsyncThunk(
  "sessions/fetchSessionById",
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const data = await getSessionById(sessionId);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return rejectWithValue({
          message: axiosError.message,
          status: axiosError.response.status,
        });
      } else {
        return rejectWithValue({
          message: axiosError.message,
          status: axiosError.code ? parseInt(axiosError.code) : 500,
        });
      }
    }
  }
);

/**
 * Fetches sessions for a specified date range.
 * @param startDate ISO format starting date.
 * @param endDate ISO format ending date.
 * @returns Fetched sessions with complete stats in a list.
 */
export const fetchSessionsForDateRange = createAsyncThunk(
  "sessions/fetchSessionForDateRange",
  async (
    { startDate, endDate }: { startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await getSessionsForDateRange(startDate, endDate);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return rejectWithValue({
          message: axiosError.message,
          status: axiosError.response.status,
        });
      } else {
        return rejectWithValue({
          message: axiosError.message,
          status: axiosError.code ? parseInt(axiosError.code) : 500,
        });
      }
    }
  }
);

/* Slice Definition */
const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    createSession(state, action: PayloadAction<TrainingSession>) {
      const newSession = action.payload;
      const updatedSession = updateSessionCalculations(newSession);
      state.sessions[newSession.id] = updatedSession;
      insertSessionId(state, newSession);
    },
    updateSession(state, action: PayloadAction<TrainingSession>) {
      const prevDate = state.sessions[action.payload.id].completedOn;
      const newDate = action.payload.completedOn;
      const updatedSession = updateSessionCalculations(action.payload);
      state.sessions[updatedSession.id] = updatedSession;
      if (prevDate != newDate) {
        state.sessionIds.sort((a: number, b: number) =>
          compareDates(
            state.sessions[a].completedOn,
            state.sessions[b].completedOn
          )
        );
      }
    },
    deleteSession(state, action: PayloadAction<number>) {
      delete state.sessions[action.payload];
      state.sessionIds = state.sessionIds.filter(
        (item) => item !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        const newSession = action.payload;
        state.sessions[newSession.id] = newSession;
        insertSessionId(state, newSession);
        state.loading = false;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
    builder
      .addCase(fetchSessionsForDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionsForDateRange.fulfilled, (state, action) => {
        const sessions = action.payload.sessions;
        updateSessionsState(state, sessions);
        state.loading = false;
      })
      .addCase(fetchSessionsForDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
    builder
      .addCase(fetchMetricsWithSessionsForDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMetricsWithSessionsForDateRange.fulfilled,
        (state, action) => {
          const sessions: TrainingSession[] = action.payload.sessions;
          updateSessionsState(state, sessions);
          state.loading = false;
        }
      )
      .addCase(
        fetchMetricsWithSessionsForDateRange.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error; // Use action.error which is SerializedError type
        }
      );
  },
});

export const { createSession, updateSession, deleteSession } =
  sessionsSlice.actions;
export default sessionsSlice.reducer;
