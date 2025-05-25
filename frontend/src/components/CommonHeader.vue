<script setup lang="ts">
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
import { renamePreview } from "../api/api"
import router from "../router"

const route = useRoute()
const store = useAllDataStore()

const confirmRename = async () => {
  let dirs: string[] = []
  store.selectFiles.forEach((row) => {
    if (row.isDir) {
      dirs.push(row.name)
    }
  })

  try {
    await renamePreview(route.path, true, dirs, store)
    console.log("请求成功:", dirs)
  } catch (err) {
    console.error("请求失败:", err)
  }
}

const refreshPage = () => {
  let currentRoute = router.currentRoute.value.path
  router.push("/ping").then(() => {
    router.push(currentRoute)
  })
}
</script>

<template>
  <div class="header">
    <router-link to="/home">
      <el-button icon="house">主页</el-button>
    </router-link>

    <div>
      <el-select v-model="store.modeSection" style="width: 180px">
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
        @click="confirmRename"
        :disabled="store.renamePreviewButton"
      >
        确认
      </el-button>
    </div>

    <el-button icon="refresh" @click="refreshPage">刷新</el-button>
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
