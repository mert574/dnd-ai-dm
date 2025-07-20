<template>
  <Modal :is-open="isOpen" title="Create New Campaign">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Campaign Name
        </label>
        <input 
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="Enter campaign name"
        >
      </div>
      <div class="flex gap-3">
        <button 
          type="submit"
          :disabled="loading || !form.name.trim()"
          class="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
        >
          Create Campaign
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
interface Props {
  isOpen: boolean;
  loading: boolean;
}

interface Emits {
  create: [data: { name: string }];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  name: ''
});

function handleSubmit() {
  emit('create', { name: form.value.name });
  form.value.name = '';
}

function handleCancel() {
  form.value.name = '';
  emit('cancel');
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.value.name = '';
  }
});
</script>