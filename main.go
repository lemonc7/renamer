package main

import (
	"github.com/lemonc7/renamer/config"
	"github.com/lemonc7/renamer/router"
)

func main() {
	config.InitConfig()
	app := router.SetupRouter()
	app.Logger.Fatal(app.Start(":"+config.Server.Port))
}
