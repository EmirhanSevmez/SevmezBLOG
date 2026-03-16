package handlers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ListUsers(c *gin.Context) {
	var users []models.User
	config.DB.Order("created_at DESC").Find(&users)

	c.JSON(http.StatusOK, users)
}

func UpdateUserRole(c *gin.Context) {
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var body struct {
		Role models.Role `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	valid := map[models.Role]bool{
		models.RoleVisitor: true, models.RoleUser: true,
		models.RoleApproved: true, models.RoleMod: true, models.RoleAdmin: true,
	}
	if !valid[body.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	currentID, _ := c.Get("userID")
	if targetID == currentID.(uuid.UUID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change your own role"})
		return
	}

	var target models.User
	if config.DB.First(&target, "id = ?", targetID).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	config.DB.Model(&target).Update("role", body.Role)

	c.JSON(http.StatusOK, gin.H{
		"message": "Role updated",
		"user":    target,
	})
}
