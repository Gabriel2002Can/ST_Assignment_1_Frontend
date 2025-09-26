import { createRouter, createWebHistory } from "vue-router";
import ExercisesPage from "@/views/ExercisesPage.vue";
import HistoryPage from "@/views/HistoryPage.vue";
import ManagePage from "@/views/ManageExercisePage.vue";
import WorkoutSessionPage from "@/views/WorkoutSessionPage.vue";
import CalendarPage from "@/views/CalendarPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: ExercisesPage,
  },
  {
    path: "/exercises",
    redirect: "/",
  },
  {
    path: "/history",
    name: "history",
    component: HistoryPage,
  },
  {
    path: "/manage",
    name: "manage",
    component: ManagePage,
  },
  {
    path: "/calendar",
    name: "calendar",
    component: CalendarPage,
  },
  {
    path: "/workout/:id",
    name: "workout-session",
    component: WorkoutSessionPage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
