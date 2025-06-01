package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
)

type bodyWriter struct {
	gin.ResponseWriter               // 原本的gin响应
	body               *bytes.Buffer // 缓存区，将gin响应数据写到这里保存，方便后续处理
}

func (w bodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)                  // 将数据写到缓存区
	return w.ResponseWriter.Write(b) //正常返回原本逻辑
}

func ErrorLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		bw := &bodyWriter{body: bytes.NewBuffer(nil), ResponseWriter: ctx.Writer}
		ctx.Writer = bw // 替换原本的gin原本的Writer,gin在执行ctx.JSON(...)...时会执行ctx.Writer.Write,也就是bw.Write
		ctx.Next()      // 不影响后续的业务

		var resp map[string]any
		// 拦截JSON格式，如果不是JSON就跳过
		if err := json.Unmarshal(bw.body.Bytes(), &resp); err != nil {
			return
		}

		// 打印error信息
		if errMsg, ok := resp["error"]; ok {
			fmt.Println("[ERROR] ", errMsg)
		}
	}
}
