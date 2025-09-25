import { createRouter, createWebHistory } from "vue-router";
import ExercisesPage from "@/views/ExercisesPage.vue";
import HistoryPage from "@/views/HistoryPage.vue";
import ManagePage from "@/views/ManageExercisePage.vue";

const routes = [
  { path: "/", redirect: "/exercises" },
  { path: "/exercises", component: ExercisesPage },
  { path: "/history", component: HistoryPage },
  { path: "/manage", component: ManagePage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
