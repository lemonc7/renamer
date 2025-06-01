package controller

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 移除文件名中的指定字符串
func RemoveTexts(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,nameMaps和removeTexts参数",
		})
		return
	}

	var nameMaps []model.NameMap
	// 获取文件信息
	for _, entry := range req.NameMaps {
		files, err := utils.GetFiles(filepath.Join(req.Path,entry.DirName))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		var names []model.Name
		var newNames []string
		// 遍历文件信息，获取原文件名和新文件名
		for _, file := range files {
			if !file.IsDir {
				newName := utils.RemoveTexts(file.Name, req.RemovedTexts)
				newNames = append(newNames, newName)
				names = append(names, model.Name{
					OldName: file.Name,
					NewName: newName,
				})
			}
			// 新名称重复就报错
			if err := utils.ElementRepeat(newNames); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		}
		nameMaps = append(nameMaps, model.NameMap{
			DirName:   entry.DirName,
			FilesName: names,
		})
	}
	ctx.JSON(http.StatusOK, nameMaps)
}
