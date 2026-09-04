package db

import (
	"embed"
	"fmt"
	"log"
	"sort"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

//go:embed migrations/*.sql
var embeddedMigrations embed.FS

func Connect(databaseURL string) (*sqlx.DB, error) {
	dbx, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("connect postgres: %w", err)
	}
	return dbx, nil
}

func RunMigrations(dbx *sqlx.DB) error {
	entries, err := embeddedMigrations.ReadDir("migrations")
	if err != nil {
		return err
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		names = append(names, e.Name())
	}
	sort.Strings(names)

	for _, name := range names {
		content, err := embeddedMigrations.ReadFile("migrations/" + name)
		if err != nil {
			return err
		}
		log.Printf("applying migration %s", name)
		if _, err := dbx.Exec(string(content)); err != nil {
			return fmt.Errorf("migration %s: %w", name, err)
		}
	}
	return nil
}
