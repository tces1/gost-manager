package config

type Rule struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Protocol   string `json:"protocol"` // tcp, udp
	LocalPort  int    `json:"local_port"`
	RemoteAddr string `json:"remote_addr"`
}

type Data struct {
	AdminPassword string `json:"admin_password"`
	Rules         []Rule `json:"rules"`
}
