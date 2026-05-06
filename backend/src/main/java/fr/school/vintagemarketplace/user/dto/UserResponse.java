package fr.school.vintagemarketplace.user.dto;

import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String firstname,
        String lastname,
        String email,
        Role role,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}