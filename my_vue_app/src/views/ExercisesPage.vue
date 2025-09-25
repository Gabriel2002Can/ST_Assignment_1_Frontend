<script setup>
import { ref, onMounted } from "vue";
import { getExercises, deleteExercise } from "@/api/exercises";
import ExerciseForm from "@/components/ExerciseForm.vue";

const exercises = ref([]);
const isLoading = ref(true);
const selectedExercise = ref(null);
const showForm = ref(false);

async function loadExercises() {
  try {
    isLoading.value = true;
    exercises.value = await getExercises();
  } catch (err) {
    console.error("Erro loading exercises", err);
  } finally {
    isLoading.value = false;
  }
}

function openForm(exercise = null) {
  selectedExercise.value = exercise;
  showForm.value = true;
}

async function removeExercise(id) {
  if (!confirm("Are you sure you want to delete it?")) return;
  await deleteExercise(id);
  await loadExercises();
}

onMounted(loadExercises);
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Exercises</h1>

    <button
      @click="openForm()"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    >
      ➕ New Exercise
    </button>

    <div v-if="isLoading">Loading...</div>
    <ul v-else class="space-y-2">
      <li
        v-for="exercise in exercises"
        :key="exercise.id"
        class="p-3 bg-gray-100 rounded shadow flex justify-between"
      >
        <div>
          <strong>{{ exercise.name }}</strong>
          <p class="text-sm text-gray-600">{{ exercise.description }}</p>
        </div>
        <div class="space-x-2">
          <button
            @click="openForm(exercise)"
            class="bg-yellow-500 px-2 py-1 rounded"
          >
            ✏️
          </button>
          <button
            @click="removeExercise(exercise.id)"
            class="bg-red-500 px-2 py-1 rounded text-white"
          >
            🗑️
          </button>
        </div>
      </li>
    </ul>

    <ExerciseForm
      v-if="showForm"
      :exercise="selectedExercise"
      @close="showForm = false"
      @saved="loadExercises"
    />
  </div>
</template>
