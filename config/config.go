package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Port    string
}

var Server *Config

func InitConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("Error reading config file, ", err)
	}

	Server = &Config{}
	if err := viper.Unmarshal(Server); err != nil {
		log.Fatal("Unable to decode into struct, ", err)
	}
}
