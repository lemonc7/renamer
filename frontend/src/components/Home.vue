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
      inputPattern: /^[^\s\/\0]+$/,
      inputErrorMessage: "无效的名称"
    })

    try {
      await createDir(route.path + "/" + value)
      ElMessage.success("创建成功")
      getFile(route.path, store)
    } catch (error) {
      ElMessage.error(
        `${error instanceof Error ? error.message : String(error)}`
      )
    }
  } catch (error) {
    ElMessage.info("操作取消")
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm("确认删除文件/目录?", "Warning", {
      confirmButtonText: "确认",
      cancelButtonText: "返回",
      type: "warning"
    })
    let files = store.selectFiles.map((row) => row.name)

    try {
      await deleteFile(route.path, files)
      ElMessage.success("成功删除")
      getFile(route.path, store)
    } catch (error) {
      ElMessage.error(
        `${error instanceof Error ? error.message : String(error)}`
      )
    }
  } catch (error) {
    ElMessage.info("删除取消")
  }
}

const confirmRenameFile = async () => {
  try {
    let { value } = await ElMessageBox.prompt("请输入新名称", "Tip", {
      confirmButtonText: "确认",
      cancelButtonText: "返回",
      inputPattern: /^[^\s\/\0]+$/,
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
        ElMessage.success("重命名成功")
        getFile(route.path, store)
      } catch (error) {
        ElMessage.error(
          `${error instanceof Error ? error.message : String(error)}`
        )
      }
    } else {
      ElMessage.warning("新名称与旧名称一致")
    }
  } catch (error) {
    ElMessage.info("操作取消")
  }
}

// 点击文件夹后路由跳转
const appendRoute = async (file: FileInfo) => {
  if (file.isDir) {
    let newPath = `${route.path}/${file.name}`.replace(/\/+/g, "/")
    try {
      await getFile(decodeURIComponent(newPath), store)
      router.push(newPath)
    } catch (error) {
      ElMessage.error(
        `${error instanceof Error ? error.message : String(error)}`
      )
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
      fullName: pathArray.slice(1,-3).join("/"),
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
      // 中文字符被重复编码,从而出现乱码
      let decodedPath = decodeURIComponent("/" + (newPath || "/"))
      await getFile(decodedPath, store)
    } catch (error) {
      ElMessage.error(
        `${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      store.hiddenModeButton = true
      store.selectFiles = []
      // store.showPasteButton = { type: "", show: false }
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
      ElMessage.success("复制成功")
    } else {
      editPasteButton("danger", store)
      ElMessage.success("剪切成功")
    }
  } catch (error) {
    store.loadFilesName = []
    store.originalPath = ""
    ElMessage.error(`${error instanceof Error ? error.message : String(error)}`)
  }
}

const copyOrMoveFiles = async () => {
  if (store.loadFilesName.length === 0 && store.originalPath === "") {
    ElMessage.error("没有选中文件")
  } else {
    try {
      await ElMessageBox.confirm("确认复制/移动文件？", "Warning", {
        confirmButtonText: "确认",
        cancelButtonText: "返回",
        type: "warning"
      })
      try {
        if (store.showPasteButton.type === "warning") {
          await copyFile(store.originalPath, route.path, store.loadFilesName)
          ElMessage.success("复制成功")
        } else if (store.showPasteButton.type === "danger") {
          await moveFile(store.originalPath, route.path, store.loadFilesName)
          ElMessage.success("移动成功")
        } else {
          ElMessage.warning("没有识别到操作")
        }
      } catch (error) {
        ElMessage.error(
          `${error instanceof Error ? error.message : String(error)}`
        )
      }
    } catch (error) {
      ElMessage.info("操作取消")
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
                {{
                  item.name
                }}
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
