import { getFiles } from "src/api/api"
import type { FileInfo } from "src/model"
import { route } from "src/router"

export function useFiles() {
  let data = $state<FileInfo[]>([])
  let error = $state<any>(null)

  let isFetching = $state(false)
  let reqID = 0

  async function refetch() {
    const currentID = ++reqID
    isFetching = true
    error = null

    try {
      const path = route.pathname
      const res = await getFiles(path)
      if (currentID === reqID) {
        data = res
      }
    } catch (err) {
      if (currentID === reqID) {
        error = err
      }
      throw err
    } finally {
      if (currentID === reqID) {
        isFetching = false
      }
    }
  }

  $effect(() => {
    route.pathname
    refetch()
  })

  return {
    get data() {
      return data
    },
    get isFetching() {
      return isFetching
    },
    get error() {
      return error
    },
    refetch
  }
}
