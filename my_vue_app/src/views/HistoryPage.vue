<script setup>
import { ref, onMounted, computed } from "vue";
import { getCalendarRange } from "@/api/calendar";
import { getExercises } from "@/api/exercises";

const startDate = ref(() => {
  const date = new Date();
  date.setDate(date.getDate() - 30); // Default to last 30 days
  return date.toISOString().slice(0, 10);
});
const endDate = ref(new Date().toISOString().slice(0, 10));
const calendarEntries = ref([]);
const exercises = ref({});
const isLoading = ref(true);
const selectedStatus = ref("");

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "Completed", label: "Completed" },
  { value: "Planned", label: "Planned" },
  { value: "InProgress", label: "In Progress" },
  { value: "Skipped", label: "Skipped" },
];

const filteredEntries = computed(() => {
  return calendarEntries.value.filter((entry) => {
    return !selectedStatus.value || entry.status === selectedStatus.value;
  });
});

const completedWorkouts = computed(() => {
  return filteredEntries.value.filter((entry) => entry.status === "Completed");
});

const totalWorkouts = computed(() => completedWorkouts.value.length);

const totalExercises = computed(() => {
  return completedWorkouts.value.reduce((total, entry) => {
    return total + (entry.customItems?.length || 0);
  }, 0);
});

const workoutsByMonth = computed(() => {
  const grouped = {};
  filteredEntries.value.forEach((entry) => {
    const date = new Date(entry.date);
    const monthKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(entry);
  });
  return grouped;
});

async function loadHistory() {
  try {
    isLoading.value = true;

    // Load calendar entries for the date range
    calendarEntries.value = await getCalendarRange(
      startDate.value,
      endDate.value
    );

    // Load all exercises to get names
    const allExercises = await getExercises();
    exercises.value = allExercises.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {});
  } catch (err) {
    console.error("Error loading history", err);
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusColor(status) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-300";
    case "Skipped":
      return "bg-red-100 text-red-800 border-red-300";
    case "InProgress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

onMounted(() => {
  startDate.value = (() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  })();
  loadHistory();
});
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Training History</h1>
      <p class="text-gray-600">Track your workout progress and achievements</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Filter by Date Range
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >From</label
          >
          <input
            type="date"
            v-model="startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input
            type="date"
            v-model="endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Status</label
          >
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2 lg:col-span-1">
          <button
            @click="loadHistory"
            class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Loading workout history...</p>
    </div>

    <!-- Stats Cards -->
    <div
      v-else-if="calendarEntries.length > 0"
      class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Completed Workouts</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ totalWorkouts }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-blue-600"
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
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Exercises</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ totalExercises }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Entries</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ calendarEntries.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Workout History List -->
    <div
      v-if="!isLoading && calendarEntries.length === 0"
      class="text-center py-12 bg-gray-50 rounded-lg"
    >
      <svg
        class="mx-auto h-24 w-24 text-gray-400 mb-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        No workout history found
      </h3>
      <p class="text-gray-600 mb-6">
        Try adjusting your date range or start working out!
      </p>
      <router-link
        to="/"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </router-link>
    </div>

    <div v-else-if="!isLoading" class="space-y-4">
      <div
        v-for="entry in calendarEntries"
        :key="entry.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ formatDate(entry.date) }}
              </h3>
              <p class="text-gray-600 text-sm">
                {{ entry.customItems?.length || 0 }} exercises planned
              </p>
            </div>
            <div class="flex items-center">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                :class="getStatusColor(entry.status)"
              >
                {{ entry.status }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="entry.customItems?.length > 0" class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in entry.customItems"
              :key="item.id"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <h4 class="font-medium text-gray-900 mb-2">
                {{ exercises[item.exerciseId]?.name || "Unknown Exercise" }}
              </h4>
              <div class="space-y-1 text-sm text-gray-600">
                <p class="flex items-center">
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
                </p>
                <p class="flex items-center">
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
                </p>
                <p class="flex items-center">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ Math.floor(item.targetRestSeconds / 60) }}m
                  {{ item.targetRestSeconds % 60 }}s rest
                </p>
              </div>
              <div
                v-if="item.notes"
                class="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded"
              >
                <p class="text-sm text-yellow-800">{{ item.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-4 text-gray-500 text-center">
          No exercises recorded for this day
        </div>
      </div>
    </div>
  </div>
</template>
