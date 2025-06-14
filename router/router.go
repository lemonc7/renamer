package router

import (
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

	// 异常恢复
	app.Use(middleware.Recover())

	// 跨域
	app.Use(middleware.CORS())

	// 日志打印
	app.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogURI:      true,
		LogRemoteIP: true,
		LogLatency:  true,
		LogMethod:   true,
		LogError:    true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			// 解析error信息
			code, errMsg := parseError(v.Error)
			fmt.Printf("[INFO]  %v | %v | %-15v | %12v | %-6v %v\n",
				v.StartTime.Format("2006/01/02 - 15:04:05"),
				code,
				v.RemoteIP,
				v.Latency,
				v.Method,
				v.URI,
			)
			
			// 打印error到终端
			if code >= 500 {
				fmt.Printf("\033[31m[ERROR]\033[0m %s\n", errMsg)
			} else if code >= 400 {
				fmt.Printf("\033[33m[WARN] \033[0m %s\n", errMsg)
			}

			return nil
		},
	}))

	// 全局处理错误
	app.HTTPErrorHandler = func(err error, c echo.Context) {
		// 如果已经响应客户端,就不做处理
		if c.Response().Committed {
			return
		}

		code, errMsg := parseError(err)

		// 返回响应
		c.JSON(code, echo.Map{
			"error": errMsg,
		})
	}

	// 注册验证参数的方法
	validate := validator.New()
	app.Validator = &model.CustomValidator{Validator: validate}

	// 路由设置
	app.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{
			"message": "pong",
		})
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

	// 路由优先级: 静态路由(/xxx) > 参数路由(/xxx/:xx) > 匹配路由(/*); 不需要显式处理,直接通配跳转到index.html
	app.GET("/*", func(c echo.Context) error {
		return c.File("./dist/index.html")
	})

	return app
}

// 处理错误信息,兼容error,*echo.HTTPError(code,error),*echo.HTTPError(code,string)
func parseError(err error) (code int, msg string) {
	// 如果已经响应,直接返回code 200(防止日志出错)
	if err == nil {
		return http.StatusOK, ""
	}

	// 处理*echo.HTTPError错误
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		// 判断Message的错误类型
		switch msgType := he.Message.(type) {
		case error:
			msg = msgType.Error()
		case string:
			msg = msgType
		default:
			msg = fmt.Sprintf("%v", msgType)
		}
		return code, msg
	}

	// 处理标准error, code默认500
	code = http.StatusInternalServerError
	msg = err.Error()
	return code, msg

}
