import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error'
    }
  },

  // Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        // Vue Composition API
        defineComponent: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        defineSlots: 'readonly',
        defineOptions: 'readonly',
        defineModel: 'readonly',
        withDefaults: 'readonly',
        // Vue 3 Reactivity
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        readonly: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        // Vue 3 Lifecycle
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUnmount: 'readonly',
        onUpdated: 'readonly',
        onBeforeUpdate: 'readonly',
        nextTick: 'readonly',
        // Nuxt 3 Composables
        useRouter: 'readonly',
        useRoute: 'readonly',
        useFetch: 'readonly',
        useLazyFetch: 'readonly',
        useAsyncData: 'readonly',
        useCookie: 'readonly',
        useNuxtApp: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        useRuntimeConfig: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint
    },
    rules: {
      ...vue.configs.essential.rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        }
      }]
    }
  },

  // Server-side files
  {
    files: ['server/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        // H3/Nitro/Nuxt server globals
        defineEventHandler: 'readonly',
        defineNitroPlugin: 'readonly',
        defineLazyEventHandler: 'readonly',
        readBody: 'readonly',
        getQuery: 'readonly',
        getRouterParams: 'readonly',
        getCookie: 'readonly',
        setCookie: 'readonly',
        deleteCookie: 'readonly',
        getHeader: 'readonly',
        setHeader: 'readonly',
        createError: 'readonly',
        sendRedirect: 'readonly'
      }
    }
  },

  // Nuxt config
  {
    files: ['nuxt.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        defineNuxtConfig: 'readonly'
      }
    }
  },

  // Store files
  {
    files: ['stores/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        defineStore: 'readonly',
        $fetch: 'readonly',
        NodeJS: 'readonly'
      }
    }
  },

  // General rules for all files
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error'
    }
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'data/**',
      '*.db',
      'coverage/**',
      'eslint.config.ts'
    ]
  }
]