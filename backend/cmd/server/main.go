package main

import (
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

	objectStorage := storage.NewLocalStorage(cfg.LocalDataDir, fmt.Sprintf("http://localhost:%s", cfg.Port))

	authHandler := &handlers.AuthHandler{Store: st, JWTSecret: cfg.JWTSecret}
	videoHandler := &handlers.VideoHandler{Store: st, Storage: objectStorage}

	r := router.New(router.Deps{
		AuthHandler:  authHandler,
		VideoHandler: videoHandler,
		JWTSecret:    cfg.JWTSecret,
	})

	log.Printf("video-intell API listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
