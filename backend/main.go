package main

import (
	"log"

	"backend/config"
	"backend/middleware"
	"backend/models"
	"backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(config.GetEnv("GIN_MODE", gin.ReleaseMode))

	config.ConnectDB()

	config.DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Comment{},
	)
	log.Println("Migration completed")

	seedAdmin()

	r := gin.Default()
	r.Use(middleware.CORS())
	routes.Setup(r)

	port := config.GetEnv("PORT", "8080")
	log.Printf("Server starting on :%s\n", port)
	r.Run(":" + port)
}

func seedAdmin() {
	var count int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return
	}

	hash, err := middleware.HashPassword("admin123")
	if err != nil {
		log.Fatalf("Failed to hash admin password: %v", err)
	}
	admin := models.User{
		Username:     "admin",
		Email:        "admin@blog.com",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
	}
	if err := config.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}
	log.Println("Admin user created — admin@blog.com / admin123")
}
