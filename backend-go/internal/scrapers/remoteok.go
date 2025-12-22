package scrapers

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"regexp"
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
		id := parseRemoteOKID(item.ID)
		if id == "" || id == "0" || item.Position == "" || item.Company == "" {
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
	ID          json.RawMessage `json:"id"`
	Slug        string          `json:"slug"`
	Epoch       *int64          `json:"epoch"`
	Date        string          `json:"date"`
	Company     string          `json:"company"`
	CompanyLogo string          `json:"company_logo"`
	Position    string          `json:"position"`
	Description string          `json:"description"`
	Location    string          `json:"location"`
	SalaryMin   json.RawMessage `json:"salary_min"`
	SalaryMax   json.RawMessage `json:"salary_max"`
	Currency    string          `json:"currency"`
	Type        string          `json:"job_type"`
	URL         string          `json:"url"`
	ApplyURL    string          `json:"apply_url"`
	Tags        []string        `json:"tags"`
}

func convertRemoteOKJob(item remoteOKJob) *models.Job {
	remoteType := "remote"
	rawDesc := strings.TrimSpace(item.Description)
	description := strings.TrimSpace(stripHTMLTags(html.UnescapeString(rawDesc)))
	if description == "" {
		description = fmt.Sprintf("%s position at %s", item.Position, item.Company)
	}

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
	if postedDate == nil && item.Epoch != nil {
		t := time.Unix(*item.Epoch, 0)
		postedDate = timePtr(t)
	}

	location := strings.TrimSpace(item.Location)
	if location == "" {
		location = "Remote"
	}

	var salaryMin *float64
	if val := parseRemoteOKSalary(item.SalaryMin); val != nil {
		salaryMin = val
	}

	var salaryMax *float64
	if val := parseRemoteOKSalary(item.SalaryMax); val != nil {
		salaryMax = val
	}

	sourceURL := item.URL
	if !strings.HasPrefix(sourceURL, "http") {
		sourceURL = "https://remoteok.com" + sourceURL
	}
	validatedURL := sourceURL
	if strings.TrimSpace(item.ApplyURL) != "" {
		validatedURL = item.ApplyURL
	}

	return &models.Job{
		Title:              strings.TrimSpace(item.Position),
		Company:            strings.TrimSpace(item.Company),
		Location:           location,
		RemoteType:         stringPtr(remoteType),
		Description:        description,
		SourceURL:          stringPtr(sourceURL),
		ValidatedSourceURL: stringPtr(validatedURL),
		JobType:            stringPtr(jobType),
		RawDescription:     &rawDesc,
		SalaryMin:          salaryMin,
		SalaryMax:          salaryMax,
		IsActive:           true,
		PostedDate:         postedDate,
		SourceSite:         stringPtr("RemoteOK"),
	}
}

func parseRemoteOKSalary(raw json.RawMessage) *float64 {
	if len(raw) == 0 {
		return nil
	}

	var num float64
	if err := json.Unmarshal(raw, &num); err == nil && num > 0 {
		return &num
	}

	var str string
	if err := json.Unmarshal(raw, &str); err == nil {
		str = strings.TrimSpace(str)
		if str == "" {
			return nil
		}
		str = strings.ReplaceAll(str, "$", "")
		str = strings.ReplaceAll(str, ",", "")
		parts := strings.Fields(str)
		if len(parts) == 0 {
			return nil
		}
		if val, err := strconv.ParseFloat(parts[0], 64); err == nil {
			return &val
		}
	}

	return nil
}

func parseRemoteOKID(raw json.RawMessage) string {
	if len(raw) == 0 {
		return ""
	}

	var asString string
	if err := json.Unmarshal(raw, &asString); err == nil {
		return strings.TrimSpace(asString)
	}

	var asInt int64
	if err := json.Unmarshal(raw, &asInt); err == nil {
		return strconv.FormatInt(asInt, 10)
	}

	return ""
}

func stripHTMLTags(raw string) string {
	re := regexp.MustCompile("<[^>]*>")
	return re.ReplaceAllString(raw, " ")
}

func stringPtr(val string) *string {
	return &val
}

func timePtr(t time.Time) *time.Time {
	return &t
}
