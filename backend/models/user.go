package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleVisitor  Role = "visitor"
	RoleUser     Role = "user"
	RoleApproved Role = "approved"
	RoleMod      Role = "moderator"
	RoleAdmin    Role = "admin"
)

var roleLevel = map[Role]int{
	RoleVisitor: 0, RoleUser: 1, RoleApproved: 2, RoleMod: 3, RoleAdmin: 4,
}

func (r Role) AtLeast(min Role) bool {
	return roleLevel[r] >= roleLevel[min]
}

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex;not null"  json:"username"`
	Email        string    `gorm:"uniqueIndex;not null"  json:"email"`
	PasswordHash string    `gorm:"not null"              json:"-"`
	Role         Role      `gorm:"default:'user'"        json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
