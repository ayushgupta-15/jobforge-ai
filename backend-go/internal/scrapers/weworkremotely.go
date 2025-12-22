package scrapers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
)

type WeWorkRemotelyScraper struct{}

func NewWeWorkRemotelyScraper() *WeWorkRemotelyScraper {
	return &WeWorkRemotelyScraper{}
}

func (s *WeWorkRemotelyScraper) Name() string {
	return "WeWorkRemotely"
}

func (s *WeWorkRemotelyScraper) Scrape() ([]*models.Job, error) {
	log.Println("Scraping WeWorkRemotely...")

	doc, err := fetchWeWorkRemotelyDocument("https://weworkremotely.com/remote-jobs/search?term=software")
	if err != nil {
		return nil, err
	}

	jobs := []*models.Job{}

	// Find job listings
	doc.Find("li.feature").Each(func(i int, sel *goquery.Selection) {
		// Extract job title
		title := strings.TrimSpace(sel.Find(".title").Text())

		// Extract company
		company := strings.TrimSpace(sel.Find(".company").Text())

		// Extract location (region)
		location := strings.TrimSpace(sel.Find(".region").Text())
		if location == "" {
			location = "Remote"
		}

		// Get job URL
		href, exists := sel.Find("a").Attr("href")
		if !exists {
			return
		}
		sourceURL := "https://weworkremotely.com" + href
		validatedURL := sourceURL

		// Basic validation
		if title == "" || company == "" {
			return
		}

		// Determine job type from tags
		jobType := "full-time"
		tags := sel.Find(".tags").Text()
		if strings.Contains(strings.ToLower(tags), "contract") {
			jobType = "contract"
		}

		remoteType := "remote"

		rawDescription := strings.TrimSpace(sel.Text())

		// Create job object
		job := &models.Job{
			Title:              title,
			Company:            company,
			Location:           location,
			RemoteType:         &remoteType,
			Description:        fmt.Sprintf("%s position at %s. %s", title, company, tags),
			SourceURL:          &sourceURL,
			ValidatedSourceURL: &validatedURL,
			JobType:            &jobType,
			RawDescription:     &rawDescription,
			IsActive:           true,
			PostedDate:         timePtr(time.Now()),
			SourceSite:         stringPtr("WeWorkRemotely"),
		}

		jobs = append(jobs, job)
	})

	log.Printf("WeWorkRemotely: Found %d jobs", len(jobs))
	return jobs, nil
}

func fetchWeWorkRemotelyDocument(url string) (*goquery.Document, error) {
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build WeWorkRemotely request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Referer", "https://weworkremotely.com/")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch WeWorkRemotely: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("WeWorkRemotely returned status %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse WeWorkRemotely HTML: %w", err)
	}
	return doc, nil
}
