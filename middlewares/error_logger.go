package middlewares

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

// 自定义响应写入器,来捕获响应体
type bodyWriter struct {
	http.ResponseWriter
	body *bytes.Buffer
}

// 写入数据到缓冲区,并转发到原始写入器
func (w *bodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func ErrorLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 创建自定义的写入器并替换原始写入器
			buf := bytes.NewBuffer(nil)
			originWriter := c.Response().Writer
			customWriter := &bodyWriter{
				ResponseWriter: originWriter,
				body:           buf,
			}
			c.Response().Writer = customWriter

			// 执行后续中间件和业务逻辑
			if err := next(c); err != nil {
				return err
			}

			// 解析响应体,检查error字段
			var resp map[string]any
			if jsonErr := json.Unmarshal(buf.Bytes(), &resp); jsonErr != nil {
				return nil
			}

			if errMsg, ok := resp["error"]; ok {
				fmt.Printf("\033[31m[ERROR]\033[0m %v\n", errMsg)
			}

			return nil
		}
	}
}
