package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

// InitDB initializes database connection
func InitDB() (*sql.DB, error) {
	// Get database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	// Connect to PostgreSQL
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}