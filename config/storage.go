package config

import (
	"encoding/json"
	"fmt"
	"os"
)

// FilePath is the path to the data file.
var FilePath = "data.json"

// LoadData loads the configuration data from FilePath.
// If the file does not exist, it returns a default Data structure.
func LoadData() (*Data, error) {
	if _, err := os.Stat(FilePath); err != nil {
		if os.IsNotExist(err) {
			return &Data{AdminPassword: "admin", Rules: []Rule{}}, nil
		}
		return nil, fmt.Errorf("failed to stat data file: %w", err)
	}

	content, err := os.ReadFile(FilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read data file: %w", err)
	}

	var data Data
	if err := json.Unmarshal(content, &data); err != nil {
		return nil, fmt.Errorf("failed to unmarshal data: %w", err)
	}
	return &data, nil
}

// SaveData saves the configuration data to FilePath atomically.
func SaveData(data *Data) error {
	content, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	tempFile := FilePath + ".tmp"
	if err := os.WriteFile(tempFile, content, 0644); err != nil {
		return fmt.Errorf("failed to write temporary data file: %w", err)
	}

	if err := os.Rename(tempFile, FilePath); err != nil {
		return fmt.Errorf("failed to rename temporary data file: %w", err)
	}

	return nil
}
