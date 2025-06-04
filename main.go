package main

import (
	"github.com/lemonc7/renamer/router"
)

func main() {
	app := router.SetupRouter()
	app.Logger.Fatal(app.Start(":7777"))
}
