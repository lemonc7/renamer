package router

import (
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/lemonc7/renamer/controller"
	"github.com/lemonc7/renamer/model"
)

func SetupRouter() *echo.Echo {
	app := echo.New()

	app.Use(middleware.CORS())
	app.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `${time_rfc3339} | ${remote_ip} | ${status} | ${latency_human} | ${method} ${uri}` + "\n",
	}))

	// 注册验证参数的方法
	validate := validator.New()
	app.Validator = &model.CustomValidator{Validator: validate}

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

	// 非api请求返回到index.html
	app.GET("/*", func(c echo.Context) error {
		if strings.HasPrefix(c.Request().URL.Path, "/api/") {
			return echo.ErrNotFound
		}
		return c.File("./dist/index.html")
	})

	return app
}
