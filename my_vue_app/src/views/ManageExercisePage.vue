<script setup>
import { ref, onMounted, computed } from "vue";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/api/exercises";
import ExerciseForm from "@/components/ExerciseForm.vue";

const exercises = ref([]);
const isLoading = ref(true);
const selectedExercise = ref(null);
const showForm = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");

const categories = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
];

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const filteredExercises = computed(() => {
  return exercises.value.filter((exercise) => {
    const matchesSearch =
      !searchQuery.value ||
      exercise.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (exercise.description &&
        exercise.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()));

    const matchesCategory =
      !selectedCategory.value || exercise.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const exercisesByCategory = computed(() => {
  const grouped = {};
  filteredExercises.value.forEach((exercise) => {
    const category = exercise.category || "Uncategorized";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(exercise);
  });
  return grouped;
});

async function loadExercises() {
  try {
    isLoading.value = true;
    exercises.value = await getExercises();
  } catch (err) {
    console.error("Error loading exercises", err);
  } finally {
    isLoading.value = false;
  }
}

function openForm(exercise = null) {
  selectedExercise.value = exercise;
  showForm.value = true;
}

function closeForm() {
  selectedExercise.value = null;
  showForm.value = false;
}

async function handleFormSave() {
  await loadExercises();
  closeForm();
}

async function removeExercise(id) {
  if (
    !confirm(
      "Are you sure you want to delete this exercise? This action cannot be undone."
    )
  )
    return;

  try {
    await deleteExercise(id);
    await loadExercises();
  } catch (err) {
    console.error("Error deleting exercise", err);
    alert("Failed to delete exercise. Please try again.");
  }
}

function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

onMounted(loadExercises);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Exercise Management
          </h1>
          <p class="text-gray-600">
            Create, edit, and organize your exercise library
          </p>
        </div>
        <button
          @click="openForm()"
          class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Exercise
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Search Exercises</label
          >
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by name or description..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Filter by Category</label
          >
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Loading exercises...</p>
    </div>

    <!-- No Exercises State -->
    <div
      v-else-if="exercises.length === 0"
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
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        No exercises found
      </h3>
      <p class="text-gray-600 mb-6">
        Start building your exercise library by adding your first exercise!
      </p>
      <button
        @click="openForm()"
        class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Your First Exercise
      </button>
    </div>

    <!-- No Filtered Results -->
    <div
      v-else-if="filteredExercises.length === 0"
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
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        No exercises match your filters
      </h3>
      <p class="text-gray-600 mb-6">
        Try adjusting your search or category filter
      </p>
      <button
        @click="
          searchQuery = '';
          selectedCategory = '';
        "
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Clear Filters
      </button>
    </div>

    <!-- Exercises Grid -->
    <div v-else class="space-y-8">
      <!-- Stats -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">
              {{ exercises.length }}
            </div>
            <div class="text-sm text-gray-600">Total Exercises</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">
              {{ Object.keys(exercisesByCategory).length }}
            </div>
            <div class="text-sm text-gray-600">Categories</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">
              {{ filteredExercises.length }}
            </div>
            <div class="text-sm text-gray-600">Showing</div>
          </div>
        </div>
      </div>

      <!-- Exercise Cards -->
      <div
        v-for="(categoryExercises, categoryName) in exercisesByCategory"
        :key="categoryName"
      >
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ categoryName }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            v-for="exercise in categoryExercises"
            :key="exercise.id"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    {{ exercise.name }}
                  </h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ exercise.category || "Uncategorized" }}
                    </span>
                    <span
                      v-if="exercise.difficulty"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getDifficultyColor(exercise.difficulty)"
                    >
                      {{ exercise.difficulty }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="openForm(exercise)"
                    class="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
                    title="Edit exercise"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="removeExercise(exercise.id)"
                    class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete exercise"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <p
                v-if="exercise.description"
                class="text-gray-600 text-sm mb-4 line-clamp-3"
              >
                {{ exercise.description }}
              </p>

              <div class="grid grid-cols-3 gap-2 text-sm text-gray-600">
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {{ exercise.defaultSets || "N/A" }}
                  </div>
                  <div class="text-xs">Sets</div>
                </div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {{ exercise.defaultReps || "N/A" }}
                  </div>
                  <div class="text-xs">Reps</div>
                </div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {{
                      exercise.defaultRestSeconds
                        ? Math.floor(exercise.defaultRestSeconds / 60) + "m"
                        : "N/A"
                    }}
                  </div>
                  <div class="text-xs">Rest</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto"
      >
        <ExerciseForm
          :exercise="selectedExercise"
          @close="closeForm"
          @saved="handleFormSave"
        />
      </div>
    </div>
  </div>
</template>
