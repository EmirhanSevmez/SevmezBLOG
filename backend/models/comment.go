package models

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null"   json:"post_id"`
	AuthorID  uuid.UUID `gorm:"type:uuid;not null"   json:"author_id"`
	Content   string    `gorm:"type:text;not null"    json:"content"`
	CreatedAt time.Time `json:"created_at"`

	Author User `gorm:"foreignKey:AuthorID" json:"author"`
}
