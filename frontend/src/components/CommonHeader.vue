<script setup lang="ts">
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
import {
  getFile,
  removeTextsPreview,
  renameFiles,
  renamePreview,
  replaceChinesePreview
} from "../api/api"
import router from "../router"
import { editPasteButton } from "../utils/handler_button"

const route = useRoute()
const store = useAllDataStore()

const modeConfirmButton = async () => {
  let dirs = store.selectFiles.filter((row) => row.isDir).map((row) => row.name)
  try {
    await handleModeAction(dirs)
    if (store.modeSection !== 4) {
      store.modePreviewDialog = true
    }
  } catch (error) {
    ElMessage({
      showClose: true,
      message: `${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: store.elmsgShowTime
    })
    store.modePreviewDialog = false
  }
}

const handleModeAction = async (dirs: string[]) => {
  switch (store.modeSection) {
    case 1:
      return renamePreview(route.path, dirs, store)
    case 2:
      try {
        let { value } = await ElMessageBox.prompt(
          "请输入需要删除的字符(多个用空格分隔)",
          "Tip",
          {
            confirmButtonText: "确认",
            cancelButtonText: "返回",
            inputPattern: /^(?!\s*$)(?!.*\/)[\s\S]*$/,
            inputErrorMessage: "不能为空或包含/字符"
          }
        )
        let words = value
          .split(/\s+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
        let uniqueWords = Array.from(new Set(words))
        return removeTextsPreview(route.path, dirs, uniqueWords, store)
      } catch (error) {
        throw new Error("操作取消")
      }
    case 3:
      return replaceChinesePreview(route.path, dirs, store)
    case 4:
      store.showTidySeriesDialog = true
      break
    default:
      throw new Error("功能待完成")
  }
}

const confirmAutoRename = async () => {
  try {
    if ((store.modeSection = 4)) {
      await renameFiles(route.path + "/" + store.series, store.nameMaps)
    } else {
      await renameFiles(route.path, store.nameMaps)
    }
    ElMessage({
      showClose: true,
      message: "重命名成功",
      type: "success",
      duration: store.elmsgShowTime
    })
    getFile(route.path, store)
  } catch (error) {
    ElMessage({
      showClose: true,
      message: `${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: store.elmsgShowTime
    })
  } finally {
    store.modePreviewDialog = false
    store.nameMaps = []
    store.series = ""
  }
}

const refreshPage = async () => {
  let currentRoute = router.currentRoute.value.path
  try {
    await getFile(currentRoute, store)
    ElMessage({
      showClose: true,
      message: "刷新成功",
      type: "success",
      duration: store.elmsgShowTime
    })
  } catch (error) {
    ElMessage({
      showClose: true,
      message: `${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: store.elmsgShowTime
    })
  } finally {
    editPasteButton("", store)
  }
}

import FormDialog from "./FormDialog.vue"
</script>

<template>
  <div class="header">
    <router-link to="/">
      <el-button icon="house">主页</el-button>
    </router-link>
    <FormDialog />
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
        v-model="store.modePreviewDialog"
        title="重命名预览"
        width="700"
        @close="((store.modePreviewDialog = false), (store.nameMaps = []))"
      >
        <el-tabs type="border-card">
          <el-tab-pane v-for="item in store.nameMaps" :key="item.dirName">
            <template #label>
              <el-tooltip
                :content="item.dirName"
                placement="top"
                effect="light"
              >
                <span>
                  {{
                    item.dirName.length > 6
                      ? item.dirName.slice(0, 6) + "..."
                      : item.dirName
                  }}
                </span>
              </el-tooltip>
            </template>
            <el-table :data="item.filesName">
              <el-table-column prop="oldName" label="原名称"></el-table-column>
              <el-table-column prop="newName" label="新名称"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <div class="mode-footer">
            <el-button @click="store.modePreviewDialog = false">返回</el-button>
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
