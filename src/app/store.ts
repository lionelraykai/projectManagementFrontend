import { configureStore } from '@reduxjs/toolkit';
import authReducer, { persistAuthState } from '../features/auth/authSlice';
import { connectSocket, disconnectSocket } from '../socket/socket';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Socket lifecycle is driven from the store, not a React effect: a
// component-effect approach races on mount order (child effects fire before
// parent effects), so a page that opens straight into a project board — a
// refresh, a deep link, "User C opens the project later" with an
// already-persisted session — could mount its room-join effect before an
// ancestor's effect had connected the socket, and silently never retry.
// Driving it here runs synchronously on every dispatch, independent of
// what's mounted, and also fires once at import time for an already-logged-in
// session restored from localStorage.
let hasActiveSocketSession = false;

function syncSideEffects() {
  const authState = store.getState().auth;
  persistAuthState(authState);

  const hasSession = Boolean(authState.accessToken);
  if (hasSession && !hasActiveSocketSession) {
    hasActiveSocketSession = true;
    connectSocket(() => store.getState().auth.accessToken);
  } else if (!hasSession && hasActiveSocketSession) {
    hasActiveSocketSession = false;
    disconnectSocket();
  }
}

store.subscribe(syncSideEffects);
syncSideEffects();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
