package utils

import (
	"os"
	"path/filepath"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, nameMaps []model.Name) error {

	for _, entry := range nameMaps {
		oldPath := filepath.Join(path,entry.OldName)
		newPath := filepath.Join(path,entry.NewName)
		if newPath != oldPath {
			if err := os.Rename(oldPath, newPath); err != nil {
				return err
			}
		}
	}
	return nil
}
