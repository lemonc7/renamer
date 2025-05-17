package middleware

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/lemonc7/renamer/config"
)

func Cors() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins: []string{fmt.Sprintf("http://%s:%s",config.Server.Host,config.Server.WebPort)},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12*time.Hour,
	}
	return cors.New(config)
}
