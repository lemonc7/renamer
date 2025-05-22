<script setup lang="ts">
import { useAllDataStore } from "../stores"

const store = useAllDataStore()
</script>

<template>
  <div class="header">
    <router-link to="/home">
      <el-button icon="house">主页</el-button>
    </router-link>
    

    <el-select
      v-model="store.modeSection"
      placeholder="选择文件处理方式"
      style="width: 180px"
    >
      <el-option
        v-for="item in store.modeOption"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>

    <el-button icon="refresh">刷新</el-button>
  </div>
</template>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}
</style>
