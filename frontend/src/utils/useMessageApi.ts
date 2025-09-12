import type { MessageInstance } from "antd/es/message/interface"
import React from "react"

export const MessageContext = React.createContext<MessageInstance | null>(null)

export const useMessageApi = ():MessageInstance => {
  const ctx = React.useContext(MessageContext)
  if (!ctx) {
    throw new Error("useMessageApi必须在MessageContext.Provider中使用")
  }
  return ctx
}
