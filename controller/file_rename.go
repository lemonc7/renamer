package controller

import (
	"net/http"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 重命名预览
func RenamedPreview(c echo.Context) error {
	req := new(model.PathRequest)

	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, err)
	}

	nameMaps, err := utils.RenamePreview(*req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, nameMaps)
}

// 确认重命名文件(前端预览重命名时,需要确认)
func RenamedConfirm(c echo.Context) error {
	req := new(model.PathRequest)

	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, err)
	}

	for _, entry := range req.NameMaps {
		if err := utils.RenameFiles(filepath.Join(req.Path, entry.DirName), entry.EpisodeOffset, entry.FilesName); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err)
		}
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "重命名成功",
	})

}
