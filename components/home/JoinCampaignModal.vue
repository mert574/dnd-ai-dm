<template>
  <Modal :is-open="isOpen" title="Join Campaign">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Campaign Code
        </label>
        <input 
          v-model="form.campaignCode"
          type="text"
          required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="Enter campaign code"
        >
      </div>
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Character
        </label>
        <select
          v-model.number="form.characterId"
          required
          :disabled="!characters?.length"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a character</option>
          <option v-for="character in characters" :key="character.id" :value="character.id">
            {{ character.name }} (Level {{ character.level }} {{ character.race }} {{ character.class }})
          </option>
        </select>
        <p v-if="!characters?.length" class="text-sm text-gray-400 mt-1">
          No characters available. Create a character first.
        </p>
      </div>
      <div class="flex gap-3">
        <button 
          type="submit"
          :disabled="loading || !form.campaignCode.trim() || !form.characterId || !characters?.length"
          class="flex-1 bg-stone-600 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
        >
          Join Campaign
        </button>
        <button 
          type="button"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
          @click="handleCancel"
        >
          Cancel
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import type { Character } from '~/server/db/types';

interface Props {
  isOpen: boolean;
  loading: boolean;
  characters?: Character[];
}

interface JoinData {
  campaignCode: string;
  characterId: number;
}

interface Emits {
  join: [data: JoinData];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  campaignCode: '',
  characterId: null as number | null
});

function handleSubmit() {
  if (!form.value.characterId) return;
  
  emit('join', {
    campaignCode: form.value.campaignCode,
    characterId: form.value.characterId
  });
  resetForm();
}

function handleCancel() {
  resetForm();
  emit('cancel');
}

function resetForm() {
  form.value.campaignCode = '';
  form.value.characterId = null;
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});
</script>