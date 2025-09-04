import { create } from "zustand"

interface SavedSeries {
  savedSeries: string
  setSavedSeries: (series: string) => void
}

export const useSavedSeries = create<SavedSeries>((set) => ({
  savedSeries: "",
  setSavedSeries: (series: string) => set({ savedSeries: series })
}))
