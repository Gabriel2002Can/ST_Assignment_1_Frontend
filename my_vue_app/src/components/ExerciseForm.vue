<script setup>
import { ref, watch } from "vue";
import { createExercise, updateExercise } from "@/api/exercises";

const props = defineProps({
  exercise: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "saved"]);

const form = ref({
  name: "",
  description: "",
  muscleGroup: "",
});

watch(
  () => props.exercise,
  (newVal) => {
    form.value = newVal
      ? { ...newVal }
      : { name: "", description: "", muscleGroup: "" };
  },
  { immediate: true }
);

async function save() {
  try {
    if (props.exercise && props.exercise.id) {
      await updateExercise(props.exercise.id, form.value);
    } else {
      await createExercise(form.value);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Erro saving exercise", err);
    alert("Erro saving exercise.");
  }
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <!-- Card -->
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
      <button
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        @click="emit('close')"
      >
        ✖
      </button>

      <h2 class="text-xl font-bold mb-4">
        {{ props.exercise ? "Edit Exercise" : "New Exercise" }}
      </h2>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold">Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full border rounded px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-semibold">Muscular Group</label>
          <input
            v-model="form.muscleGroup"
            type="text"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button
            type="button"
            class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            @click="emit('close')"
          >
            Cancell
          </button>

          <button
            type="submit"
            class="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
