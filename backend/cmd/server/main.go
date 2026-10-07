package main

import (
	"context"
	"fmt"
	"log"

	"videointell/backend/internal/config"
	"videointell/backend/internal/db"
	"videointell/backend/internal/handlers"
	"videointell/backend/internal/router"
	"videointell/backend/internal/storage"
	"videointell/backend/internal/store"
)

func main() {
	cfg := config.Load()

	dbx, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	if err := db.RunMigrations(dbx); err != nil {
		log.Fatalf("migrations: %v", err)
	}
	st := store.New(dbx)

	authHandler := &handlers.AuthHandler{Store: st, JWTSecret: cfg.JWTSecret}
	videoHandler := &handlers.VideoHandler{Store: st}
	var localFiles *handlers.LocalFilesHandler

	switch cfg.StorageBackend {
	case "s3":
		s3Storage, err := storage.NewS3Storage(context.Background(), cfg.S3Bucket)
		if err != nil {
			log.Fatalf("s3 storage: %v", err)
		}
		videoHandler.Storage = s3Storage
		log.Printf("storage: s3 (bucket %s)", cfg.S3Bucket)
	case "local":
		local := storage.NewLocalStorage(cfg.LocalDataDir, fmt.Sprintf("http://localhost:%s", cfg.Port))
		videoHandler.Storage = local
		localFiles = &handlers.LocalFilesHandler{Storage: local}
		log.Printf("storage: local (%s)", cfg.LocalDataDir)
	default:
		log.Fatalf("unknown STORAGE_BACKEND %q (want local or s3)", cfg.StorageBackend)
	}

	r := router.New(router.Deps{
		AuthHandler:  authHandler,
		VideoHandler: videoHandler,
		LocalFiles:   localFiles,
		JWTSecret:    cfg.JWTSecret,
	})

	log.Printf("video-intell API listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
