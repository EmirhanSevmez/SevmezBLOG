package handlers

import (
	"net/http"

	"backend/config"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Register(c *gin.Context) {
	var body struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email"    binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var exists models.User
	if config.DB.Where("email = ? OR username = ?", body.Email, body.Username).First(&exists).RowsAffected > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email or username already exists"})
		return
	}

	hash, err := middleware.HashPassword(body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username:     body.Username,
		Email:        body.Email,
		PasswordHash: hash,
		Role:         models.RoleUser,
	}
	config.DB.Create(&user)

	token, _ := middleware.GenerateToken(user.ID, user.Username, user.Role)

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user,
	})
}

func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"    binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if config.DB.Where("email = ?", body.Email).First(&user).Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !middleware.CheckPassword(body.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, _ := middleware.GenerateToken(user.ID, user.Username, user.Role)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

func GetMe(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	config.DB.First(&user, "id = ?", userID.(uuid.UUID))

	c.JSON(http.StatusOK, user)
}
