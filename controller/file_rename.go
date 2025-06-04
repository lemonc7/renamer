package controller

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 重命名预览
func RenamedPreview(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}

	nameMaps, err := utils.RenamePreview(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, nameMaps)
}

// 确认重命名文件(前端预览重命名时,需要确认)
func RenamedConfirm(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON数据到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}

	// 重命名文件
	for _, entry := range req.NameMaps {
		if err := utils.RenameFiles(filepath.Join(req.Path, entry.DirName), entry.FilesName); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "重命名成功",
	})
}
