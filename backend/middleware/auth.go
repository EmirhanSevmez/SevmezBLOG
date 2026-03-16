package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

type Claims struct {
	UserID   uuid.UUID   `json:"user_id"`
	Username string      `json:"username"`
	Role     models.Role `json:"role"`
	jwt.RegisteredClaims
}

func getSecret() []byte {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		log.Fatal("JWT_SECRET ortam değişkeni tanımlanmamış!")
	}
	return []byte(s)
}

func GenerateToken(id uuid.UUID, username string, role models.Role) (string, error) {
	claims := Claims{
		UserID:   id,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(getSecret())
}

func parseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return getSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	return token.Claims.(*Claims), nil
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			c.Abort()
			return
		}

		claims, err := parseToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

func RequireRole(min models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("userRole")
		if !role.(models.Role).AtLeast(min) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
