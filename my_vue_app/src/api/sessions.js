import api from "./client";

export async function startSession(userId, calendarEntryId) {
  const res = await api.post("/sessions/start", {
    userId,
    calendarEntryId,
  });
  return res.data;
}

export async function getSession(id) {
  const res = await api.get(`/sessions/${id}`);
  return res.data;
}

export async function recordSet(
  sessionId,
  exerciseId,
  setNumber,
  actualRepsOrDuration,
  restAfterSetSeconds
) {
  await api.patch(`/sessions/${sessionId}/exercise/${exerciseId}/set`, {
    setNumber,
    actualRepsOrDuration,
    restAfterSetSeconds,
  });
}

// Additional helper functions for workout sessions
export async function getSessionsByUser(userId) {
  const res = await api.get(`/sessions?userId=${userId}`);
  return res.data;
}

export async function getSessionsByDateRange(userId, startDate, endDate) {
  const res = await api.get(`/sessions`, {
    params: {
      userId,
      startDate,
      endDate,
    },
  });
  return res.data;
}
