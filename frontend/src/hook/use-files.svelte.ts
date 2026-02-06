import { getFiles } from "src/api/api"
import type { FileInfo } from "src/model"
import { route } from "src/router"

export function useFiles() {
  let data = $state<FileInfo[]>([])
  let reqID = 0

  async function refetch(targetPath?: string) {
    const currentID = ++reqID

    try {
      const path = targetPath || route.pathname
      const res = await getFiles(path)
      if (currentID === reqID) {
        data = res
      }
    } catch (err) {
      throw err
    }
  }

  $effect(() => {
    refetch(route.pathname)
  })

  return {
    get data() {
      return data
    },
    refetch
  }
}
