import type { Character } from '~/server/db/types';

interface CreateCharacterData {
  name: string;
  class: string;
  race: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  armorClass: number;
  hitDice: string;
}

export function useCharacters() {
  const characters = ref<Character[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function createCharacter(data: CreateCharacterData): Promise<Character | null> {
    try {
      loading.value = true;
      error.value = '';

      const response = await $fetch<{ data: Character }>('/api/characters', {
        method: 'POST',
        body: data,
      });

      const character = response.data;
      characters.value.unshift(character);
      return character;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Failed to create character';
      error.value = errorMessage;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserCharacters(): Promise<void> {
    try {
      loading.value = true;
      error.value = '';

      const response = await $fetch<{ data: Character[] }>('/api/characters');
      characters.value = response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Failed to fetch characters';
      error.value = errorMessage;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCharacter(id: number): Promise<boolean> {
    try {
      loading.value = true;
      error.value = '';

      await $fetch(`/api/characters/${id}`, {
        method: 'DELETE'
      });

      characters.value = characters.value.filter(char => char.id !== id);
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message || 'Failed to delete character';
      error.value = errorMessage;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    createCharacter,
    fetchUserCharacters,
    deleteCharacter,
    characters: readonly(characters),
    loading: readonly(loading),
    error: readonly(error),
  };
}