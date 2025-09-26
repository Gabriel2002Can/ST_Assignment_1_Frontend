<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSession, recordSet } from "@/api/sessions";
import { getExercises } from "@/api/exercises";

const route = useRoute();
const router = useRouter();

const session = ref(null);
const exercises = ref({});
const isLoading = ref(true);
const currentExerciseIndex = ref(0);
const currentSetNumber = ref(1);
const actualReps = ref("");
const restTime = ref(0);
const isResting = ref(false);
const restTimer = ref(null);

const sessionId = computed(() => route.params.id);

const currentExercise = computed(() => {
  if (!session.value?.sessionItems?.length) return null;
  return session.value.sessionItems[currentExerciseIndex.value];
});

const currentExerciseDetails = computed(() => {
  if (!currentExercise.value) return null;
  return exercises.value[currentExercise.value.exerciseId] || {};
});

const completedSets = computed(() => {
  if (!currentExercise.value) return 0;
  return currentExercise.value.sets?.length || 0;
});

const isWorkoutComplete = computed(() => {
  if (!session.value?.sessionItems) return false;
  return session.value.sessionItems.every(
    (item) => (item.sets?.length || 0) >= item.targetSets
  );
});

const workoutProgress = computed(() => {
  if (!session.value?.sessionItems?.length) return 0;
  const totalSets = session.value.sessionItems.reduce(
    (sum, item) => sum + item.targetSets,
    0
  );
  const completedSets = session.value.sessionItems.reduce(
    (sum, item) => sum + (item.sets?.length || 0),
    0
  );
  return Math.round((completedSets / totalSets) * 100);
});

async function loadSession() {
  try {
    isLoading.value = true;
    const sessionData = await getSession(sessionId.value);
    session.value = sessionData;

    // Load exercise details
    const allExercises = await getExercises();
    exercises.value = allExercises.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {});
  } catch (err) {
    console.error("Error loading session:", err);
  } finally {
    isLoading.value = false;
  }
}

async function recordCurrentSet() {
  if (!currentExercise.value || !actualReps.value) return;

  try {
    await recordSet(
      sessionId.value,
      currentExercise.value.exerciseId,
      completedSets.value + 1,
      actualReps.value,
      currentExercise.value.targetRestSeconds
    );

    // Refresh session data
    await loadSession();

    // Clear input
    actualReps.value = "";

    // Check if this exercise is complete
    if (completedSets.value >= currentExercise.value.targetSets) {
      // Move to next exercise
      if (currentExerciseIndex.value < session.value.sessionItems.length - 1) {
        currentExerciseIndex.value++;
      }
    } else {
      // Start rest timer
      startRestTimer();
    }
  } catch (err) {
    console.error("Error recording set:", err);
    alert("Failed to record set. Please try again.");
  }
}

function startRestTimer() {
  isResting.value = true;
  restTime.value = currentExercise.value.targetRestSeconds;

  restTimer.value = setInterval(() => {
    restTime.value--;
    if (restTime.value <= 0) {
      clearInterval(restTimer.value);
      isResting.value = false;
    }
  }, 1000);
}

function skipRest() {
  if (restTimer.value) {
    clearInterval(restTimer.value);
  }
  isResting.value = false;
  restTime.value = 0;
}

function previousExercise() {
  if (currentExerciseIndex.value > 0) {
    currentExerciseIndex.value--;
    skipRest();
  }
}

function nextExercise() {
  if (currentExerciseIndex.value < session.value.sessionItems.length - 1) {
    currentExerciseIndex.value++;
    skipRest();
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

onMounted(loadSession);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Active Workout</h1>
            <p class="text-gray-600">{{ workoutProgress }}% Complete</p>
          </div>
          <button
            @click="router.push('/')"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
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

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: workoutProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading workout session...</p>
      </div>

      <!-- Workout Complete -->
      <div
        v-else-if="isWorkoutComplete"
        class="text-center py-12 bg-green-50 rounded-lg"
      >
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-green-600"
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
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Workout Complete!</h2>
        <p class="text-gray-600 mb-6">
          Great job! You've completed all exercises.
        </p>
        <button
          @click="router.push('/')"
          class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Return Home
        </button>
      </div>

      <!-- Current Exercise -->
      <div v-else-if="currentExercise">
        <!-- Exercise Info -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ currentExerciseDetails.name }}
              </h2>
              <p class="text-gray-600">
                Exercise {{ currentExerciseIndex + 1 }} of
                {{ session.sessionItems.length }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">
                {{ completedSets }}/{{ currentExercise.targetSets }}
              </div>
              <div class="text-sm text-gray-600">Sets Complete</div>
            </div>
          </div>

          <p
            v-if="currentExerciseDetails.description"
            class="text-gray-600 mb-4"
          >
            {{ currentExerciseDetails.description }}
          </p>

          <!-- Target Info -->
          <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <div class="font-semibold text-gray-900">
                {{ currentExercise.targetSets }}
              </div>
              <div class="text-sm text-gray-600">Target Sets</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-900">
                {{ currentExercise.targetReps }}
              </div>
              <div class="text-sm text-gray-600">Target Reps</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-900">
                {{ formatTime(currentExercise.targetRestSeconds) }}
              </div>
              <div class="text-sm text-gray-600">Rest Time</div>
            </div>
          </div>
        </div>

        <!-- Rest Timer -->
        <div
          v-if="isResting"
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center"
        >
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">Rest Time</h3>
          <div class="text-4xl font-bold text-yellow-900 mb-4">
            {{ formatTime(restTime) }}
          </div>
          <button
            @click="skipRest"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Skip Rest
          </button>
        </div>

        <!-- Record Set -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Record Set {{ completedSets + 1 }}
          </h3>

          <div class="flex gap-4 items-end">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Actual Reps</label
              >
              <input
                type="number"
                v-model="actualReps"
                :placeholder="currentExercise.targetReps.toString()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              @click="recordCurrentSet"
              :disabled="!actualReps"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Record Set
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between">
          <button
            @click="previousExercise"
            :disabled="currentExerciseIndex === 0"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous Exercise
          </button>

          <button
            @click="nextExercise"
            :disabled="currentExerciseIndex === session.sessionItems.length - 1"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Exercise
          </button>
        </div>

        <!-- Previous Sets -->
        <div
          v-if="currentExercise.sets?.length > 0"
          class="bg-white rounded-lg shadow-md p-6 mt-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Previous Sets
          </h3>
          <div class="space-y-2">
            <div
              v-for="(set, index) in currentExercise.sets"
              :key="index"
              class="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span class="font-medium">Set {{ index + 1 }}</span>
              <span class="text-gray-600"
                >{{ set.actualRepsOrDuration }} reps</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
