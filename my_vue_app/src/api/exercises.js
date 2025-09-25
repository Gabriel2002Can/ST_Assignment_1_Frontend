import api from "./client";

export async function getExercises() {
  const res = await api.get("/exercises");
  return res.data;
}

export async function createExercise(exercise) {
  const res = await api.post("/exercises", exercise);
  return res.data;
}

export async function updateExercise(id, exercise) {
  await api.put(`/exercises/${id}`, exercise);
}

export async function deleteExercise(id) {
  await api.delete(`/exercises/${id}`);
}
