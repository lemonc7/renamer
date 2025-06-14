package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/lemonc7/renamer/router"
)

func main() {
	app := router.SetupRouter()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// 开启服务
	go func() {
		if err := app.Start(":7777"); err != nil && err != http.ErrServerClosed {
			app.Logger.Fatal("shutting down the server")
		}
	}()

	// 等待关闭服务器的信号
	<-ctx.Done()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := app.Shutdown(ctx); err != nil {
		app.Logger.Fatal(err)
	}

}
