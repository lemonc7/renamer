package controller

import (
	"net/http"
	"path/filepath"

	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
	"github.com/lemonc7/zest"
)

// 重命名预览
func RenamedPreview(c *zest.Context) error {
	var req model.RenamePreviewRequest
	if err := c.Bind(&req); err != nil {
		return err
	}

	nameMaps, err := utils.RenamePreview(req)
	if err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "重命名预览失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, nameMaps)
}

// 确认重命名文件(前端预览重命名时,需要确认)
func RenamedConfirm(c *zest.Context) error {
	var req model.RenameConfirmRequest
	if err := c.Bind(&req); err != nil {
		return err
	}
	for _, entry := range req.NameMaps {
		if err := utils.RenameFiles(filepath.Join(req.Dir, entry.Dir), entry.Files); err != nil {
			return zest.NewHTTPError(http.StatusInternalServerError, "重命名失败").Wrap(err)
		}
	}

	return c.JSON(http.StatusOK, zest.Map{
		"message": "重命名成功",
	})

}
