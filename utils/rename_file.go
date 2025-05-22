package utils

import (
	"os"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, nameMaps []model.NameMaps) error {

	for _, entry := range nameMaps {
		oldPath := path + "/" + entry.OldName
		newPath := path + "/" + entry.NewName
		if err := os.Rename(oldPath, newPath); err != nil {
			return err
		}
	}
	return nil
}
