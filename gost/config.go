package gost

type Config struct {
	Services []Service `json:"services,omitempty"`
}

type Service struct {
	Name      string     `json:"name,omitempty"`
	Addr      string     `json:"addr,omitempty"`
	Handler   *Handler   `json:"handler,omitempty"`
	Listener  *Listener  `json:"listener,omitempty"`
	Forwarder *Forwarder `json:"forwarder,omitempty"`
}

type Handler struct {
	Type string `json:"type,omitempty"`
}

type Listener struct {
	Type string `json:"type,omitempty"`
}

type Forwarder struct {
	Nodes []Node `json:"nodes,omitempty"`
}

type Node struct {
	Name string `json:"name,omitempty"`
	Addr string `json:"addr,omitempty"`
}
