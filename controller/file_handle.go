package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/model"
	"github.com/lemonc7/renamer/utils"
)

// 获取目录下的文件列表
func GetFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定Query请求参数到结构体
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path参数",
		})
		return
	}

	files, err := utils.GetFiles(req.Path)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 返回JSON响应数据
	ctx.JSON(http.StatusOK, files)
}

// 根据路径创建文件夹(父文件夹必须存在)
func CreateDirs(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path参数",
		})
		return
	}

	// 检查目录是否存在
	_, err := os.Stat(req.Path)
	// 返回错误信息: 目录已存在
	if err == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "目录已存在",
		})
		return
	}

	// 创建目录
	if err := os.Mkdir(req.Path, 0755); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 返回成功信息
	ctx.JSON(http.StatusOK, gin.H{
		"message": "目录创建成功",
	})
}

// 根据路径删除文件或目录
func DeleteFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path和nameMaps参数",
		})
		fmt.Printf("path:%v\nnameMaps:%v\n", req.Path, req.NameMaps)
		return
	}
	fmt.Printf("path:%v\nnameMaps:%v\n", req.Path, req.NameMaps)
	for _, entry := range req.NameMaps {
		// 检查文件或目录是否存在
		if _, err := os.Stat(req.Path + "/" + entry.DirName); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// 删除文件
		if err := os.RemoveAll(req.Path + "/" + entry.DirName); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "删除成功",
	})
}

// 复制文件
func CopyFiles(ctx *gin.Context) {
	var req model.PathRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,targetPath和nameMaps参数",
		})
		fmt.Printf("path:%v\ntargetPath:%vnameMaps:%v", req.Path, req.TargetPath, req.NameMaps)

		return
	}
	fmt.Printf("path:%v\ntargetPath:%vnameMaps:%v", req.Path, req.TargetPath, req.NameMaps)

	for _, entry := range req.NameMaps {
		path := req.Path + "/" + entry.DirName
		// 检查路径是否存在，是文件还是文件夹
		info, err := os.Stat(path)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// 判断路径是否是文件夹
		if info.IsDir() {
			// 如果是文件夹，直接复制整个文件夹到目标路径
			sourcePath := os.DirFS(path)
			if err := os.CopyFS(req.TargetPath+"/"+info.Name(), sourcePath); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		} else {
			// 如果是文件，直接复制文件到目标路径
			// 打开文件
			sourceFile, err := os.Open(path)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			defer sourceFile.Close()
			// 创建目标文件(只有当目标文件不存在时才创建,然后进行后续操作(原子性),否则返回错误)
			targetFile, err := os.OpenFile(req.TargetPath+"/"+info.Name(), os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0666)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			defer targetFile.Close()
			// 复制文件内容
			if _, err := io.Copy(targetFile, sourceFile); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "复制成功",
	})

}

// 移动文件
func MoveFiles(ctx *gin.Context) {
	var req model.PathRequest
	// 绑定JSON请求参数到结构体
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "必须提供path,targetPath和nameMaps参数",
		})
		fmt.Printf("path:%v\ntargetPath:%vnameMaps:%v", req.Path, req.TargetPath, req.NameMaps)
		return
	}
	fmt.Printf("path:%v\ntargetPath:%vnameMaps:%v", req.Path, req.TargetPath, req.NameMaps)

	for _, entry := range req.NameMaps {
		// 检查源路径是否存在，不存在就报错
		path := req.Path + "/" + entry.DirName
		info, err := os.Stat(path)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "源文件不存在",
			})
			return
		}

		// 移动文件,文件会覆盖，文件夹已存在会报错
		targetPath := req.TargetPath + "/" + info.Name()
		if err := os.Rename(path, targetPath); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "移动成功",
	})

}
