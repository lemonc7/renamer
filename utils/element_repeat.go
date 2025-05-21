package utils

import (
	"fmt"
)

func ElementRepeat[T comparable](els []T) error {
	seen := make(map[T]struct{})
	for _, value := range els {
		if _, ok := seen[value]; ok {
			return fmt.Errorf("element in slice is repeated: %v", value)
		}
		seen[value] = struct{}{}
	}
	return nil
}