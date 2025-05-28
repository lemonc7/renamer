<script setup lang="ts">
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
import { getFile, renameFiles, renamePreview } from "../api/api"
import router from "../router"

const route = useRoute()
const store = useAllDataStore()
const modeConfirmButton = async () => {
  switch (store.modeSection) {
    case 1:
      let dirs: string[] = []
      store.selectFiles.forEach((row) => {
        if (row.isDir) {
          dirs.push(row.name)
        }
      })
      try {
        await renamePreview(route.path, dirs)
        store.previewRenameDialog = true
      } catch (error) {
        ElMessage.error(
          `${error instanceof Error ? error.message : String(error)}`
        )
        store.previewRenameDialog = false
      }
      break
    default:
      ElMessage.warning("功能待完成")
      break
  }
}

const confirmAutoRename = async () => {
  try {
    await renameFiles(route.path, store.nameMaps)
    ElMessage.success("重命名成功")
    getFile(route.path, store)
  } catch (error) {
    ElMessage.error(`${error instanceof Error ? error.message : String(error)}`)
  } finally {
    store.previewRenameDialog = false
    store.nameMaps = []
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
        @click="modeConfirmButton"
        :disabled="store.hiddenModeButton"
      >
        确认
      </el-button>

      <!-- 重命名预览,选择需要重命名的文件 -->
      <el-dialog
        v-model="store.previewRenameDialog"
        title="重命名预览"
        width="700"
        @close="((store.previewRenameDialog = false), (store.nameMaps = []))"
      >
        <el-tabs type="border-card">
          <el-tab-pane
            v-for="item in store.nameMaps"
            :label="item.dirName"
            :key="item.dirName"
          >
            <el-table :data="item.filesName">
              <el-table-column prop="oldName" label="原名称"></el-table-column>
              <el-table-column prop="newName" label="新名称"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <div class="mode-footer">
            <el-button @click="store.previewRenameDialog = false"
              >返回</el-button
            >
            <el-button type="primary" @click="confirmAutoRename">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>
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
