package storage

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

type LocalStorage struct {
	DataDir string
	BaseURL string
}

func NewLocalStorage(dataDir, baseURL string) *LocalStorage {
	os.MkdirAll(dataDir, 0o755)
	return &LocalStorage{DataDir: dataDir, BaseURL: baseURL}
}

func (l *LocalStorage) PresignUpload(key, contentType string, expires time.Duration) (string, error) {
	return fmt.Sprintf("%s/local-upload/%s", l.BaseURL, key), nil
}

func (l *LocalStorage) PresignDownload(key string, expires time.Duration) (string, error) {
	return fmt.Sprintf("%s/local-files/%s", l.BaseURL, key), nil
}

func (l *LocalStorage) PublicURL(key string) string {
	return fmt.Sprintf("%s/local-files/%s", l.BaseURL, key)
}

func (l *LocalStorage) PutObject(key, contentType string, body []byte) error {
	path := filepath.Join(l.DataDir, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, body, 0o644)
}

func (l *LocalStorage) GetObject(key string) ([]byte, error) {
	path := filepath.Join(l.DataDir, filepath.FromSlash(key))
	return os.ReadFile(path)
}
