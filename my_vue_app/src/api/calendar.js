import api from "./client";

export async function getCalendarRange(start, end) {
  const res = await api.get("/calendar", {
    params: { start, end },
  });
  return res.data;
}

export async function getCalendarEntry(id) {
  const res = await api.get(`/calendar/${id}`);
  return res.data;
}

export async function createCalendarEntry(entry) {
  const res = await api.post("/calendar", entry);
  return res.data;
}

export async function updateCalendarEntry(id, entry) {
  await api.put(`/calendar/${id}`, entry);
}

export async function deleteCalendarEntry(id) {
  await api.delete(`/calendar/${id}`);
}
