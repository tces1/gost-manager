package config

import (
	"encoding/json"
	"os"
)

var FilePath = "data.json"

func LoadData() (*Data, error) {
	if _, err := os.Stat(FilePath); os.IsNotExist(err) {
		return &Data{AdminPassword: "admin", Rules: []Rule{}}, nil
	}
	content, err := os.ReadFile(FilePath)
	if err != nil {
		return nil, err
	}
	var data Data
	err = json.Unmarshal(content, &data)
	return &data, err
}

func SaveData(data *Data) error {
	content, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(FilePath, content, 0644)
}
