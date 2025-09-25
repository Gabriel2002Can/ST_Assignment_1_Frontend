import api from "./client";

export async function getProgress(exerciseId, start, end) {
  const res = await api.get("/reports/progress", {
    params: { exerciseId, start, end },
  });
  return res.data;
}
