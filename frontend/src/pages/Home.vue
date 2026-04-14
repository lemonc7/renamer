<template>
  <div>
    <div v-if="isLoading">加载中...</div>
    <div v-else-if="error">请求失败: {{ error.message }}</div>
    <div v-else>
      <div v-for="file in files" :key="file.id">
        <span @click="goto(file.name)">
          {{ file.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useFiles } from "../composables/useFiles"

const router = useRouter()

function goto(target: string) {
  router.push(target)
}

const { files, isLoading, error } = useFiles()
</script>
