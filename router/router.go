package router

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/lemonc7/renamer/controller"

	"github.com/lemonc7/renamer/model"
)

func SetupRouter() *echo.Echo {
	app := echo.New()

	// 全局处理错误
	app.HTTPErrorHandler = func(err error, c echo.Context) {
		// 默认错误码
		code := http.StatusInternalServerError
		var msg any
		// 判断err类型,转化为字符串
		switch he := err.(type) {
		case *echo.HTTPError:
			code = he.Code
			msg = fmt.Sprintf("%v", he.Message)
		default:
			msg = err.Error()
		}

		// 打印error到终端
		if code >= 500 {
			fmt.Printf("\033[31m[ERROR]\033[0m %v\n", msg)
		} else {
			fmt.Printf("\033[33m[WARN] \033[0m %v\n", msg)
		}
		
		// 返回响应
		c.JSON(code, echo.Map{
			"error": msg,
		})
	}

	// 跨域
	app.Use(middleware.CORS())
	// 异常恢复
	app.Use(middleware.Recover())

	// 日志打印
	app.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           "${custom} ${time_custom} | ${status} | ${remote_ip} | ${latency_human} | ${method} ${uri}\n",
		CustomTimeFormat: "2006/01/02 - 15:04:05",
		CustomTagFunc: func(c echo.Context, buf *bytes.Buffer) (int, error) {
			status := c.Response().Status
			
			switch {
			case status >= 500:
				// 服务器错误
				return buf.WriteString("\033[31m[ERROR]\033[0m")
			case status >= 400:
				// 客户端错误
				return buf.WriteString("\033[33m[WARN] \033[0m")
			default:
				return buf.WriteString("\033[32m[INFO] \033[0m")
			}
		},
	}))

	// 注册验证参数的方法
	validate := validator.New()
	app.Validator = &model.CustomValidator{Validator: validate}

	// 路由设置
	app.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "pong")
	})
	api := app.Group("/api/files")
	api.GET("", controller.GetFiles)
	api.POST("", controller.CreateDirs)
	api.DELETE("", controller.DeleteFiles)
	api.POST("/copy", controller.CopyFiles)
	api.POST("/move", controller.MoveFiles)
	api.POST("/preview", controller.RenamedPreview)
	api.POST("/removeTexts", controller.RemoveTextsPreview)
	api.POST("/replaceChinese", controller.ReplaceChinesePreview)
	api.POST("/rename", controller.RenamedConfirm)

	// 加载静态资源
	app.Static("/assets", "./dist/assets")

	// 路由优先级: 静态路由 > 静态资源加载 > 通配路由; 不需要显式处理,直接通配跳转到index.html
	app.GET("/*", func(c echo.Context) error {
		return c.File("./dist/index.html")
	})

	return app
}
