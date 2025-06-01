package controller

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 获取目录下的文件列表
func GetFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定Query请求参数到结构体
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path参数",
		})
		return
	}

	files, err := utils.GetFiles(req.Path)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 返回JSON响应数据
	ctx.JSON(http.StatusOK, files)
}

// 根据路径创建文件夹(父文件夹必须存在)
func CreateDirs(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path参数",
		})
		return
	}

	// 检查目录是否存在
	_, err := os.Stat(req.Path)
	// 返回错误信息: 目录已存在
	if err == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "目录已存在: " + req.Path,
		})
		return
	}

	// 创建目录
	if err := os.Mkdir(req.Path, 0755); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 返回成功信息
	ctx.JSON(http.StatusOK, gin.H{
		"message": "目录创建成功",
	})
}

// 根据路径删除文件或目录
func DeleteFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}

	if err := utils.DeleteFiles(req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "删除成功",
	})
}

// 复制文件
func CopyFiles(ctx *gin.Context) {
	var req model.PathRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,targetPath和nameMaps参数",
		})
		return
	}

	if err := utils.CopyFiles(req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "复制成功",
	})

}

// 移动文件
func MoveFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,targetPath和nameMaps参数",
		})
		return
	}

	if err := utils.MoveFiles(req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "移动成功",
	})

}
