package scrapers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
)

type RemoteOKScraper struct{}

func NewRemoteOKScraper() *RemoteOKScraper {
	return &RemoteOKScraper{}
}

func (s *RemoteOKScraper) Name() string {
	return "RemoteOK"
}

func (s *RemoteOKScraper) Scrape() ([]*models.Job, error) {
	log.Println("Scraping RemoteOK via API...")

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("GET", "https://remoteok.com/api", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build RemoteOK request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; JobForgeBot/1.0)")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch RemoteOK: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("RemoteOK returned status %d", resp.StatusCode)
	}

	var raw []remoteOKJob
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("failed to decode RemoteOK response: %w", err)
	}

	jobs := make([]*models.Job, 0, len(raw))
	for _, item := range raw {
		// First entry is metadata, so skip entries without ID/title/company.
		if item.ID == 0 || item.Position == "" || item.Company == "" {
			continue
		}
		if job := convertRemoteOKJob(item); job != nil {
			jobs = append(jobs, job)
		}
	}

	log.Printf("RemoteOK: Found %d jobs", len(jobs))
	return jobs, nil
}

type remoteOKJob struct {
	ID          int      `json:"id"`
	Date        string   `json:"date"`
	Company     string   `json:"company"`
	Position    string   `json:"position"`
	Description string   `json:"description"`
	Location    string   `json:"location"`
	SalaryMin   string   `json:"salary_min"`
	SalaryMax   string   `json:"salary_max"`
	Type        string   `json:"job_type"`
	URL         string   `json:"url"`
	Tags        []string `json:"tags"`
}

func convertRemoteOKJob(item remoteOKJob) *models.Job {
	remoteType := "remote"
	description := strings.TrimSpace(item.Description)
	if description == "" {
		description = fmt.Sprintf("%s position at %s", item.Position, item.Company)
	}

	rawDesc := description
	jobType := item.Type
	if jobType == "" {
		jobType = "full-time"
	}

	var postedDate *time.Time
	if item.Date != "" {
		if parsed, err := time.Parse(time.RFC3339, item.Date); err == nil {
			postedDate = timePtr(parsed)
		}
	}

	var salaryMin *float64
	var salaryMax *float64
	if val, err := parseSalary(item.SalaryMin); err == nil {
		salaryMin = &val
	}
	if val, err := parseSalary(item.SalaryMax); err == nil {
		salaryMax = &val
	}

	sourceURL := item.URL
	if !strings.HasPrefix(sourceURL, "http") {
		sourceURL = "https://remoteok.com" + sourceURL
	}

	return &models.Job{
		Title:              strings.TrimSpace(item.Position),
		Company:            strings.TrimSpace(item.Company),
		Location:           strings.TrimSpace(item.Location),
		RemoteType:         stringPtr(remoteType),
		Description:        description,
		SourceURL:          stringPtr(sourceURL),
		ValidatedSourceURL: stringPtr(sourceURL),
		JobType:            stringPtr(jobType),
		RawDescription:     &rawDesc,
		SalaryMin:          salaryMin,
		SalaryMax:          salaryMax,
		IsActive:           true,
		PostedDate:         postedDate,
		SourceSite:         stringPtr("RemoteOK"),
	}
}

func parseSalary(raw string) (float64, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return 0, fmt.Errorf("empty salary")
	}
	raw = strings.ReplaceAll(raw, "$", "")
	raw = strings.ReplaceAll(raw, ",", "")
	raw = strings.Split(raw, " ")[0]
	return strconv.ParseFloat(raw, 64)
}

func stringPtr(val string) *string {
	return &val
}

func timePtr(t time.Time) *time.Time {
	return &t
}
