package main

import (
	"log"
	"os"
	"time"

	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/database"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/handlers"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/middleware"
	"github.com/ayushgupta-15/jobforge-ai/backend-go/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize services
	jobService := services.NewJobService(db)
	scraperService := services.NewScraperService(db, jobService)

	// Start background scraper (every 6 hours)
	go func() {
		ticker := time.NewTicker(6 * time.Hour)
		defer ticker.Stop()

		// Run immediately on startup
		log.Println("Starting initial job scraping...")
		if err := scraperService.ScrapeAllSources(); err != nil {
			log.Printf("Initial scraping error: %v", err)
		}

		// Then run periodically
		for range ticker.C {
			log.Println("Running scheduled job scraping...")
			if err := scraperService.ScrapeAllSources(); err != nil {
				log.Printf("Scheduled scraping error: %v", err)
			}
		}
	}()

	// Setup Gin router
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORS())
	router.Use(middleware.RateLimit())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "jobforge-go",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Job routes
		jobs := api.Group("/jobs")
		{
			jobs.GET("/search", handlers.SearchJobs(jobService))
			jobs.GET("/:id", handlers.GetJob(jobService))
			jobs.POST("/scrape", middleware.AuthMiddleware(), handlers.TriggerScrape(scraperService))
		}

		// Scraper status
		api.GET("/scraper/status", handlers.GetScraperStatus(scraperService))
	}

	// Start server
	port := os.Getenv("GO_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 JobForge Go API starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
