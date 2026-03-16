package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	api := r.Group("/api")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api.POST("/auth/register", handlers.Register)
	api.POST("/auth/login", handlers.Login)
	api.GET("/auth/me", middleware.AuthRequired(), handlers.GetMe)

	api.GET("/posts", handlers.ListPosts)
	api.GET("/posts/:id", handlers.GetPost)

	api.POST("/posts",
		middleware.AuthRequired(),
		middleware.RequireRole(models.RoleApproved),
		handlers.CreatePost,
	)
	api.DELETE("/posts/:id",
		middleware.AuthRequired(),
		middleware.RequireRole(models.RoleApproved),
		handlers.DeletePost,
	)

	api.POST("/posts/:id/comments",
		middleware.AuthRequired(),
		middleware.RequireRole(models.RoleUser),
		handlers.CreateComment,
	)
	api.DELETE("/comments/:id",
		middleware.AuthRequired(),
		middleware.RequireRole(models.RoleMod),
		handlers.DeleteComment,
	)

	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired())
	{
		admin.GET("/users",
			middleware.RequireRole(models.RoleMod),
			handlers.ListUsers,
		)
		admin.PUT("/users/:id/role",
			middleware.RequireRole(models.RoleAdmin),
			handlers.UpdateUserRole,
		)
	}
}
