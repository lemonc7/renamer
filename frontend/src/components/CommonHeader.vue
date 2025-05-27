<script setup lang="ts">
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
import { renamePreview } from "../api/api"
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
        console.log(store.nameMaps);
        
      } catch (error) {
        ElMessage.error(
          `${error instanceof Error ? error.message : String(error)}`
        )
        store.previewRenameDialog = false
      }
      break
    default:
      break
  }
}

// const modeConfirmButton = async () => {
//   try {
//     switch (store.modeSection) {
//       case 1:
//         let dirs: string[] = []
//         store.selectFiles.forEach((row) => {
//           if (row.isDir) {
//             dirs.push(row.name)
//           }
//         })
//         store.previewRenameDialog = true
//         await renamePreview(route.path, dirs, store)
//         break
//       default:
//         console.log("未选择方法")
//     }
//   } catch (error) {
//     console.error("请求失败:", error)
//   }
// }

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
        @close="store.previewRenameDialog = false"
      >
        <el-tabs type="border-card">
          <el-tab-pane
            v-for="[groupKey, groupItems] in Object.entries(store.nameMaps)"
            :label="groupKey"
            :key="groupKey"
          >
            <el-table :data="Array.isArray(groupItems) ? groupItems : []">
              <el-table-column prop="oldName" label="原名称"></el-table-column>
              <el-table-column prop="newName" label="新名称"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
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
