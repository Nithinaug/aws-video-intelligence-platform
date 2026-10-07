package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type LocalStorage struct {
	DataDir string
	BaseURL string
}

func NewLocalStorage(dataDir, baseURL string) *LocalStorage {
	os.MkdirAll(dataDir, 0o755)
	return &LocalStorage{DataDir: dataDir, BaseURL: baseURL}
}

func (l *LocalStorage) PresignUpload(_ context.Context, key, _ string) (string, error) {
	return fmt.Sprintf("%s/local-upload/%s", l.BaseURL, key), nil
}

func (l *LocalStorage) PublicURL(_ context.Context, key string) (string, error) {
	return fmt.Sprintf("%s/local-files/%s", l.BaseURL, key), nil
}

func (l *LocalStorage) PutObject(key, contentType string, body []byte) error {
	path, err := l.resolve(key)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, body, 0o644)
}

func (l *LocalStorage) GetObject(key string) ([]byte, error) {
	path, err := l.resolve(key)
	if err != nil {
		return nil, err
	}
	return os.ReadFile(path)
}

func (l *LocalStorage) resolve(key string) (string, error) {
	path := filepath.Join(l.DataDir, filepath.FromSlash(key))
	rel, err := filepath.Rel(l.DataDir, path)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("invalid key %q", key)
	}
	return path, nil
}
