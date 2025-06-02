<template>
  <el-dialog
    v-model="store.showTidySeriesDialog"
    title="整理剧集目录"
    width="500px"
    @close="cancel"
  >
    <el-form label-width="100px">
      <el-form-item label="剧集名">
        <el-input v-model="store.series" placeholder="请输入剧集名" />
      </el-form-item>

      <el-form-item
        v-for="item in store.selectFiles.filter((p) => p.isDir)"
        :key="item.name"
        :label="item.name"
      >
        <el-select v-model="item.season" placeholder="请选择季数">
          <el-option
            v-for="n in 100"
            :key="n"
            :label="`S${String(n - 1).padStart(2, '0')}`"
            :value="`S${String(n - 1).padStart(2, '0')}`"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirmTidySeries" :disabled="hiddenConfirmButton">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { createDir, moveFile, renameFiles, renamePreview } from "../api/api"
import type { NameMap } from "../model"
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
const store = useAllDataStore()
const route = useRoute()


const hiddenConfirmButton = computed(() => {
  if (!store.series || store.selectFiles.some(item => item.isDir && !item.season)) {
    return true
  } 
  return false
})

const confirmTidySeries = async () => {
  let nameMaps: NameMap[] = []
  let dirs: string[] = []
  store.selectFiles
    .filter((p) => p.isDir && p.season)
    .forEach((item) => {
      nameMaps.push({
        dirName: "",
        filesName: [
          {
            oldName: item.name,
            newName: item.season!
          }
        ]
      })
      dirs.push(item.season!)
    })
  try {
    await renameFiles(route.path, nameMaps)
    await createDir(route.path + "/" + store.series)
    await moveFile(route.path, route.path + "/" + store.series, dirs)
    await renamePreview(route.path + "/" + store.series, dirs, store)
    store.modePreviewDialog = true
  } catch (error) {
    throw error
  } finally {
    store.showTidySeriesDialog = false
    store.selectFiles.forEach((item) => {
      if (item.isDir) {
        item.season = ""
      }
    })
  }
}

function cancel() {
  store.showTidySeriesDialog = false
  store.selectFiles.forEach((item) => {
    if (item.isDir) {
      item.season = ""
    }
  })
}
</script>
