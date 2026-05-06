package fr.school.vintagemarketplace.auth.dto;

import fr.school.vintagemarketplace.user.Role;

public record AuthResponse(
        String token,
        Long id,
        String firstname,
        String lastname,
        String email,
        Role role
) {
}