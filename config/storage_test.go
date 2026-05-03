package config

import (
	"os"
	"reflect"
	"testing"
)

func TestSaveAndLoadData(t *testing.T) {
	// Setup: use a temporary file for testing
	tempFile := "test_data.json"
	originalFilePath := FilePath
	FilePath = tempFile
	defer func() {
		FilePath = originalFilePath
		os.Remove(tempFile)
	}()

	testData := &Data{
		AdminPassword: "testpassword",
		Rules: []Rule{
			{
				ID:         "1",
				Name:       "Test Rule",
				Protocol:   "tcp",
				LocalPort:  8080,
				RemoteAddr: "127.0.0.1:80",
			},
		},
	}

	// Test SaveData
	err := SaveData(testData)
	if err != nil {
		t.Fatalf("SaveData failed: %v", err)
	}

	// Test LoadData
	loadedData, err := LoadData()
	if err != nil {
		t.Fatalf("LoadData failed: %v", err)
	}

	if !reflect.DeepEqual(testData, loadedData) {
		t.Errorf("Expected %+v, got %+v", testData, loadedData)
	}
}

func TestLoadDataDefault(t *testing.T) {
	// Setup: use a non-existent file
	tempFile := "non_existent_data.json"
	originalFilePath := FilePath
	FilePath = tempFile
	defer func() {
		FilePath = originalFilePath
	}()

	// Ensure file doesn't exist
	os.Remove(tempFile)

	expectedData := &Data{AdminPassword: "admin", Rules: []Rule{}}
	loadedData, err := LoadData()
	if err != nil {
		t.Fatalf("LoadData failed: %v", err)
	}

	if !reflect.DeepEqual(expectedData, loadedData) {
		t.Errorf("Expected %+v, got %+v", expectedData, loadedData)
	}
}
