<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAllDataStore } from "../stores"
import { useRoute, useRouter } from "vue-router"
import { getFile } from "../api/api"

const store = useAllDataStore()

const showPasteButton = ref({
  type: "",
  show: false
})

const editPasteButton = (type: string) => {
  if (type === "") {
    showPasteButton.value.show = false
    showPasteButton.value.type = ""
  } else {
    showPasteButton.value.show = true
    showPasteButton.value.type = type
  }
}

const route = useRoute()
const router = useRouter()
const capPath = "/" + route.params.path

const appendRoute = (path: string) => {
  let newPath = `${route.path}/${path}`.replace(/\/+/g, "/")
  router.push(newPath)
}

onMounted(getFile(capPath))
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
            ></el-button>
            <el-button
              type="primary"
              plain
              icon="DocumentDelete"
              title="删除文件"
            ></el-button>
          </el-button-group>

          <el-button-group>
            <el-button
              type="primary"
              plain
              icon="CopyDocument"
              title="复制"
              @click="editPasteButton('warning')"
            ></el-button>
            <el-button
              :type="showPasteButton.type"
              plain
              icon="Checked"
              title="粘贴"
              :disabled="!showPasteButton.show"
              @click="editPasteButton('')"
            ></el-button>
            <el-button
              type="primary"
              plain
              icon="Scissor"
              title="剪切"
              @click="editPasteButton('danger')"
            ></el-button>
          </el-button-group>
        </el-col>
      </el-row>

      <el-table :data="store.fileList">
        <el-table-column type="selection"></el-table-column>
        <el-table-column label="名称" prop="name" width="700">
          <template #default="{ row }">
            <el-button
              class="fileSelect"
              :icon="row.isDir ? 'Folder' : 'Document'"
              @click="appendRoute(row.name)"
              plain
            >
              {{ row.name }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="大小" prop="size" width="200" />
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
