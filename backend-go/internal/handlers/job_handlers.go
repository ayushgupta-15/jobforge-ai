package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/models"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/services"
)

// SearchJobs handles job search requests
func SearchJobs(jobService *services.JobService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var params models.JobSearchParams
		if err := c.ShouldBindQuery(&params); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		jobs, err := jobService.SearchJobs(params)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"jobs":  jobs,
			"count": len(jobs),
			"page":  params.Page,
			"limit": params.Limit,
		})
	}
}

// GetJob handles getting a single job by ID
func GetJob(jobService *services.JobService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		job, err := jobService.GetJobByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
			return
		}

		c.JSON(http.StatusOK, job)
	}
}

// TriggerScrape manually triggers job scraping (requires auth)
func TriggerScrape(scraperService *services.ScraperService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start scraping in background
		go scraperService.ScrapeAllSources()

		c.JSON(http.StatusAccepted, gin.H{
			"message": "Scraping started in background",
			"status":  "processing",
		})
	}
}

// GetScraperStatus returns scraper health and stats
func GetScraperStatus(scraperService *services.ScraperService) gin.HandlerFunc {
	return func(c *gin.Context) {
		status := scraperService.GetStatus()
		c.JSON(http.StatusOK, status)
	}
}