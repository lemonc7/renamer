<script setup lang="ts">
import { ref } from 'vue';
import { useAllDataStore } from '../stores';
import axios from 'axios';


const store = useAllDataStore();

const showPasteButton = ref({
    type: 'warning',
    show: false,
})
const editPasteButton = (type: string) => {
    if(type === '') {
        showPasteButton.value.show = false
        showPasteButton.value.type = 'warning'
    } else {
        showPasteButton.value.show = true
        showPasteButton.value.type = type
    }
}

async function testPing() {
    const res = await axios({
        url: 'http://192.168.100.2:7777/api/files',
        method: 'GET',
        params: {
            path: '/vol1/1000/tools/project/go/renamer'
        }
    })
    store.fileList = res.data
    store.checkFile()
}

testPing()

</script>

<template>
    <div class="container">
        <el-card class="home" shadow="hover">

            <el-row class="header">
                <el-col :span="12">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">homepage</el-breadcrumb-item>
                        <el-breadcrumb-item>
                        <a href="/">first page</a>
                        </el-breadcrumb-item>
                        <el-breadcrumb-item>second page</el-breadcrumb-item>
                    </el-breadcrumb>
                </el-col>

                <el-col :span="12" class="button-group">
                    <el-button-group>
                        <el-button type="primary" plain icon="ArrowLeft" title="上一级"></el-button>
                        <el-button type="primary" plain icon="ArrowRight" title="下一级"></el-button>
                    </el-button-group>

                    <el-button-group>
                        <el-button type="primary" plain icon="FolderAdd" title="新建文件夹"></el-button>
                        <el-button type="primary" plain icon="DocumentDelete" title="删除文件"></el-button>
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
                            v-if="showPasteButton.show"
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

            <el-table
                class="table"
                ref="multipleTable"
                :data="store.fileList"
            >
                <el-table-column
                    v-for="(value, key) in store.fileLable"
                    :prop="key"
                    :key="key"
                    :label="value"
                >
                </el-table-column>
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

</style>