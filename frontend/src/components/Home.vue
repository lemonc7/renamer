<script setup lang="ts">
import { watch,ref } from "vue"
import { useAllDataStore } from "../stores"
import { useRoute, useRouter } from "vue-router"
import { getFile, createDir, deleteFile, renameFilesManual } from "../api/api"
import type { FileInfo, NameMaps } from "../model"
import { getSelections } from "../utils/get_selection"
import { editPasteButton } from "../utils/hundler_button"

const store = useAllDataStore()
const route = useRoute()
const router = useRouter()

const confirmCreate = async () => {
  try {
    await createDir(route.path + "/" + store.inputDirName)
    console.log("创建成功：", route.path + "/" + store.inputDirName)
    console.log(route.params.path, route.path)
  } catch (error) {
    console.error("创建失败：", error)
  } finally {
    getFile(route.path, store)
    store.createDialog = false
    store.inputDirName = ""
  }
}

const confirmDelete = async () => {
  try {
    let files = store.selectFiles.map((row) => row.name)
    await deleteFile(route.path, files)
    console.log("删除成功：", files)
  } catch (error) {
    console.error("删除失败：", error)
  } finally {
    getFile(route.path, store)
    store.deleteDialog = false
    store.selectFiles = []
  }
}

const confirmRenameManual = async () => {
  let nameMaps: NameMaps = {
    "": [
      {
        oldName: store.selectFiles[0].name,
        newName: store.newNameManual
      }
    ]
  }

  try {
    await renameFilesManual(route.path, nameMaps)
    console.log(
      "手动重命名成功：",
      store.selectFiles[0].name,
      "--->",
      store.newNameManual
    )
  } catch (error) {
    console.error("手动重命名出错", error)
  } finally {
    getFile(route.path, store)
    store.renameDialog = false
  }
}

// 控制复选框是否可以选--->文件夹
const selectable = (row: FileInfo) => row.isDir

// 点击文件夹后路由跳转
const appendRoute = (file: FileInfo) => {
  if (file.isDir) {
    let newPath = `${route.path}/${file.name}`.replace(/\/+/g, "/")
    router.push(newPath)
  }
}

const dialogVisible = ref(false)
const inputValue = ref('')

// 监听路由变化,然后调用getFile来渲染页面
watch(
  () => route.path,
  (newPath) => {
    getFile("/" + (newPath || ""), store)
    store.renamePreviewButton = true
    store.selectFiles = []
    store.showPasteButton = { type: "", show: false }
    store.hiddenDeleteButton = true
    store.hiddenRenameButton = true
  },
  { immediate: true } //立即执行一次
)
</script>

<template>
  <div class="container">
    <el-card class="home" shadow="hover">
      <el-row class="header">
        <el-col :span="12">
          <el-breadcrumb separator="/" :key="$route.path">
            <el-breadcrumb-item :to="{ path: '/home' }">
              home
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/home/lemoncnas' }">
              lemonc
            </el-breadcrumb-item>
            <el-breadcrumb-item>second page</el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>

        <el-col :span="12" class="button-group">
          <el-button-group>
            <el-button
              type="primary"
              plain
              icon="ArrowLeft"
              title="上一级"
              @click="$router.go(-1)"
            ></el-button>
            <el-button
              type="primary"
              plain
              icon="ArrowRight"
              title="下一级"
              @click="$router.go(1)"
            ></el-button>
          </el-button-group>

          <el-button-group>
            <el-button
              type="primary"
              plain
              icon="FolderAdd"
              title="新建文件夹"
              @click="store.createDialog = true"
            ></el-button>
            <el-button
              type="danger"
              plain
              icon="Delete"
              title="删除文件"
              @click="store.deleteDialog = true"
              :disabled="store.hiddenDeleteButton"
            ></el-button>
            <el-button
              type="primary"
              icon="edit"
              title="重命名"
              plain
              @click="store.renameDialog = true"
              :disabled="store.hiddenRenameButton"
            ></el-button>
          </el-button-group>

          <el-dialog
            v-model="store.createDialog"
            title="Tips"
            width="500"
            style="text-align: left"
            @keyup.enter="confirmCreate"
            @close="((store.createDialog = false), (store.inputDirName = ''))"
          >
            <el-input
              v-model="store.inputDirName"
              placeholder="创建文件夹：请输入目录名"
              autofocus
            ></el-input>
            <template #footer>
              <div class="create_footer">
                <el-button @click="store.createDialog = false">
                  返回
                </el-button>
                <el-button
                  type="primary"
                  @click="confirmCreate"
                  :disabled="!store.inputDirName"
                >
                  确认
                </el-button>
              </div>
            </template>
          </el-dialog>

          <el-dialog
            v-model="store.deleteDialog"
            title="Tips"
            width="500"
            style="text-align: left"
            @close="store.deleteDialog = false"
          >
            <span style="margin-left: 30px; font-size: 16px"
              >确认删除文件/目录？</span
            >
            <template #footer>
              <div class="delete_footer">
                <el-button @click="store.deleteDialog = false">
                  返回
                </el-button>
                <el-button type="primary" @click="confirmDelete">
                  确认
                </el-button>
              </div>
            </template>
          </el-dialog>

          <el-dialog
            v-model="store.renameDialog"
            title="Tips"
            width="500"
            style="text-align: left"
            @keyup.enter="confirmRenameManual"
            @close="((store.renameDialog = false), (store.newNameManual = ''))"
          >
            <el-input
              v-model="store.newNameManual"
              placeholder="重命名：请输入新的文件名"
            ></el-input>
            <template #footer>
              <div class="rename_footer">
                <el-button
                  @click="
                    ((store.renameDialog = false), (store.newNameManual = ''))
                  "
                >
                  返回
                </el-button>
                <el-button
                  @click="confirmRenameManual"
                  :disabled="!store.newNameManual"
                  type="primary"
                  >确认</el-button
                >
              </div>
            </template>
          </el-dialog>

          <el-button-group>
            <el-button
              type="primary"
              plain
              icon="CopyDocument"
              title="复制"
              @click="editPasteButton('warning', store)"
            ></el-button>
            <el-button
              :type="store.showPasteButton.type"
              plain
              icon="Checked"
              title="粘贴"
              :disabled="!store.showPasteButton.show"
              @click="editPasteButton('', store)"
            ></el-button>
            <el-button
              type="primary"
              plain
              icon="Scissor"
              title="剪切"
              @click="editPasteButton('danger', store)"
            ></el-button>
          </el-button-group>
        </el-col>
      </el-row>

      <el-table
        :data="store.fileList"
        empty-text="无文件"
        @selection-change="
          (selection: FileInfo[]) => getSelections(selection, store)
        "
      >
        <el-table-column
          type="selection"
          :selectable="selectable"
        ></el-table-column>
        <el-table-column label="名称" prop="name" width="600">
          <template #default="{ row }">
            <el-button
              class="fileSelect"
              :icon="row.isDir ? 'Folder' : 'Document'"
              @click="appendRoute(row)"
              plain
            >
              {{ row.name }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="类型" prop="type" width="100" />
        <el-table-column label="大小" prop="size" width="100" />
        <el-table-column label="修改时间" prop="modTime" />
      </el-table>
    </el-card>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  justify-content: center;
  min-height: 80vh;
  margin-top: 30px;
  .home {
    width: 60%;
    .header {
      color: black;
      height: 40px;
    }
    .table {
      font-size: medium;
    }
  }
}
.button-group {
  text-align: right;
  .el-button-group {
    margin-right: 20px;
  }
}

.fileSelect {
  border-color: transparent;
  background: transparent;
}
</style>
