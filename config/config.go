package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Port         int           `yaml:"port"`
	ReadTimeout  time.Duration `yaml:"read_timeout"`
	WriteTimeout time.Duration `yaml:"write_timeout"`
	MatchExts    []string      `yaml:"match_exts"`
}

var Cfg Config

func InitConfig(filePath string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read config: %w", err)
	}
	Cfg = Config{
		Port:         7777,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		MatchExts: []string{"flv", "mkv", "mp4", "avi", "m2ts", "wmv",
			"rmvb", "srt", "ass", "ssa", "sub", "smi", "jpg", "nfo"},
	}
	if err := yaml.Unmarshal(data, &Cfg); err != nil {
		return fmt.Errorf("parse config: %w", err)
	}

	return nil
}
