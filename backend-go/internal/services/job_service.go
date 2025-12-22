package services

import (
	"database/sql"
	"fmt"

	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
	"github.com/lib/pq"
)

type JobService struct {
	db *sql.DB
}

func NewJobService(db *sql.DB) *JobService {
	return &JobService{db: db}
}

// SearchJobs searches for jobs with filters
func (s *JobService) SearchJobs(params models.JobSearchParams) ([]models.Job, error) {
	// Build query
	query := `
		SELECT id, title, company, location, remote_type, description, 
		       requirements, raw_description, salary_min, salary_max, job_type, 
		       experience_level, source_url, validated_source_url, source_site,
		       ai_summary, ai_highlights, ai_required_skills, ai_compensation, ai_remote_policy,
		       is_active, posted_date, ai_last_enriched_at, created_at
		FROM jobs
		WHERE is_active = true
	`
	args := []interface{}{}
	argCount := 1

	// Add filters
	if params.Query != "" {
		query += fmt.Sprintf(` AND (
			title ILIKE $%d OR 
			company ILIKE $%d OR 
			description ILIKE $%d
		)`, argCount, argCount, argCount)
		args = append(args, "%"+params.Query+"%")
		argCount++
	}

	if params.Location != "" {
		query += fmt.Sprintf(` AND location ILIKE $%d`, argCount)
		args = append(args, "%"+params.Location+"%")
		argCount++
	}

	if params.Remote {
		query += ` AND remote_type IN ('remote', 'hybrid')`
	}

	if params.JobType != "" {
		query += fmt.Sprintf(` AND job_type = $%d`, argCount)
		args = append(args, params.JobType)
		argCount++
	}

	if params.MinSalary > 0 {
		query += fmt.Sprintf(` AND salary_max >= $%d`, argCount)
		args = append(args, params.MinSalary)
		argCount++
	}

	// Order by most recent
	query += ` ORDER BY created_at DESC`

	// Pagination
	if params.Limit <= 0 {
		params.Limit = 50
	}
	if params.Page <= 0 {
		params.Page = 1
	}
	offset := (params.Page - 1) * params.Limit

	query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argCount, argCount+1)
	args = append(args, params.Limit, offset)

	// Execute query
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	// Parse results
	jobs := []models.Job{}
	for rows.Next() {
		var job models.Job
		var highlights pq.StringArray
		var skills pq.StringArray

		err := rows.Scan(
			&job.ID, &job.Title, &job.Company, &job.Location,
			&job.RemoteType, &job.Description, &job.Requirements, &job.RawDescription,
			&job.SalaryMin, &job.SalaryMax, &job.JobType,
			&job.ExperienceLevel, &job.SourceURL, &job.ValidatedSourceURL, &job.SourceSite,
			&job.AISummary, &highlights, &skills, &job.AICompensation, &job.AIRemotePolicy,
			&job.IsActive, &job.PostedDate, &job.AILastEnrichedAt, &job.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		job.AIHighlights = []string(highlights)
		job.AIRequiredSkills = []string(skills)
		jobs = append(jobs, job)
	}

	return jobs, nil
}

// GetJobByID gets a single job
func (s *JobService) GetJobByID(id string) (*models.Job, error) {
	query := `
		SELECT id, title, company, location, remote_type, description, 
		       requirements, raw_description, salary_min, salary_max, job_type, 
		       experience_level, source_url, validated_source_url, source_site,
		       ai_summary, ai_highlights, ai_required_skills, ai_compensation, ai_remote_policy,
		       is_active, posted_date, ai_last_enriched_at, created_at
		FROM jobs
		WHERE id = $1
	`

	var job models.Job
	var highlights pq.StringArray
	var skills pq.StringArray
	err := s.db.QueryRow(query, id).Scan(
		&job.ID, &job.Title, &job.Company, &job.Location,
		&job.RemoteType, &job.Description, &job.Requirements, &job.RawDescription,
		&job.SalaryMin, &job.SalaryMax, &job.JobType,
		&job.ExperienceLevel, &job.SourceURL, &job.ValidatedSourceURL, &job.SourceSite,
		&job.AISummary, &highlights, &skills, &job.AICompensation, &job.AIRemotePolicy,
		&job.IsActive, &job.PostedDate, &job.AILastEnrichedAt, &job.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("job not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	job.AIHighlights = []string(highlights)
	job.AIRequiredSkills = []string(skills)

	return &job, nil
}

// CreateJob inserts a new job (called by scraper)
func (s *JobService) CreateJob(job *models.Job) error {
	// Check if job already exists (by source_url)
	if job.SourceURL != nil && *job.SourceURL != "" {
		exists, err := s.jobExists(*job.SourceURL)
		if err != nil {
			return err
		}
		if exists {
			return nil // Skip duplicate
		}
	}

	if job.ValidatedSourceURL == nil && job.SourceURL != nil {
		job.ValidatedSourceURL = job.SourceURL
	}

	query := `
		INSERT INTO jobs (
			title, company, location, remote_type, description,
			requirements, salary_min, salary_max, job_type,
			experience_level, source_url, validated_source_url, source_site,
			raw_description, is_active, posted_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING id, created_at
	`

	err := s.db.QueryRow(
		query,
		job.Title, job.Company, job.Location, job.RemoteType,
		job.Description, job.Requirements, job.SalaryMin,
		job.SalaryMax, job.JobType, job.ExperienceLevel,
		job.SourceURL, job.ValidatedSourceURL, job.SourceSite,
		job.RawDescription, job.IsActive, job.PostedDate,
	).Scan(&job.ID, &job.CreatedAt)

	if err != nil {
		return fmt.Errorf("insert failed: %w", err)
	}

	return nil
}

// jobExists checks if a job with the same source_url already exists
func (s *JobService) jobExists(sourceURL string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM jobs WHERE source_url = $1)`
	err := s.db.QueryRow(query, sourceURL).Scan(&exists)
	return exists, err
}
