package fr.school.vintagemarketplace.user.dto;

import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

class UserResponseTest {

    @Test
    void shouldMapUserToUserResponse() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 10, 0);

        User user = User.builder()
                .id(1L)
                .firstname("Paul")
                .lastname("Dupont")
                .email("paul@test.com")
                .password("secret")
                .role(Role.USER)
                .createdAt(createdAt)
                .build();

        UserResponse response = UserResponse.from(user);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.firstname()).isEqualTo("Paul");
        assertThat(response.lastname()).isEqualTo("Dupont");
        assertThat(response.email()).isEqualTo("paul@test.com");
        assertThat(response.role()).isEqualTo(Role.USER);
        assertThat(response.createdAt()).isEqualTo(createdAt);
    }
}
