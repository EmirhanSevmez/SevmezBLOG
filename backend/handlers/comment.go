package handlers

import (
	"net/http"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateComment(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	if config.DB.First(&post, "id = ? AND published = ?", postID, true).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var body struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	comment := models.Comment{
		PostID:   postID,
		AuthorID: userID.(uuid.UUID),
		Content:  body.Content,
	}
	config.DB.Create(&comment)
	config.DB.Preload("Author").First(&comment, "id = ?", comment.ID)

	c.JSON(http.StatusCreated, comment)
}

func DeleteComment(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var comment models.Comment
	if config.DB.First(&comment, "id = ?", id).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	config.DB.Delete(&comment)

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted"})
}
