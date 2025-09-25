<script setup>
import { ref } from "vue";
import { createExercise, updateExercise } from "@/api/exercises";

const exercise = ref({
  name: "",
  description: "",
  muscleGroup: "",
});

const isEdit = ref(false);

async function saveExercise() {
  try {
    if (isEdit.value) {
      await updateExercise(exercise.value.id, exercise.value);
      alert("Exercise updated!");
    } else {
      await createExercise(exercise.value);
      alert("Exercise created!");
    }
    exercise.value = { name: "", description: "", muscleGroup: "" };
  } catch (err) {
    console.error("Error saving exercise", err);
  }
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEdit ? "Edit" : "Add" }} Exercise
    </h1>
    <form @submit.prevent="saveExercise" class="space-y-3">
      <div>
        <label class="block font-semibold">Name</label>
        <input
          v-model="exercise.name"
          type="text"
          class="border rounded px-2 py-1 w-full"
          required
        />
      </div>

      <div>
        <label class="block font-semibold">Description</label>
        <textarea
          v-model="exercise.description"
          class="border rounded px-2 py-1 w-full"
        ></textarea>
      </div>

      <div>
        <label class="block font-semibold">Muscular Group</label>
        <input
          v-model="exercise.muscleGroup"
          type="text"
          class="border rounded px-2 py-1 w-full"
        />
      </div>

      <button
        type="submit"
        class="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        💾 Save
      </button>
    </form>
  </div>
</template>
