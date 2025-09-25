import api from "./client";

export async function getTemplates() {
  const res = await api.get("/templates");
  return res.data;
}

export async function getTemplate(id) {
  const res = await api.get(`/templates/${id}`);
  return res.data;
}

export async function createTemplate(template) {
  const res = await api.post("/templates", template);
  return res.data;
}

export async function updateTemplate(id, template) {
  await api.put(`/templates/${id}`, template);
}

export async function deleteTemplate(id) {
  await api.delete(`/templates/${id}`);
}
