package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 将中文和中文字符转化成拼音和英文字符
func ReplaceChinesePreview(c echo.Context) error {
	req := new(model.PathRequest)

	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": err.Error(),
		})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{
			"error": err.Error(),
		})
	}

	nameMaps, err := utils.ReplaceChinese(*req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, nameMaps)
}
