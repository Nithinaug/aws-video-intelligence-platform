package storage

import "time"

type Storage interface {
	PresignUpload(key, contentType string, expires time.Duration) (string, error)
	PresignDownload(key string, expires time.Duration) (string, error)
	PutObject(key string, contentType string, body []byte) error
	GetObject(key string) ([]byte, error)
	PublicURL(key string) string
}
