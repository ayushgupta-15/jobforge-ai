package scrapers

import (
	"encoding/xml"
	"fmt"
	"html"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

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
	log.Println("Scraping WeWorkRemotely via RSS...")

	feed, err := fetchWeWorkRemotelyRSS("https://weworkremotely.com/remote-jobs.rss")
	if err != nil {
		return nil, err
	}

	jobs := make([]*models.Job, 0, len(feed.Channel.Items))
	for _, item := range feed.Channel.Items {
		if job := convertWWRItem(item); job != nil {
			jobs = append(jobs, job)
		}
	}

	log.Printf("WeWorkRemotely: Found %d jobs", len(jobs))
	return jobs, nil
}

type wwrRSS struct {
	Channel wwrChannel `xml:"channel"`
}

type wwrChannel struct {
	Items []wwrItem `xml:"item"`
}

type wwrItem struct {
	Title       string   `xml:"title"`
	Link        string   `xml:"link"`
	Description string   `xml:"description"`
	PubDate     string   `xml:"pubDate"`
	GUID        string   `xml:"guid"`
	Categories  []string `xml:"category"`
}

func convertWWRItem(item wwrItem) *models.Job {
	titleText := strings.TrimSpace(html.UnescapeString(item.Title))
	if titleText == "" || strings.TrimSpace(item.Link) == "" {
		return nil
	}

	company, title := splitWWRTitle(titleText)
	if company == "" || title == "" {
		return nil
	}

	location, jobType := locationAndTypeFromCategories(item.Categories)
	if location == "" {
		if descLoc := extractWWRLocation(item.Description); descLoc != "" {
			location = descLoc
		} else {
			location = "Remote"
		}
	}
	if jobType == "" {
		jobType = "full-time"
	}

	remoteType := "remote"
	rawDescription := strings.TrimSpace(item.Description)
	description := strings.TrimSpace(stripHTMLTags(html.UnescapeString(rawDescription)))
	if description == "" {
		description = fmt.Sprintf("%s position at %s", title, company)
	}

	var postedDate *time.Time
	if t, err := time.Parse(time.RFC1123Z, item.PubDate); err == nil {
		postedDate = timePtr(t)
	} else if t, err := time.Parse(time.RFC1123, item.PubDate); err == nil {
		postedDate = timePtr(t)
	}

	sourceURL := strings.TrimSpace(item.Link)

	return &models.Job{
		Title:              title,
		Company:            company,
		Location:           location,
		RemoteType:         &remoteType,
		Description:        description,
		SourceURL:          &sourceURL,
		ValidatedSourceURL: &sourceURL,
		JobType:            &jobType,
		RawDescription:     &rawDescription,
		IsActive:           true,
		PostedDate:         postedDate,
		SourceSite:         stringPtr("WeWorkRemotely"),
	}
}

func fetchWeWorkRemotelyRSS(url string) (*wwrRSS, error) {
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build WeWorkRemotely request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; JobForgeBot/1.0)")
	req.Header.Set("Accept", "application/rss+xml, application/xml;q=0.9, */*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch WeWorkRemotely: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("WeWorkRemotely returned status %d", resp.StatusCode)
	}

	var feed wwrRSS
	decoder := xml.NewDecoder(resp.Body)
	decoder.Strict = false
	if err := decoder.Decode(&feed); err != nil {
		return nil, fmt.Errorf("failed to parse WeWorkRemotely RSS: %w", err)
	}

	return &feed, nil
}

func splitWWRTitle(raw string) (company, title string) {
	parts := strings.SplitN(raw, ":", 2)
	if len(parts) == 2 {
		return strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
	}

	parts = strings.SplitN(raw, " - ", 2)
	if len(parts) == 2 {
		return strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
	}

	return "", strings.TrimSpace(raw)
}

func extractWWRLocation(description string) string {
	re := regexp.MustCompile(`(?i)(worldwide|global|anywhere|remote|\b[A-Za-z]+\/[A-Za-z]+\b)`)
	match := re.FindString(description)
	return strings.TrimSpace(match)
}

func locationAndTypeFromCategories(categories []string) (location, jobType string) {
	for _, cat := range categories {
		c := strings.ToLower(strings.TrimSpace(cat))
		switch {
		case strings.Contains(c, "contract"):
			jobType = "contract"
		case strings.Contains(c, "part-time"):
			jobType = "part-time"
		case strings.Contains(c, "full-time") && jobType == "":
			jobType = "full-time"
		}

		if strings.Contains(c, "worldwide") || strings.Contains(c, "anywhere") {
			location = "Worldwide"
		}
	}
	return
}
