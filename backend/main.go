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

	log.Println("Server starting on :8080")
	r.Run(":8080")
}

func seedAdmin() {
	var count int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return
	}

	hash, _ := middleware.HashPassword("admin123")
	admin := models.User{
		Username:     "admin",
		Email:        "admin@blog.com",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
	}
	config.DB.Create(&admin)
	log.Println("Admin user created — admin@blog.com / admin123")
}
