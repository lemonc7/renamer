package controller

import (
	"net/http"

	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
	"github.com/lemonc7/zest"
)

// 将中文和中文字符转化成拼音和英文字符
func ReplaceChinesePreview(c *zest.Context) error {
	var req model.ReplaceChineseRequest
	if err := c.Bind(&req); err != nil {
		return err
	}

	nameMaps, err := utils.ReplaceChinese(req)
	if err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "移除中文字符失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, nameMaps)
}
