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
	var req model.PathRequest
	// 绑定JSON参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		return
	}
	var nameMaps []model.NameMap

	// 获取文件信息
	for _, entry := range req.NameMaps {
		// oldName存储原文件名，newName存储新文件名
		var names []model.Name
		var newNames []string
		files, err := utils.GetFiles(req.Path + "/" + entry.DirName)

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
				renameFormat(entry.DirName, &newName)
				names = append(names, model.Name{
					OldName: oldName,
					NewName: newName,
				})
				newNames = append(newNames, newName)
			} else {
				// 不需要重命名的文件名
				if oldName != "error" {
					names = append(names, model.Name{
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

		nameMaps = append(nameMaps, model.NameMap{
			DirName:   entry.DirName,
			FilesName: names,
		})
	}
	// 这里不传gin.H,这样前端获取的数据不符合预期
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
		if err := utils.RenameFiles(req.Path+"/"+entry.DirName, entry.FilesName); err != nil {
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
