<script setup lang="ts">
import CommonHeader from "./components/CommonHeader.vue"
</script>

<template>
  <div class="common-layout">
    <el-container class="lay-container">
      <el-header class="el-header">
        <CommonHeader />
      </el-header>
      <el-main>
        <router-view :key="$route.path"/>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="less">
.common-layout,
.lay-container {
  height: 100%;
}
.el-header {
  background-color: silver;
}
html {
  overflow-y: scroll;
}

</style>
