package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/controller"
	"github.com/lemonc7/renamer/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	// 得先 Use 中间件，才能使用中间件的功能
	r.Use(middleware.Cors())

	r.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	api := r.Group("/api/files")
	{
		api.GET("", controller.GetFiles)
		api.POST("", controller.CreateDirs)
		api.DELETE("", controller.DeleteFiles)
		api.POST("/copy", controller.CopyFiles)
		api.POST("/move", controller.MoveFiles)
		api.POST("/preview", controller.RenamedPreview)
		api.POST("/rename", controller.RenamedFiles)
	}

	return r
}
