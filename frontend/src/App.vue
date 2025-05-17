<script setup lang="ts">
import CommonHeader from './components/CommonHeader.vue';
import Home from './components/Home.vue';

</script>

<template>
    <div class="common-layout">
        <el-container class="lay-container">
            <el-header class="el-header">
                <CommonHeader />
            </el-header>
            <el-main>
                <Home />
            </el-main>
        </el-container>

    </div>
</template>

<style scoped lang="less">
.common-layout,.lay-container {
    height: 100%;
}
.el-header {
    background-color: silver;
}
</style>
