package controller

import (
	"net/http"

	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
	"github.com/lemonc7/zest"
)

// 获取目录下的文件夹
func GetFiles(c *zest.Context) error {
	path := c.Query("path")

	files, err := utils.GetFiles(path)
	if err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "获取文件失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, files)
}

// 创建文件夹(父文件夹必须存在)
func CreateDir(c *zest.Context) error {
	path := c.Query("path")

	if err := utils.CreateDir(path); err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "创建文件夹失败").Wrap(err)
	}

	return c.JSON(http.StatusCreated, zest.Map{
		"message": "创建成功",
	})
}

func DeleteFiles(c *zest.Context) error {
	var req model.DeleteRequest

	if err := c.Bind(&req); err != nil {
		return err
	}
	if err := utils.DeleteFiles(req); err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "删除文件(夹)失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, zest.Map{
		"message": "删除成功",
	})
}

// 复制文件
func CopyFiles(c *zest.Context) error {
	var req model.CopyRequest

	if err := c.Bind(&req); err != nil {
		return err
	}

	if err := utils.CopyFiles(req); err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "复制文件(夹)失败").Wrap(err)
	}

	return c.JSON(http.StatusCreated, zest.Map{
		"message": "复制成功",
	})
}

// 移动文件
func MoveFiles(c *zest.Context) error {
	var req model.CopyRequest

	if err := c.Bind(&req); err != nil {
		return err
	}

	if err := utils.MoveFiles(req); err != nil {
		return zest.NewHTTPError(http.StatusInternalServerError, "移动文件(夹)失败").Wrap(err)
	}

	return c.JSON(http.StatusOK, zest.Map{
		"message": "移动成功",
	})
}
