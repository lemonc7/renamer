package controller

import (
	"net/http"

	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
	"github.com/lemonc7/zest"
)

// 移除文件名中的指定字符串
func RemoveTextsPreview(c *zest.Context) error {
	var req model.RemoveTextsRequest
	if err := c.Bind(&req); err != nil {
		return err
	}
	nameMaps, err := utils.RemoveTexts(req)
	if err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "移除文本失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, nameMaps)
}
