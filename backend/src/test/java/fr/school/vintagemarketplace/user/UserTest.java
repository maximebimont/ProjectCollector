package fr.school.vintagemarketplace.user;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void prePersistShouldSetDefaultsWhenFieldsAreNull() {
        User user = new User();

        user.prePersist();

        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getRole()).isEqualTo(Role.USER);
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    void prePersistShouldNotOverrideAlreadySetFields() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 10, 0);
        User user = User.builder()
                .createdAt(createdAt)
                .role(Role.ADMIN)
                .enabled(false)
                .build();

        user.prePersist();

        assertThat(user.getCreatedAt()).isEqualTo(createdAt);
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.isEnabled()).isFalse();
    }

    @Test
    void isEnabledShouldReflectDisabledAccount() {
        User user = User.builder()
                .email("paul@test.com")
                .role(Role.USER)
                .enabled(false)
                .build();

        assertThat(user.isEnabled()).isFalse();
    }

    @Test
    void shouldExposeUserDetailsContract() {
        User user = User.builder()
                .email("paul@test.com")
                .role(Role.ADMIN)
                .build();

        assertThat(user.getUsername()).isEqualTo("paul@test.com");
        assertThat(user.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_ADMIN");
        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }
}
