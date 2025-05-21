package controller

import (
	"net/http"
	"path/filepath"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

func renameFormat(request model.PathRequest, episode *string) {
	ep := *episode
	ext := filepath.Ext(ep)

	if len(ep[:len(ep)-len(ext)]) < 2 {
		*episode = "0" + *episode
	}

	if request.Season != "" {
		*episode = request.Season + "E" + *episode
	} else if regexp.MustCompile(`^[Ss]\d{1,3}$`).MatchString(filepath.Base(request.Path)) {
		*episode = filepath.Base(request.Path) + "E" + *episode
	} else {
		*episode = "S01E" + *episode
	}

}

func RenamedNames(ctx *gin.Context) {
	// 绑定JSON参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	// oldName存储原文件名，newName存储新文件名
	var oldNames, newNames []string
	// 获取文件信息
	files, err := utils.GetFiles(req.Path)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "获取文件信息失败",
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
			renameFormat(req, &newName)
			oldNames = append(oldNames, oldName)
			newNames = append(newNames, newName)
		} else {
			// 不需要重命名的文件名
			if oldName != "error" {
				oldNames = append(oldNames, oldName)
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

	ctx.JSON(http.StatusOK, gin.H{
		"oldNames": oldNames,
		"newNames": newNames,
	})

}
