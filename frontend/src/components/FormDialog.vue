<template>
  <el-dialog
    v-model="store.showTidySeriesDialog"
    title="整理剧集"
    width="500px"
    @close="cancel"
  >
    <el-form>
      <el-form-item>
        <el-input v-model="store.series" placeholder="请输入剧集名" />
      </el-form-item>

      <el-form-item
        v-for="item in store.selectFiles.filter((p) => p.isDir)"
        :key="item.name"
        label-width="150px"
      >
        <template #label>
          <el-tooltip :content="item.name" placement="top" effect="light">
            <span class="form-label">{{ item.name }}</span>
          </el-tooltip>
        </template>

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
      <el-button
        type="primary"
        @click="confirmTidySeries"
        :disabled="hiddenConfirmButton"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { getFile, tidySeries } from "../api/api"
import { useAllDataStore } from "../stores"
import { useRoute } from "vue-router"
const store = useAllDataStore()
const route = useRoute()

const hiddenConfirmButton = computed(() => {
  if (store.selectFiles.some((item) => item.isDir && !item.season)) {
    return true
  }
  return false
})

const confirmTidySeries = async () => {
  try {
    await tidySeries(route.path, store)
    ElMessage({
      showClose: true,
      message: "整理完成",
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
    store.showTidySeriesDialog = false
    store.series = ""
    getFile(route.path, store)
  }
}

function cancel() {
  store.showTidySeriesDialog = false
  store.selectFiles
    .filter((item) => item.isDir)
    .forEach((item) => {
      item.season = ""
    })
  store.series = ""
}
</script>

<style lang="less" scoped>
.form-label {
  display: inline-block;
  max-width: 150px;
  overflow: hidden; // 超出部分不显示
  white-space: nowrap; // 禁止换行
}
</style>
