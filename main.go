package main

import (
	"gost-panel/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	hub := ws.NewHub()
	go hub.Run()

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.GET("/ws", func(c *gin.Context) {
		hub.Handle(c.Writer, c.Request)
	})

	r.Run(":8080")
}
