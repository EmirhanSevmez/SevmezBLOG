package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Post struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	AuthorID  uuid.UUID `gorm:"type:uuid;not null"   json:"author_id"`
	Title     string    `gorm:"not null"              json:"title"`
	Content   string    `gorm:"type:text;not null"    json:"content"`
	Published bool      `gorm:"default:false"         json:"published"`
	CreatedAt time.Time `json:"created_at"`

	Author   User      `gorm:"foreignKey:AuthorID" json:"author"`
	Comments []Comment `gorm:"foreignKey:PostID"   json:"comments,omitempty"`
}

func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
