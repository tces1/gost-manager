package gost

import (
	"bufio"
	"encoding/json"
	"fmt"
	"gost-manager/config"
	"gost-manager/ws"
	"io"
	"log"
	"os"
	"os/exec"
	"sync"
	"syscall"
)

var (
	gostCmd *exec.Cmd
	gostMu  sync.Mutex
)

// GenerateGostConfig converts rules into GOST v3 format and writes to gost.json.
func GenerateGostConfig(rules []config.Rule) error {
	cfg := Config{}
	for _, rule := range rules {
		service := Service{
			Name: fmt.Sprintf("rule-%s", rule.ID),
			Addr: fmt.Sprintf(":%d", rule.LocalPort),
			Handler: &Handler{
				Type: rule.Protocol,
			},
			Listener: &Listener{
				Type: rule.Protocol,
			},
			Forwarder: &Forwarder{
				Nodes: []Node{
					{
						Name: "target",
						Addr: rule.RemoteAddr,
					},
				},
			},
		}
		cfg.Services = append(cfg.Services, service)
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile("gost.json", data, 0644)
}

// RunGost starts the GOST process and captures its output.
func RunGost(hub *ws.Hub) {
	gostMu.Lock()
	defer gostMu.Unlock()

	if gostCmd != nil && gostCmd.Process != nil {
		log.Println("GOST is already running")
		return
	}

	// Check if gost binary exists, if not, we can't really run it but we'll try anyway.
	// In a real scenario, we'd ensure it's there.
	
	cmd := exec.Command("./gost-engine", "-C", "gost.json")
	
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Printf("failed to get stdout pipe: %v", err)
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		log.Printf("failed to get stderr pipe: %v", err)
		return
	}

	if err := cmd.Start(); err != nil {
		log.Printf("failed to start GOST: %v", err)
		hub.Log(fmt.Sprintf("Failed to start GOST: %v", err))
		return
	}

	gostCmd = cmd
	hub.Log("GOST started")

	go captureOutput(stdout, hub)
	go captureOutput(stderr, hub)

	go func() {
		err := cmd.Wait()
		gostMu.Lock()
		gostCmd = nil
		gostMu.Unlock()
		log.Printf("GOST process exited: %v", err)
		hub.Log(fmt.Sprintf("GOST process exited: %v", err))
	}()
}

func captureOutput(r io.Reader, hub *ws.Hub) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := scanner.Text()
		hub.Log(line)
	}
}

// ReloadGost sends SIGHUP to the GOST process.
func ReloadGost() error {
	gostMu.Lock()
	defer gostMu.Unlock()

	if gostCmd == nil || gostCmd.Process == nil {
		return fmt.Errorf("GOST is not running")
	}

	return gostCmd.Process.Signal(syscall.SIGHUP)
}
