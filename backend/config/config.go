package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal(".env dosyası bulunamadı! Backend çalışmak için .env dosyasına ihtiyaç duyar.")
	}
}

func ConnectDB() {
	required := []string{"DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_PORT", "JWT_SECRET"}
	for _, key := range required {
		if os.Getenv(key) == "" {
			log.Fatalf("Zorunlu ortam değişkeni eksik: %s", key)
		}
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("DB connection failed:", err)
	}

	log.Println("Database connected")
}

func GetEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
