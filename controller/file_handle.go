package controller

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 获取目录下的文件夹
func GetFiles(c echo.Context) error {
	req := new(model.PathRequest)

	// 绑定参数
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}
	// 校验参数
	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	files, err := utils.GetFiles(req.Path)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, files)

}

// 创建文件夹(父文件夹必须存在)
func CreateDirs(c echo.Context) error {
	req := new(model.PathRequest)
	// 绑定参数
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}

	// 校验参数
	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	if err := utils.CreateDirs(req.Path); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "创建成功",
	})
}

func DeleteFiles(c echo.Context) error {
	req := new(model.PathRequest)
	// 绑定参数
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}
	// 校验参数
	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	if err := utils.DeleteFiles(*req); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "删除成功",
	})

}

// 复制文件
func CopyFiles(c echo.Context) error {
	req := new(model.PathRequest)

	// 绑定参数
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}
	// 校验参数
	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	if err := utils.CopyFiles(*req); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "复制成功",
	})
}

// 移动文件
func MoveFiles(c echo.Context) error {
	req := new(model.PathRequest)
	// 绑定参数
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,err)
	}
	// 校验参数
	if err := c.Validate(req); err != nil {
		return echo.NewHTTPError(http.StatusUnprocessableEntity,err)
	}

	if err := utils.MoveFiles(*req); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError,err)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "移动成功",
	})
}
