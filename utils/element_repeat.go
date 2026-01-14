package utils

import (
	"fmt"
)

func IsElementRepeat[T comparable](els []T) error {
	seen := make(map[T]struct{})
	for _, value := range els {
		if _, ok := seen[value]; ok {
			return fmt.Errorf("出现重名: %v", value)
		}
		seen[value] = struct{}{}
	}
	return nil
}
