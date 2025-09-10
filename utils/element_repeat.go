package utils

import (
	"fmt"
)

func elementRepeat[T comparable](els []T) error {
	seen := make(map[T]struct{})
	for _, value := range els {
		if _, ok := seen[value]; ok {
			return fmt.Errorf("元素重复: %v", value)
		}
		seen[value] = struct{}{}
	}
	return nil
}
