package fr.school.vintagemarketplace.admin.dto;

import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(
        @NotNull Boolean enabled
) {
}
