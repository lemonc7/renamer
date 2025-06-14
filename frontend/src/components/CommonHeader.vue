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
import FormDialog from "./FormDialog.vue"

const route = useRoute()
const store = useAllDataStore()

const modeConfirmButton = async () => {
  try {
    switch (store.modeSection) {
      case 1:
        await renamePreview(route.path, store)
        store.modePreviewDialog = true
        break
      case 2:
        store.showTidySeriesDialog = true
        break
      case 3:
        let { value } = await ElMessageBox.prompt(
          "请输入需要删除的文本(多个用空格删除)",
          "Tip",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            inputPattern: /^(?!\s*$)(?!.*\/)[\s\S]*$/,
            inputErrorMessage: "不能为空或包含/字符"
          }
        )
        let words = value
          .split(/\s+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
        let uniqueWords = Array.from(new Set(words))
        await removeTextsPreview(route.path, uniqueWords, store)
        store.modePreviewDialog = true
        break
      case 4:
        await replaceChinesePreview(route.path, store)
        store.modePreviewDialog = true
        break
      default:
        throw new Error("未知错误")
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

const confirmAutoRename = async () => {
  try {
    await renameFiles(route.path, store.nameMaps)
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
        width="700"
        :show-close="false"
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
            <el-tooltip content="剧集偏移" placement="top" effect="light">
              <el-input-number
                v-model="item.episodeOffset"
                v-show="store.modeSection == 1"
              ></el-input-number>
            </el-tooltip>
            <el-table :data="item.filesName">
              <el-table-column prop="oldName" label="原名称"></el-table-column>
              <el-table-column prop="newName" label="新名称"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <template #header>
          <div class="mode-header">
            <span class="mode-title">重命名预览</span>
            <div>
              <el-button @click="store.modePreviewDialog = false">
                返回
              </el-button>
              <el-button type="primary" @click="confirmAutoRename">
                确认
              </el-button>
            </div>
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

.mode-header {
  display: flex;
  justify-content: space-between;

  .mode-title {
    font-size: 20px;
  }
}
</style>
