package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/controller"
	"github.com/lemonc7/renamer/dist"
	"github.com/lemonc7/renamer/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	// 得先 Use 中间件，才能使用中间件的功能
	r.Use(middleware.Cors())
	r.Use(middleware.ErrorLogger())
	r.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// 重定向到home(通过home来访问前端---前端配置的base=/home,暂时没找到好方法)
	r.GET("/", func(ctx *gin.Context) {
		ctx.Redirect(http.StatusFound, "/home")
	})
	// 加载前端资源
	r.StaticFS("/home", http.FS(dist.Static))

	// 未知路由重新跳到/home,因为默认的路由是访问后端的API,暂时先这样弄
	r.NoRoute(func(ctx *gin.Context) {
		ctx.Redirect(http.StatusFound, "/home")
	})

	api := r.Group("/api/files")
	{
		api.GET("", controller.GetFiles)
		api.POST("", controller.CreateDirs)
		api.DELETE("", controller.DeleteFiles)
		api.POST("/copy", controller.CopyFiles)
		api.POST("/move", controller.MoveFiles)
		api.POST("/preview", controller.RenamedPreview)
		api.POST("/rename", controller.RenamedConfirm)
		api.POST("/replaceChinese", controller.ReplaceChinesePreview)
		api.POST("/removeTexts", controller.RemoveTextsPreview)
	}

	return r
}
