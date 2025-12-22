package models

import (
	"time"
)

// Job represents a job posting
type Job struct {
	ID                 string     `json:"id"`
	Title              string     `json:"title"`
	Company            string     `json:"company"`
	Location           string     `json:"location"`
	RemoteType         *string    `json:"remote_type"`
	Description        string     `json:"description"`
	Requirements       *string    `json:"requirements"`
	RawDescription     *string    `json:"raw_description"`
	SalaryMin          *float64   `json:"salary_min"`
	SalaryMax          *float64   `json:"salary_max"`
	JobType            *string    `json:"job_type"`
	ExperienceLevel    *string    `json:"experience_level"`
	SourceURL          *string    `json:"source_url"`
	ValidatedSourceURL *string    `json:"validated_source_url"`
	SourceSite         *string    `json:"source_site"`
	AISummary          *string    `json:"ai_summary"`
	AIHighlights       []string   `json:"ai_highlights,omitempty"`
	AIRequiredSkills   []string   `json:"ai_required_skills,omitempty"`
	AICompensation     *string    `json:"ai_compensation"`
	AIRemotePolicy     *string    `json:"ai_remote_policy"`
	IsActive           bool       `json:"is_active"`
	PostedDate         *time.Time `json:"posted_date"`
	AILastEnrichedAt   *time.Time `json:"ai_last_enriched_at"`
	CreatedAt          time.Time  `json:"created_at"`
}

// JobSearchParams represents search parameters
type JobSearchParams struct {
	Query     string  `form:"query"`
	Location  string  `form:"location"`
	Remote    bool    `form:"remote"`
	JobType   string  `form:"job_type"`
	MinSalary float64 `form:"min_salary"`
	MaxSalary float64 `form:"max_salary"`
	Page      int     `form:"page"`
	Limit     int     `form:"limit"`
}

// ScraperStatus represents scraper health
type ScraperStatus struct {
	IsRunning       bool      `json:"is_running"`
	LastRun         time.Time `json:"last_run"`
	JobsScraped     int       `json:"jobs_scraped"`
	SuccessfulSites []string  `json:"successful_sites"`
	FailedSites     []string  `json:"failed_sites"`
}
