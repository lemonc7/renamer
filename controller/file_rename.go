package controller

import (
	"net/http"
	"path/filepath"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 重命名标准格式输出
func renameFormat(dir string, episode *string) {
	ep := *episode
	ext := filepath.Ext(ep)

	if len(ep[:len(ep)-len(ext)]) < 2 {
		*episode = "0" + *episode
	}

	if regexp.MustCompile(`^[Ss]\d{1,3}$`).MatchString(dir) {
		*episode = dir + "E" + *episode
	} else {
		*episode = "S01E" + *episode
	}

}

// 重命名预览
func RenamedPreview(ctx *gin.Context) {
	// 绑定JSON参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}
	newnameMaps := make(map[string][]model.Names)
	// 获取文件信息
	for key := range req.NameMaps {
		// oldName存储原文件名，newName存储新文件名
		var nameMaps []model.Names
		var newNames []string
		files, err := utils.GetFiles(req.Path+"/"+key)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		// 遍历文件信息，获取原文件名和新文件名
		for _, file := range files {
			// 获取待处理文件名
			ignore, oldName := utils.GetPendingFile(file)
			if ignore {
				// 需要重命名的文件名
				newName, err := utils.ExtractEpisode(oldName)
				if err != nil {
					ctx.JSON(http.StatusInternalServerError, gin.H{
						"error": err.Error(),
					})
					return
				}
				// 输出SxxExx文件名
				renameFormat(key, &newName)
				nameMaps = append(nameMaps, model.Names{
					OldName: oldName,
					NewName: newName,
				})
				newNames = append(newNames, newName)
			} else {
				// 不需要重命名的文件名
				if oldName != "error" {
					nameMaps = append(nameMaps, model.Names{
						OldName: oldName,
						NewName: oldName,
					})
					newNames = append(newNames, oldName)
				}
			}
		}

		// 判断是否会有重名文件,有的话直接报错
		if err := utils.ElementRepeat(newNames); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		// 是否自动进行重命名,不进行确认
		if req.AutoRename {
			if err := utils.RenameFiles(req.Path+"/"+key, nameMaps); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		}
		newnameMaps[key] = append(newnameMaps[key], nameMaps...)
	}

	if req.AutoRename {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "自动重命名成功",
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"nameMaps": newnameMaps,
	})

}

// 确认重命名文件(前端预览重命名时,确认需要重命名的文件)
func RenamedFiles(ctx *gin.Context) {
	// 绑定JSON数据到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}

	// 重命名文件
	for key, value := range req.NameMaps {
		if err := utils.RenameFiles(req.Path+"/"+key, value); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "重命名成功",
	})
}
