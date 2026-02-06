package app

import (
	"net/http"

	"github.com/lemonc7/renamer/controller"
	"github.com/lemonc7/zest"
	"github.com/lemonc7/zest/middleware"
)

func InitApp() *zest.Zest {
	app := zest.New()

	app.Use(middleware.Logger())
	app.Use(middleware.Recovery())
	app.Use(middleware.CORS())

	// 路由设置
	app.GET("/ping", func(c *zest.Context) error {
		return c.JSON(http.StatusOK, zest.Map{
			"message": "pong",
		})
	})
	
	api := app.Group("/files")
	api.GET("", controller.GetFiles)
	api.POST("", controller.CreateDir)
	api.DELETE("", controller.DeleteFiles)
	api.POST("/copy", controller.CopyFiles)
	api.POST("/move", controller.MoveFiles)
	api.POST("/preview", controller.RenamedPreview)
	api.POST("/removeTexts", controller.RemoveTextsPreview)
	api.POST("/replaceChinese", controller.ReplaceChinesePreview)
	api.POST("/rename", controller.RenamedConfirm)

	// 加载静态资源
	app.Use(middleware.Static(middleware.StaticConfig{
		Root:   "./dist",
		HTML5:  true,
		Browse: false,
	}))

	return app
}
