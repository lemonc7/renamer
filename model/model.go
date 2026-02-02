package model

import (
	"errors"
	"fmt"
	"strings"

	"github.com/Oudwins/zog"
)

type CopyRequest struct {
	Dir       string   `json:"dir"`
	TargetDir string   `json:"targetDir"`
	Originals []string `json:"originals"`
}

var copyRequestSchema = zog.Struct(zog.Shape{
	"dir":       zog.String().Required(),
	"targetDir": zog.String().Required(),
	"originals": zog.Slice(zog.String().Required()).Required(),
})

func (r *CopyRequest) Validate() error {
	return schemaValidate(copyRequestSchema, r)
}

type DeleteRequest struct {
	Dir     string   `json:"dir"`
	Targets []string `json:"targets"`
}

var deleteRequestSchema = zog.Struct(zog.Shape{
	"dir":     zog.String().Required(),
	"targets": zog.Slice(zog.String().Required()).Required(),
})

func (r *DeleteRequest) Validate() error {
	return schemaValidate(deleteRequestSchema, r)
}

type RenamePreviewRequest = DeleteRequest
type ReplaceChineseRequest = DeleteRequest

type RemoveTextsRequest struct {
	Dir     string   `json:"dir"`
	Targets []string `json:"targets"`
	Texts   []string `json:"texts"`
}

var removeTextsRequestSchema = zog.Struct(zog.Shape{
	"dir":     zog.String().Required(),
	"targets": zog.Slice(zog.String().Required()).Required(),
	"texts":   zog.Slice(zog.String().Required()).Required(),
})

func (r *RemoveTextsRequest) Validate() error {
	return schemaValidate(removeTextsRequestSchema, r)
}

type RenameConfirmRequest struct {
	Dir      string    `json:"dir"`
	NameMaps []NameMap `json:"nameMaps"`
}

var renameConfirmRequestSchema = zog.Struct(zog.Shape{
	"dir":      zog.String().Required(),
	"nameMaps": zog.Slice(nameMapSchema).Required(),
})

func (r *RenameConfirmRequest) Validate() error {
	return schemaValidate(renameConfirmRequestSchema, r)
}

// 获取的文件信息
type File struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Size    string `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

// 重命名前后的文件名
type Name struct {
	OldName string `json:"oldName"`
	NewName string `json:"newName"`
}

var nameSchema = zog.Struct(zog.Shape{
	"oldName": zog.String().Required(),
	"newName": zog.String().Required(),
})

type NameMap struct {
	Dir   string `json:"dir"`
	Files []Name `json:"files"`
}

var nameMapSchema = zog.Struct(zog.Shape{
	"dir":   zog.String().Required(),
	"files": zog.Slice(nameSchema).Required(),
})

func schemaValidate(schema *zog.StructSchema, dst any) error {
	if errs := schema.Validate(dst); errs != nil {
		flattened := zog.Issues.Flatten(errs)
		return errors.New(flattenIssues(flattened))
	}
	return nil
}

func flattenIssues(flattened map[string][]string) string {
	parts := make([]string, 0, len(flattened))
	for field, issues := range flattened {
		if len(issues) == 0 {
			continue
		}
		parts = append(parts, fmt.Sprintf("%s: %s",
			field, strings.Join(issues, ", ")))
	}
	return strings.Join(parts, "; ")
}
