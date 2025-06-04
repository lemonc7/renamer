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
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": err.Error(),
		})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{
			"error": err.Error(),
		})
	}

	nameMaps, err := utils.RemoveTexts(*req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, nameMaps)
}
