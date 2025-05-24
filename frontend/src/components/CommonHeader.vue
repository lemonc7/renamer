<script setup lang="ts">
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
import { renamePreview } from "../api/api"

const route = useRoute()
const store = useAllDataStore()

const confirmRename = async () => {
  if (store.selectFiles.length > 0 && store.selectFiles[0].isDir) {
    let fullPath = `${route.path}/${store.selectFiles[0].name}`
    try {
      await renamePreview(fullPath, "S02", true)
      console.log("请求成功")
    } catch (err) {
      console.error("请求失败", err)
    }
  }
}

</script>

<template>
  <div class="header">
    <router-link to="/home">
      <el-button icon="house">主页</el-button>
    </router-link>

    <div>
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
      <el-button
        icon="pointer"
        style="margin-left: 10px"
        @click="confirmRename()"
        :disabled="store.renamePreviewButton"
      >
        确认
      </el-button>
    </div>

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
