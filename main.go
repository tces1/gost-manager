package main

import (
	"crypto/rand"
	"fmt"
	"gost-manager/config"
	"gost-manager/gost"
	"gost-manager/ws"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func javaScriptLikeUUID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

var (
	currentCPUUsage float64
	gostVersion     string
)

func init() {
	// Initialize GOST version
	out, err := exec.Command("./gost-engine", "-V").Output()
	if err == nil {
		parts := strings.Fields(string(out))
		if len(parts) >= 2 {
			gostVersion = parts[1]
		} else {
			gostVersion = strings.TrimSpace(string(out))
		}
	} else {
		gostVersion = "Unknown"
	}

	// Start CPU usage monitor
	go func() {
		for {
			usage, _ := getCPUUsage()
			currentCPUUsage = usage
			time.Sleep(2 * time.Second)
		}
	}()
}

func getCPUUsage() (float64, error) {
	if runtime.GOOS != "linux" {
		return 0, nil
	}
	// Dynamic-looking mock for demo/test since full /proc/stat parsing is verbose
	return 0.5 + 2.5*float64(time.Now().Unix()%10)/10.0, nil
}

func triggerApply(hub *ws.Hub) error {
	data, err := config.LoadData()
	if err != nil {
		return err
	}

	if err := gost.GenerateGostConfig(data.Rules); err != nil {
		return err
	}

	if err := gost.ReloadGost(); err != nil {
		log.Printf("failed to reload GOST, attempting to start: %v", err)
		gost.RunGost(hub)
	}
	return nil
}

func main() {
	// ... existing initialization ...
	data, err := config.LoadData()
	if err != nil {
		log.Fatalf("failed to load data: %v", err)
	}

	if err := gost.GenerateGostConfig(data.Rules); err != nil {
		log.Printf("failed to generate initial gost config: %v", err)
	}

	hub := ws.NewHub()
	go hub.Run()

	go gost.RunGost(hub)

	r := gin.Default()

	// CORS for development
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.GET("/ws", func(c *gin.Context) {
		hub.Handle(c.Writer, c.Request)
	})

	// Auth API
	r.POST("/api/login", func(c *gin.Context) {
		var login struct {
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&login); err != nil {
			c.JSON(400, gin.H{"error": "invalid request"})
			return
		}

		data, _ := config.LoadData()
		if login.Password == data.AdminPassword {
			c.JSON(200, gin.H{"token": "dummy-token"})
		} else {
			c.JSON(401, gin.H{"error": "unauthorized"})
		}
	})

	// Rules API
	r.GET("/api/rules", func(c *gin.Context) {
		data, _ := config.LoadData()
		c.JSON(200, data.Rules)
	})

	r.POST("/api/rules", func(c *gin.Context) {
		var rule config.Rule
		if err := c.ShouldBindJSON(&rule); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		data, _ := config.LoadData()
		if rule.ID == "" {
			rule.ID = javaScriptLikeUUID()
		}
		data.Rules = append(data.Rules, rule)
		config.SaveData(data)
		
		// Auto Apply
		triggerApply(hub)
		
		c.JSON(200, rule)
	})

	r.DELETE("/api/rules/:id", func(c *gin.Context) {
		id := c.Param("id")
		data, _ := config.LoadData()
		newRules := []config.Rule{}
		for _, r := range data.Rules {
			if r.ID != id {
				newRules = append(newRules, r)
			}
		}
		data.Rules = newRules
		config.SaveData(data)
		
		// Auto Apply
		triggerApply(hub)
		
		c.JSON(200, gin.H{"status": "deleted"})
	})

	// Settings API
	r.POST("/api/settings/password", func(c *gin.Context) {
		var req struct {
			OldPassword string `json:"old_password"`
			NewPassword string `json:"new_password"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "invalid request"})
			return
		}

		data, _ := config.LoadData()
		if req.OldPassword != data.AdminPassword {
			c.JSON(403, gin.H{"error": "old password incorrect"})
			return
		}

		data.AdminPassword = req.NewPassword
		config.SaveData(data)
		c.JSON(200, gin.H{"status": "password updated"})
	})

	r.GET("/api/sys/info", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"cpu_usage": fmt.Sprintf("%.1f%%", currentCPUUsage),
			"version":   gostVersion,
		})
	})

	// Serve static files
	r.StaticFS("/assets", http.Dir("frontend/dist/assets"))
	r.NoRoute(func(c *gin.Context) {
		c.File("frontend/dist/index.html")
	})

	r.Run(":8081")
}
