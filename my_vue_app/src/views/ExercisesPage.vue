<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getCalendarRange } from "@/api/calendar";
import { getExercises } from "@/api/exercises";
import { startSession } from "@/api/sessions";

const router = useRouter();
const todayEntry = ref(null);
const exercises = ref({});
const isLoading = ref(true);
const currentSession = ref(null);

const today = new Date().toISOString().split("T")[0];

const todayExercises = computed(() => {
  if (!todayEntry.value?.customItems) return [];

  return todayEntry.value.customItems
    .map((item) => ({
      ...item,
      exercise: exercises.value[item.exerciseId] || {
        name: "Unknown Exercise",
        description: "",
      },
    }))
    .sort((a, b) => a.order - b.order);
});

const canStartWorkout = computed(() => {
  return todayExercises.value.length > 0 && !currentSession.value;
});

const todayStatus = computed(() => {
  if (!todayEntry.value) return "No workout planned";
  switch (todayEntry.value.status) {
    case "Planned":
      return "Ready to start";
    case "InProgress":
      return "Workout in progress";
    case "Completed":
      return "Completed";
    case "Skipped":
      return "Skipped";
    default:
      return "Unknown status";
  }
});

async function loadTodayWorkout() {
  try {
    isLoading.value = true;

    // Get today's calendar entry
    const calendarEntries = await getCalendarRange(today, today);
    todayEntry.value = calendarEntries.length > 0 ? calendarEntries[0] : null;

    if (todayEntry.value?.customItems?.length > 0) {
      // Get all unique exercise IDs
      const exerciseIds = [
        ...new Set(todayEntry.value.customItems.map((item) => item.exerciseId)),
      ];

      // Fetch exercise details
      const allExercises = await getExercises();
      exercises.value = allExercises.reduce((acc, exercise) => {
        acc[exercise.id] = exercise;
        return acc;
      }, {});
    }
  } catch (err) {
    console.error("Error loading today's workout:", err);
  } finally {
    isLoading.value = false;
  }
}

async function startWorkout() {
  if (!todayEntry.value) return;

  try {
    const session = await startSession(1, todayEntry.value.id); // Using userId = 1 for now
    currentSession.value = session;
    console.log("Workout started!", session);

    // Navigate to the workout session page
    router.push(`/workout/${session.id}`);
  } catch (err) {
    console.error("Error starting workout:", err);
    alert("Failed to start workout. Please try again.");
  }
}

function formatRestTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

onMounted(loadTodayWorkout);
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Hero Header Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-black mb-4">
          Welcome to Your Workout!
        </h1>
        <div
          class="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-lg font-semibold text-gray-700"
        >
          <i class="fas fa-calendar-day text-orange-500"></i>
          {{
            new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <div class="relative">
          <div
            class="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-6"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="fas fa-dumbbell text-orange-500 text-xl"></i>
          </div>
        </div>
        <p class="text-gray-600 font-medium">Loading your awesome workout...</p>
      </div>

      <!-- No Workout Planned -->
      <div
        v-else-if="!todayEntry"
        class="workout-card text-center py-16 max-w-2xl mx-auto"
      >
        <div class="mb-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mb-6"
          >
            <i class="fas fa-dumbbell text-white text-2xl"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            No Workout Planned Today
          </h2>
          <p class="text-gray-600 text-lg mb-8">
            Perfect day for a rest or to create an epic workout plan! 💪
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/calendar"
            class="workout-button inline-flex items-center justify-center"
          >
            <i class="fas fa-calendar-alt mr-3"></i>
            Plan Workouts
          </router-link>
          <router-link
            to="/manage"
            class="workout-button inline-flex items-center justify-center"
            style="
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            "
          >
            <i class="fas fa-plus mr-3"></i>
            Create Exercises
          </router-link>
        </div>
      </div>
      <!-- Today's Workout -->
      <div v-else class="space-y-6">
        <!-- Status Card -->
        <div
          class="bg-white rounded-lg shadow-md p-6 border-l-4"
          :class="
            todayEntry.status === 'Completed'
              ? 'border-green-500'
              : todayEntry.status === 'InProgress'
              ? 'border-blue-500'
              : todayEntry.status === 'Skipped'
              ? 'border-red-500'
              : 'border-yellow-500'
          "
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-1">
                Today's Workout Status
              </h2>
              <p class="text-gray-600">{{ todayStatus }}</p>
            </div>
            <div class="text-right">
              <div
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="
                  todayEntry.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : todayEntry.status === 'InProgress'
                    ? 'bg-blue-100 text-blue-800'
                    : todayEntry.status === 'Skipped'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ todayEntry.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Workout Exercises -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              Today's Exercises
            </h3>
            <p class="text-gray-600 text-sm">
              {{ todayExercises.length }} exercises planned
            </p>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="(item, index) in todayExercises"
              :key="item.exerciseId"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mr-3"
                    >
                      {{ index + 1 }}
                    </span>
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ item.exercise.name }}
                    </h4>
                  </div>
                  <p
                    v-if="item.exercise.description"
                    class="text-gray-600 ml-11 mb-3"
                  >
                    {{ item.exercise.description }}
                  </p>

                  <!-- Exercise Details -->
                  <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      {{ item.targetSets }} sets
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {{ item.targetReps }} reps
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-clock mr-2"></i>
                      {{ formatRestTime(item.targetRestSeconds) }} rest
                    </div>
                  </div>

                  <div
                    v-if="item.notes"
                    class="ml-11 mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                  >
                    <p class="text-sm text-yellow-800">{{ item.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <button
            v-if="canStartWorkout"
            @click="startWorkout"
            class="workout-button inline-flex items-center justify-center text-xl py-4 px-8"
          >
            <i class="fas fa-play mr-3"></i>
            Start Epic Workout!
          </button>

          <div v-else-if="currentSession" class="text-center py-6">
            <div
              class="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold text-lg"
            >
              <i class="fas fa-fire text-green-600"></i>
              Workout in Progress! You're crushing it! 💪
            </div>
          </div>

          <router-link
            to="/history"
            class="workout-button inline-flex items-center justify-center"
            style="
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            "
          >
            <i class="fas fa-history mr-3"></i>
            View Your Progress
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
