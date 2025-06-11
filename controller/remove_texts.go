package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 移除文件名中的指定字符串
func RemoveTextsPreview(c echo.Context) error {
	req := new(model.PathRequest)

	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}

	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	nameMaps, err := utils.RemoveTexts(*req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, nameMaps)
}
