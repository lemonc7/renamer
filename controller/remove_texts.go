package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 移除文件名中的指定字符串
func RemoveTextsPreview(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,nameMaps和removeTexts参数",
		})
		return
	}

	nameMaps, err := utils.RemoveTexts(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, nameMaps)
}
