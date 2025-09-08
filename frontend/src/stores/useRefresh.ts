import { create } from "zustand"

interface Refresh {
  refreshKey: number
  setRefreshKey: () => void
}

export const useRefresh = create<Refresh>((set) => ({
  refreshKey: 0,
  setRefreshKey: () => {
    set((state) => ({ refreshKey: state.refreshKey + 1 }))
  }
}))
