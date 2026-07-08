package fr.school.vintagemarketplace.auth;

import fr.school.vintagemarketplace.auth.dto.AuthResponse;
import fr.school.vintagemarketplace.auth.dto.LoginRequest;
import fr.school.vintagemarketplace.auth.dto.RegisterRequest;
import fr.school.vintagemarketplace.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController(authService);
    }

    @Test
    void shouldRegister() {
        RegisterRequest request = new RegisterRequest("Paul", "Dupont", "paul@test.com", "password123");
        AuthResponse response = new AuthResponse("token", 1L, "Paul", "Dupont", "paul@test.com", Role.USER);
        when(authService.register(request)).thenReturn(response);

        assertThat(controller.register(request)).isEqualTo(response);
    }

    @Test
    void shouldLogin() {
        LoginRequest request = new LoginRequest("paul@test.com", "password123");
        AuthResponse response = new AuthResponse("token", 1L, "Paul", "Dupont", "paul@test.com", Role.USER);
        when(authService.login(request)).thenReturn(response);

        assertThat(controller.login(request)).isEqualTo(response);
    }
}
