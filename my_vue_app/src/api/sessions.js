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
