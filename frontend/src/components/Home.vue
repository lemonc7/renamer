<script setup lang="ts">
import { watch, computed } from "vue"
import { useAllDataStore } from "../stores"
import { useRoute, useRouter } from "vue-router"
import {
  getFile,
  createDir,
  deleteFile,
  renameFiles,
  copyFile,
  moveFile
} from "../api/api"
import type { FileInfo, NameMap } from "../model"
import { getSelections } from "../utils/get_selection"
import { editPasteButton } from "../utils/handler_button"

const store = useAllDataStore()
const route = useRoute()
const router = useRouter()

const confirmCreate = async () => {
  try {
    let { value } = await ElMessageBox.prompt("请输入文件夹名称", "Tip", {
      confirmButtonText: "确认",
      cancelButtonText: "返回",
      inputPattern: /^(?!\s*$)(?!.*\/)[\s\S]*$/,
      inputErrorMessage: "无效的名称"
    })

    try {
      await createDir(route.path + "/" + value)
      ElMessage({
        showClose: true,
        message: "创建成功",
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
    }
  } catch (error) {
    ElMessage({
      showClose: true,
      message: "操作取消",
      type: "info",
      duration: store.elmsgShowTime
    })
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm("确认删除文件/目录?", "Warning", {
      confirmButtonText: "确认",
      cancelButtonText: "返回",
      type: "warning"
    })

    try {
      await deleteFile(route.path, store)
      ElMessage({
        showClose: true,
        message: "删除成功",
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
    }
  } catch (error) {
    ElMessage({
      showClose: true,
      message: "删除取消",
      type: "info",
      duration: store.elmsgShowTime
    })
  }
}

const confirmRenameFile = async () => {
  try {
    let { value } = await ElMessageBox.prompt("请输入新名称", "Tip", {
      confirmButtonText: "确认",
      cancelButtonText: "返回",
      inputPattern: /^(?!\s*$)(?!.*\/)[\s\S]*$/,
      inputErrorMessage: "无效的名称",
      inputValue: store.selectFiles[0].name
    })
    let nameMap: NameMap[] = [
      {
        dirName: "",
        filesName: [{ oldName: store.selectFiles[0].name, newName: value }]
      }
    ]

    if (store.selectFiles[0].name !== value) {
      try {
        await renameFiles(route.path, nameMap)
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
      }
    } else {
      ElMessage({
        showClose: true,
        message: "新旧名称一致",
        type: "warning",
        duration: store.elmsgShowTime
      })
    }
  } catch (error) {
    ElMessage({
      showClose: true,
      message: "操作取消",
      type: "info",
      duration: store.elmsgShowTime
    })
  }
}

// 点击文件夹后路由跳转
const appendRoute = async (file: FileInfo) => {
  if (file.isDir) {
    let newPath = `${route.path}/${file.name}`.replace(/\/+/g, "/")
    try {
      await getFile(newPath, store)
      router.push(newPath)
    } catch (error) {
      ElMessage({
        showClose: true,
        message: `${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: store.elmsgShowTime
      })
    }
  }
}

// 获取路由,映射面包屑路径
const breadcurmbItems = computed(() => {
  // 通过/分隔符取出路由的各个文件,通过filter过滤空字符
  const pathArray = route.path
    .split("/")
    .filter((p) => p)
    .map(decodeURIComponent)
  const items = []
  let stringShowLength = 8

  // 路径不超过4个直接显示
  if (pathArray.length <= 4) {
    pathArray.forEach((name, index) => {
      items.push({
        name:
          name.length > stringShowLength
            ? name.slice(0, stringShowLength) + "..."
            : name,
        fullName: name,
        //判断是否是最后一个元素,如果是就为空,不允许跳转,否则就通过slice选取文件路径,然后通过/分隔连接
        to:
          index === pathArray.length - 1
            ? null
            : `/${pathArray.slice(0, index + 1).join("/")}`
      })
    })
  } else {
    // 超过4个就取第1个和最后3个跳转
    items.push({
      name:
        pathArray[0].length > stringShowLength
          ? pathArray[0].slice(0, stringShowLength) + "..."
          : pathArray[0],
      fullName: pathArray[0],
      to: `/${pathArray[0]}`
    })
    // 中间的用省略号
    items.push({
      name: "...",
      fullName: pathArray.slice(1, -3).join("/"),
      to: null
    })
    let lastItems = pathArray.slice(-3)
    lastItems.forEach((name, index) => {
      let originalIndex = pathArray.length - 3 + index
      items.push({
        name:
          name.length > stringShowLength
            ? name.slice(0, stringShowLength) + "..."
            : name,
        fullName: name,
        to:
          index === 2
            ? null
            : `/${pathArray.slice(0, originalIndex + 1).join("/")}`
      })
    })
  }
  return items
})

// 监听路由变化,然后调用getFile来渲染页面
watch(
  () => route.path,
  async (newPath) => {
    try {
      await getFile("/" + (newPath || "/"), store)
    } catch (error) {
      ElMessage({
        showClose: true,
        message: `${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: store.elmsgShowTime
      })
    } finally {
      store.hiddenModeButton = true
      store.selectFiles = []
      store.hiddenFilesHandlingButton = true
      store.hiddenRenameButton = true
    }
  },
  { immediate: true } //立即执行一次
)

const loadFiles = (copy: Boolean) => {
  try {
    let files = store.selectFiles.map((row) => row.name)
    store.loadFilesName = files
    store.originalPath = route.path
    if (copy) {
      editPasteButton("warning", store)
      ElMessage({
        showClose: true,
        message: "复制成功",
        type: "success",
        duration: store.elmsgShowTime
      })
    } else {
      editPasteButton("danger", store)
      ElMessage({
        showClose: true,
        message: "剪切成功",
        type: "success",
        duration: store.elmsgShowTime
      })
    }
  } catch (error) {
    store.loadFilesName = []
    store.originalPath = ""
    ElMessage({
      showClose: true,
      message: `${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: store.elmsgShowTime
    })
  }
}

const copyOrMoveFiles = async () => {
  if (store.loadFilesName.length === 0 && store.originalPath === "") {
    ElMessage({
      showClose: true,
      message: "没有选中文件",
      type: "error",
      duration: store.elmsgShowTime
    })
  } else {
    try {
      await ElMessageBox.confirm("确认复制/移动文件？", "Warning", {
        confirmButtonText: "确认",
        cancelButtonText: "返回",
        type: "warning"
      })
      try {
        if (store.showPasteButton.type === "warning") {
          await copyFile(route.path, store)
          ElMessage({
            showClose: true,
            message: "复制成功",
            type: "success",
            duration: store.elmsgShowTime
          })
        } else if (store.showPasteButton.type === "danger") {
          await moveFile(route.path, store)
          ElMessage({
            showClose: true,
            message: "移动成功",
            type: "success",
            duration: store.elmsgShowTime
          })
        } else {
          ElMessage({
            showClose: true,
            message: "没有识别到操作",
            type: "warning",
            duration: store.elmsgShowTime
          })
        }
      } catch (error) {
        ElMessage({
          showClose: true,
          message: `${error instanceof Error ? error.message : String(error)}`,
          type: "error",
          duration: store.elmsgShowTime
        })
      }
    } catch (error) {
      ElMessage({
        showClose: true,
        message: "操作取消",
        type: "info",
        duration: store.elmsgShowTime
      })
    } finally {
      store.loadFilesName = []
      store.originalPath = ""
      editPasteButton("", store)
      getFile(route.path, store)
    }
  }
}
</script>

<template>
  <div class="container">
    <el-card class="home" shadow="hover">
      <el-row class="header">
        <el-col :span="12">
          <el-breadcrumb separator="/" :key="$route.path">
            <el-breadcrumb-item
              v-for="(item, index) in breadcurmbItems"
              :key="index"
              :to="item.to"
            >
              <el-tooltip
                :content="item.fullName"
                placement="top"
                effect="light"
              >
                {{ item.name }}
              </el-tooltip>
            </el-breadcrumb-item>
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
              @click="confirmCreate"
            ></el-button>
            <el-button
              type="danger"
              plain
              icon="Delete"
              title="删除文件"
              @click="confirmDelete"
              :disabled="store.hiddenFilesHandlingButton"
            ></el-button>
            <el-button
              type="primary"
              icon="edit"
              title="重命名"
              plain
              @click="confirmRenameFile"
              :disabled="store.hiddenRenameButton"
            ></el-button>
          </el-button-group>

          <el-button-group>
            <el-button
              type="primary"
              plain
              icon="CopyDocument"
              title="复制"
              @click="loadFiles(true)"
              :disabled="store.hiddenFilesHandlingButton"
            ></el-button>
            <el-button
              :type="store.showPasteButton.type"
              plain
              icon="Checked"
              title="粘贴"
              :disabled="!store.showPasteButton.show"
              @click="copyOrMoveFiles"
            ></el-button>
            <el-button
              type="primary"
              plain
              icon="Scissor"
              title="剪切"
              @click="loadFiles(false)"
              :disabled="store.hiddenFilesHandlingButton"
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
        <el-table-column type="selection"></el-table-column>
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
