<template>
  <div class="min-h-screen bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-100 mb-2">Character Builder</h1>
        <p class="text-gray-400">Create your D&D character</p>
      </div>

      <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <!-- Step Progress -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div
v-for="(step, index) in steps" :key="step.id" 
                 class="flex items-center"
                 :class="{ 'flex-1': index < steps.length - 1 }">
              <div class="flex items-center">
                <div
class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                     :class="getStepClasses(index)">
                  <span class="text-sm font-medium">{{ index + 1 }}</span>
                </div>
                <span
class="ml-3 text-sm font-medium"
                      :class="currentStep >= index ? 'text-gray-100' : 'text-gray-500'">
                  {{ step.title }}
                </span>
              </div>
              <div
v-if="index < steps.length - 1" 
                   class="flex-1 h-0.5 mx-4 transition-colors"
                   :class="currentStep > index ? 'bg-red-500' : 'bg-gray-600'"/>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 0" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Character Name</label>
                <input
v-model="characterData.name" 
                       type="text" 
                       required
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                       placeholder="Enter character name">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Class</label>
                <select
v-model="characterData.class" 
                        required
                        class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500">
                  <option value="">Select Class</option>
                  <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Race</label>
                <select
v-model="characterData.race" 
                        required
                        class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500">
                  <option value="">Select Race</option>
                  <option v-for="race in races" :key="race" :value="race">{{ race }}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <input
v-model.number="characterData.level" 
                       type="number" 
                       min="1" 
                       max="20" 
                       required
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500">
              </div>
            </div>
          </div>

          <!-- Step 2: Ability Scores -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-100">Ability Scores</h2>
              <button
type="button" 
                      class="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors"
                      @click="rollAbilityScores">
                Roll Scores
              </button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div v-for="ability in abilities" :key="ability.key">
                <label class="block text-sm font-medium text-gray-300 mb-2">{{ ability.name }}</label>
                <input
v-model.number="characterData[ability.key as keyof typeof characterData]" 
                       type="number" 
                       min="1" 
                       max="30" 
                       required
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500">
              </div>
            </div>
          </div>

          <!-- Step 3: Combat Stats -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Combat Statistics</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Max Hit Points</label>
                <input
v-model.number="characterData.maxHp" 
                       type="number" 
                       min="1" 
                       required
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Armor Class</label>
                <input
v-model.number="characterData.armorClass" 
                       type="number" 
                       min="1" 
                       required
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Hit Dice</label>
                <input
v-model="characterData.hitDice" 
                       type="text" 
                       required
                       placeholder="e.g., 1d8"
                       class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500">
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
v-if="currentStep > 0" 
                    type="button"
                    class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    @click="previousStep">
              Previous
            </button>
            <div v-else/>
            
            <button
v-if="currentStep < steps.length - 1"
                    type="button" 
                    :disabled="!isCurrentStepValid"
                    class="px-6 py-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    @click="nextStep">
              Next
            </button>
            
            <button
v-else
                    type="submit"
                    :disabled="loading || !isFormValid"
                    class="px-6 py-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
              {{ loading ? 'Creating...' : 'Create Character' }}
            </button>
          </div>
        </form>

        <!-- Error Display -->
        <div v-if="error" class="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
          <p class="text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)
const error = ref('')

const steps = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'abilities', title: 'Ability Scores' },
  { id: 'combat', title: 'Combat Stats' }
]

const characterData = ref({
  name: '',
  class: '',
  race: '',
  level: 1,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  maxHp: 8,
  armorClass: 10,
  hitDice: '1d8'
})

const classes = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
]

const races = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling'
]

const abilities = [
  { key: 'strength', name: 'Strength' },
  { key: 'dexterity', name: 'Dexterity' },
  { key: 'constitution', name: 'Constitution' },
  { key: 'intelligence', name: 'Intelligence' },
  { key: 'wisdom', name: 'Wisdom' },
  { key: 'charisma', name: 'Charisma' }
]

function getStepClasses(index: number) {
  if (currentStep.value > index) {
    return 'bg-red-500 border-red-500 text-white'
  } else if (currentStep.value === index) {
    return 'bg-red-700 border-red-700 text-white'
  } else {
    return 'bg-gray-700 border-gray-600 text-gray-400'
  }
}

function rollAbilityScores() {
  function rollStat() {
    return Math.floor(Math.random() * 15) + 8
  }
  
  characterData.value.strength = rollStat()
  characterData.value.dexterity = rollStat()
  characterData.value.constitution = rollStat()
  characterData.value.intelligence = rollStat()
  characterData.value.wisdom = rollStat()
  characterData.value.charisma = rollStat()
}

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 0:
      return !!(characterData.value.name && characterData.value.class && characterData.value.race && characterData.value.level)
    case 1:
      return true
    case 2:
      return !!(characterData.value.maxHp && characterData.value.armorClass && characterData.value.hitDice)
    default:
      return false
  }
})

const isFormValid = computed(() => {
  return !!(
    characterData.value.name &&
    characterData.value.class &&
    characterData.value.race &&
    characterData.value.level &&
    characterData.value.maxHp &&
    characterData.value.armorClass &&
    characterData.value.hitDice
  )
})

function nextStep() {
  if (currentStep.value < steps.length - 1 && isCurrentStepValid.value) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    const { data } = await $fetch('/api/characters', {
      method: 'POST',
      body: characterData.value
    })

    if (data) {
      await router.push('/')
    }
  } catch (err: unknown) {
    error.value = (err as { data?: { message?: string } })?.data?.message || 'Failed to create character'
  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: 'auth'
})
</script>