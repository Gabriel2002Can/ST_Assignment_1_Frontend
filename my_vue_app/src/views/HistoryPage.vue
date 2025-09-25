<script setup>
import { ref, onMounted } from "vue";
import { getCalendarRange } from "@/api/calendar";

const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const calendarEntries = ref([]);
const isLoading = ref(true);

async function loadHistory() {
  try {
    isLoading.value = true;
    calendarEntries.value = await getCalendarRange(
      startDate.value,
      endDate.value
    );
  } catch (err) {
    console.error("Error loading history", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadHistory);
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Training History</h1>

    <div class="flex gap-2 mb-4">
      <input type="date" v-model="startDate" class="border rounded px-2 py-1" />
      <input type="date" v-model="endDate" class="border rounded px-2 py-1" />
      <button
        @click="loadHistory"
        class="bg-blue-500 text-white px-4 py-1 rounded"
      >
        🔄 Update
      </button>
    </div>

    <div v-if="isLoading">Loading...</div>
    <ul v-else>
      <li
        v-for="entry in calendarEntries"
        :key="entry.id"
        class="mb-2 p-3 border rounded"
      >
        <strong>{{ new Date(entry.date).toLocaleDateString() }}</strong>
        <span class="ml-2 text-gray-600">Status: {{ entry.status }}</span>
        <ul class="ml-4 mt-2 list-disc">
          <li v-for="item in entry.customItems" :key="item.id">
            {{ item.exercise?.name || "Exercise" }} - {{ item.targetReps }} reps
            x {{ item.targetSets }} sets
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
