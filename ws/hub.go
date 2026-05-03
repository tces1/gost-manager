package ws

import (
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan string
	mu        sync.Mutex
}

// NewHub creates a new Hub instance.
func NewHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan string),
	}
}

// Run starts the hub loop to broadcast messages to all connected clients.
func (h *Hub) Run() {
	for msg := range h.broadcast {
		h.mu.Lock()
		for client := range h.clients {
			err := client.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				log.Printf("websocket error: %v", err)
				client.Close()
				delete(h.clients, client)
			}
		}
		h.mu.Unlock()
	}
}

// Handle handles websocket requests from the peer.
func (h *Hub) Handle(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade error: %v", err)
		return
	}
	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()
}

// Log sends a message to the broadcast channel.
func (h *Hub) Log(msg string) {
	h.broadcast <- msg
}
