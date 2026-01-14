package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/lemonc7/renamer/app"
	"github.com/lemonc7/renamer/config"
)

func main() {
	if err := config.InitConfig("./config.yaml"); err != nil {
		log.Fatal(err)
	}

	z := app.InitApp()

	srv := &http.Server{
		Addr:         ":" + strconv.Itoa(config.Cfg.Port),
		Handler:      z,
		ReadTimeout:  config.Cfg.ReadTimeout,
		WriteTimeout: config.Cfg.WriteTimeout,
	}

	// 启动HTTP服务
	go func() {
		log.Println("启动HTTP服务, 监听端口:", config.Cfg.Port)
		if err := srv.ListenAndServe(); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				log.Fatalln("启动HTTP服务失败", err)
			}
		}
	}()

	// 阻塞监听系统信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("收到退出信号, 开始关闭服务...")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	// 关闭HTTP服务
	if err := srv.Shutdown(ctx); err != nil {
		log.Println("关闭HTTP服务失败:", err)
	} else {
		log.Println("成功关闭HTTP服务")
	}
}
