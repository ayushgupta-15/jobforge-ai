package scrapers

import (
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
)

// JobScraper interface that all scrapers must implement
type JobScraper interface {
	Name() string
	Scrape() ([]*models.Job, error)
}