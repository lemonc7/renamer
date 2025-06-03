package main

import (
	"github.com/lemonc7/renamer/config"
	"github.com/lemonc7/renamer/router"
)

// gin框架
func main() {
	config.InitConfig()
	r := router.SetupRouter()
	r.Run(":"+config.Server.Port)
}
