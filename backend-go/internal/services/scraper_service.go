package services

import (
	"database/sql"
	"log"
	"sync"
	"time"

	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/scrapers"
)

type ScraperService struct {
	db         *sql.DB
	jobService *JobService
	isRunning  bool
	mu         sync.Mutex
	lastRun    time.Time
	stats      models.ScraperStatus
}

func NewScraperService(db *sql.DB, jobService *JobService) *ScraperService {
	return &ScraperService{
		db:         db,
		jobService: jobService,
		isRunning:  false,
		lastRun:    time.Now(),
	}
}

// ScrapeAllSources scrapes jobs from all configured sources
func (s *ScraperService) ScrapeAllSources() error {
	s.mu.Lock()
	if s.isRunning {
		s.mu.Unlock()
		return nil // Already running
	}
	s.isRunning = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		s.isRunning = false
		s.lastRun = time.Now()
		s.mu.Unlock()
	}()

	log.Println("Starting job scraping from all sources...")

	// Initialize stats
	stats := models.ScraperStatus{
		IsRunning:       true,
		LastRun:         time.Now(),
		JobsScraped:     0,
		SuccessfulSites: []string{},
		FailedSites:     []string{},
	}

	// Create scrapers
	scraperList := []scrapers.JobScraper{
		scrapers.NewRemoteOKScraper(),
		scrapers.NewWeWorkRemotelyScraper(),
		// Add more scrapers here
	}

	// Use goroutines for concurrent scraping
	var wg sync.WaitGroup
	jobsChan := make(chan *models.Job, 1000)
	errorsChan := make(chan error, len(scraperList))

	// Start scrapers
	for _, scraper := range scraperList {
		wg.Add(1)
		go func(sc scrapers.JobScraper) {
			defer wg.Done()

			jobs, err := sc.Scrape()
			if err != nil {
				log.Printf("Scraper %s failed: %v", sc.Name(), err)
				errorsChan <- err
				stats.FailedSites = append(stats.FailedSites, sc.Name())
				return
			}

			log.Printf("Scraper %s found %d jobs", sc.Name(), len(jobs))
			stats.SuccessfulSites = append(stats.SuccessfulSites, sc.Name())

			// Send jobs to channel
			for _, job := range jobs {
				jobsChan <- job
			}
		}(scraper)
	}

	// Close channels when done
	go func() {
		wg.Wait()
		close(jobsChan)
		close(errorsChan)
	}()

	// Process jobs from channel
	savedCount := 0
	for job := range jobsChan {
		if err := s.jobService.CreateJob(job); err != nil {
			log.Printf("Failed to save job: %v", err)
			continue
		}
		savedCount++
	}

	stats.JobsScraped = savedCount
	stats.IsRunning = false
	s.stats = stats

	log.Printf("Scraping completed: %d jobs saved", savedCount)
	return nil
}

// GetStatus returns current scraper status
func (s *ScraperService) GetStatus() models.ScraperStatus {
	s.mu.Lock()
	defer s.mu.Unlock()

	status := s.stats
	status.IsRunning = s.isRunning
	status.LastRun = s.lastRun

	return status
}