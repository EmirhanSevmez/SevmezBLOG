package handlers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ListPosts(c *gin.Context) {
	var posts []models.Post
	if err := config.DB.Preload("Author").
		Where("published = ?", true).
		Order("created_at DESC").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func GetPost(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	if config.DB.Preload("Author").Preload("Comments.Author").
		First(&post, "id = ? AND published = ?", id, true).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

func CreatePost(c *gin.Context) {
	var body struct {
		Title   string `json:"title"   binding:"required"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	post := models.Post{
		AuthorID:  userID.(uuid.UUID),
		Title:     body.Title,
		Content:   body.Content,
		Published: true,
	}
	if err := config.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}
	if err := config.DB.Preload("Author").First(&post, "id = ?", post.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		return
	}

	c.JSON(http.StatusCreated, post)
}

func DeletePost(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	if config.DB.First(&post, "id = ?", id).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Kendi postu mu yoksa mod+ mı?
	userID, _ := c.Get("userID")
	userRole, _ := c.Get("userRole")
	if post.AuthorID != userID.(uuid.UUID) && !userRole.(models.Role).AtLeast(models.RoleMod) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed"})
		return
	}

	if err := config.DB.Where("post_id = ?", id).Delete(&models.Comment{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comments"})
		return
	}
	if err := config.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}
