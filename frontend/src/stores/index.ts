import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAllDataStore = defineStore('allData', ()=>{
    const isCollapse = ref(false)

    const modeOption = [
        {
            value: 1,
            label: '重命名'
        },
        {
            value: 2,
            label: '替换中文'
        },
        {
            value: 3,
            label: '移除指定文本'
        }
    ]

    const modeSection = ref()

    const fileList = ref([
        {
            name: 'test1.txt',
            size: '100KB',
            isDir: false,
            modTime:'2022-01-01 12:00:00'
        },
        {
            name: 'test2.txt',
            size: '100KB',
            isDir: false,
            modTime:'2022-01-01 12:00:00'
        },
        {
            name: 'test3',
            size: '100KB',
            isDir: true,
            modTime:'2022-01-01 12:00:00'
        },
    ])

    for (let i = 0; i < 100; i++) {

    }

    const fileLable = {
        name: '名称',
        size: '大小',
        modTime: '修改时间'
    }

    const checkFile = () => {
        fileList.value.forEach((file) => {
            if (file.isDir) {
                file.size = '-'
            }
        })
    }

    return {
        isCollapse,
        modeOption,
        modeSection,
        fileList,
        fileLable,
        checkFile
    }
})
