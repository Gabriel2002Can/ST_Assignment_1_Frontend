<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="form-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg md:text-xl font-semibold text-gray-900">
          {{ props.exercise ? "Edit Exercise" : "Create New Exercise" }}
        </h2>
        <button
          @click="emit('close')"
          aria-label="Fechar"
          class="close-btn p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="save" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
            >
              Exercise Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Push-ups, Squats, Bench Press"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Category</label
            >
            <select
              v-model="form.category"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Difficulty</label
            >
            <select
              v-model="form.difficulty"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Select difficulty</option>
              <option
                v-for="difficulty in difficulties"
                :key="difficulty"
                :value="difficulty"
              >
                {{ difficulty }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Default Sets</label
            >
            <input
              v-model="form.defaultSets"
              type="number"
              min="1"
              max="20"
              placeholder="3"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Default Reps</label
            >
            <input
              v-model="form.defaultReps"
              type="number"
              min="1"
              max="100"
              placeholder="10"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Default Rest (seconds)</label
            >
            <input
              v-model="form.defaultRestSeconds"
              type="number"
              min="0"
              max="600"
              placeholder="60"
              class="w-full px-3 py-2 h-10 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div class="md:col-span-2">
            <label
              class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide"
              >Description</label
            >
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Describe the exercise, form tips, or any special instructions..."
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100"
        >
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            {{ props.exercise ? "Update Exercise" : "Create Exercise" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
  border: 1px solid #eef2f7;
}

.close-btn svg {
  display: block;
}
</style>

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
  category: "",
  defaultSets: "",
  defaultReps: "",
  defaultRestSeconds: "",
  difficulty: "",
});

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

watch(
  () => props.exercise,
  (newVal) => {
    form.value = newVal
      ? {
          name: newVal.name || "",
          description: newVal.description || "",
          category: newVal.category || "",
          defaultSets: newVal.defaultSets || "",
          defaultReps: newVal.defaultReps || "",
          defaultRestSeconds: newVal.defaultRestSeconds || "",
          difficulty: newVal.difficulty || "",
        }
      : {
          name: "",
          description: "",
          category: "",
          defaultSets: "",
          defaultReps: "",
          defaultRestSeconds: "",
          difficulty: "",
        };
  },
  { immediate: true }
);

async function save() {
  try {
    const exerciseData = {
      ...form.value,
      defaultSets: form.value.defaultSets
        ? parseInt(form.value.defaultSets)
        : null,
      defaultReps: form.value.defaultReps
        ? parseInt(form.value.defaultReps)
        : null,
      defaultRestSeconds: form.value.defaultRestSeconds
        ? parseInt(form.value.defaultRestSeconds)
        : null,
    };

    if (props.exercise && props.exercise.id) {
      await updateExercise(props.exercise.id, exerciseData);
    } else {
      await createExercise(exerciseData);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Error saving exercise", err);
    alert("Error saving exercise. Please try again.");
  }
}
</script>
