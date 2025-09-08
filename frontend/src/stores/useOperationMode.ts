import { create } from "zustand"
import { OperationMode } from "../models"

interface Operation {
  operationMode: OperationMode
  setOperation: (operation: OperationMode) => void
}

export const useOperationMode = create<Operation>((set) => ({
  operationMode: OperationMode.Rename,
  setOperation: (operation: OperationMode) => set({ operationMode: operation })
}))
