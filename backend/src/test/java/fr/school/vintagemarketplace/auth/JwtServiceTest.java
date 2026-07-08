package fr.school.vintagemarketplace.auth;

import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService, "secretKey",
                "ZmFrZVNlY3JldEtleUZvclNjaG9vbFByb2plY3RNdXN0QmVMb25nRW5vdWdoMzI="
        );
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        user = User.builder()
                .id(1L)
                .firstname("Paul")
                .lastname("Dupont")
                .email("paul@test.com")
                .password("secret")
                .role(Role.USER)
                .build();
    }

    @Test
    void shouldGenerateTokenAndExtractUsername() {
        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("paul@test.com");
    }

    @Test
    void shouldValidateTokenForMatchingUser() {
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        String token = jwtService.generateToken(user);

        User otherUser = User.builder()
                .id(2L)
                .firstname("Alice")
                .lastname("Autre")
                .email("autre@test.com")
                .password("secret")
                .role(Role.USER)
                .build();

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }
}
