<script setup>
import { ref, onMounted, computed } from "vue";
import {
  getCalendarRange,
  createCalendarEntry,
  updateCalendarEntry,
} from "@/api/calendar";
import { getTemplates } from "@/api/templates";
import { getExercises } from "@/api/exercises";

const currentDate = ref(new Date());
const selectedDate = ref(null);
const showPlanModal = ref(false);
const calendarEntries = ref([]);
const templates = ref([]);
const exercises = ref({});
const isLoading = ref(true);

const planForm = ref({
  templateId: null,
  customExercises: [],
  status: "Planned",
});

const currentMonth = computed(() => {
  return currentDate.value.getMonth();
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
});

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const calendarDays = computed(() => {
  const days = [];
  const totalDays = daysInMonth.value;
  const firstDay = firstDayOfMonth.value;

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null, entries: [] });
  }

  // Add days of the month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateString = date.toISOString().split("T")[0];
    const entries = calendarEntries.value.filter(
      (entry) => entry.date.split("T")[0] === dateString
    );

    days.push({
      day,
      date: dateString,
      dateObj: date,
      entries,
      isToday: dateString === new Date().toISOString().split("T")[0],
      isPast: date < new Date().setHours(0, 0, 0, 0),
    });
  }

  return days;
});

async function loadCalendarData() {
  try {
    isLoading.value = true;

    const startOfMonth = new Date(currentYear.value, currentMonth.value, 1);
    const endOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

    const startDate = startOfMonth.toISOString().split("T")[0];
    const endDate = endOfMonth.toISOString().split("T")[0];

    // Load calendar entries for the month
    calendarEntries.value = await getCalendarRange(startDate, endDate);

    // Load templates and exercises
    templates.value = await getTemplates();
    const allExercises = await getExercises();
    exercises.value = allExercises.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {});
  } catch (err) {
    console.error("Error loading calendar data:", err);
  } finally {
    isLoading.value = false;
  }
}

function previousMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  loadCalendarData();
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  loadCalendarData();
}

function selectDate(day) {
  if (!day.date) return;
  selectedDate.value = day.date;
  showPlanModal.value = true;

  // Initialize form with existing entry if available
  const existingEntry = day.entries[0];
  if (existingEntry) {
    planForm.value = {
      templateId: existingEntry.templateId,
      customExercises: existingEntry.customItems || [],
      status: existingEntry.status,
    };
  } else {
    planForm.value = {
      templateId: null,
      customExercises: [],
      status: "Planned",
    };
  }
}

async function savePlan() {
  if (!selectedDate.value) return;

  try {
    const entry = {
      date: selectedDate.value,
      status: planForm.value.status,
      templateId: planForm.value.templateId,
      customItems: planForm.value.customExercises,
    };

    const existingEntry = calendarEntries.value.find(
      (e) => e.date.split("T")[0] === selectedDate.value
    );

    if (existingEntry) {
      await updateCalendarEntry(existingEntry.id, entry);
    } else {
      await createCalendarEntry(entry);
    }

    // Reload calendar data
    await loadCalendarData();

    // Close modal
    showPlanModal.value = false;
    selectedDate.value = null;
  } catch (err) {
    console.error("Error saving plan:", err);
    alert("Failed to save workout plan. Please try again.");
  }
}

function getStatusColor(status) {
  switch (status) {
    case "Completed":
      return "bg-green-500";
    case "InProgress":
      return "bg-blue-500";
    case "Planned":
      return "bg-yellow-500";
    case "Skipped":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

onMounted(loadCalendarData);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Workout Calendar</h1>
      <p class="text-gray-600">Plan and track your workout schedule</p>
    </div>

    <!-- Calendar Navigation -->
    <div class="bg-white rounded-lg shadow-md mb-6">
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <button
          @click="previousMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 class="text-xl font-semibold text-gray-900">{{ monthName }}</h2>

        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="p-6">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="p-2 text-center text-sm font-medium text-gray-700"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="aspect-square border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{
              'bg-blue-50 border-blue-300': day.isToday,
              'opacity-50': day.isPast && !day.entries.length,
              'cursor-not-allowed': !day.day,
            }"
            @click="day.day && selectDate(day)"
          >
            <div class="h-full flex flex-col">
              <div class="text-sm font-medium text-gray-900 mb-1">
                {{ day.day }}
              </div>

              <!-- Workout Indicators -->
              <div class="flex-1 space-y-1">
                <div
                  v-for="entry in day.entries.slice(0, 2)"
                  :key="entry.id"
                  class="w-full h-1.5 rounded-full"
                  :class="getStatusColor(entry.status)"
                ></div>
                <div
                  v-if="day.entries.length > 2"
                  class="text-xs text-gray-500"
                >
                  +{{ day.entries.length - 2 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-700">Planned</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-700">In Progress</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-700">Completed</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-700">Skipped</span>
        </div>
      </div>
    </div>

    <!-- Plan Modal -->
    <div
      v-if="showPlanModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">
              Plan Workout - {{ new Date(selectedDate).toLocaleDateString() }}
            </h3>
            <button
              @click="showPlanModal = false"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="savePlan" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Template</label
              >
              <select
                v-model="planForm.templateId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">Select a template</option>
                <option
                  v-for="template in templates"
                  :key="template.id"
                  :value="template.id"
                >
                  {{ template.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Status</label
              >
              <select
                v-model="planForm.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Planned">Planned</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Skipped">Skipped</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="showPlanModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
