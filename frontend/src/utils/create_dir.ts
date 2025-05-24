import { ElMessageBox,ElMessage } from "element-plus"
import { createDir } from "../api/api"
import axios from "axios"


export async function createDirDialog() {
  try {
    const {value} = await ElMessageBox.prompt(
      "请输入文件夹名称",
      "Tip",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        inputPattern: /\S+/,
        inputErrorMessage: "文件夹名称不能为空"
      }
    )
    if (value) {
      const res = createDir(value)
      ElMessage.success("提交成功！")
      console.log(res);
      
    }
  }catch (error) {
    if (error === "cancel") {
      console.log("用户主动取消");
      return
    }
    if (axios.isAxiosError(error)) {
      ElMessage.error(`接口错误：${error.response?.data?.message || "未知错误" }`)
      return
    }
    if (error instanceof Error) {
      ElMessage.error(`系统错误：${error.message}`)
    }
  }
}