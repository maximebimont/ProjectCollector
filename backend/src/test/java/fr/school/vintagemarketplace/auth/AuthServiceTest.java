package fr.school.vintagemarketplace.auth;

import fr.school.vintagemarketplace.auth.dto.AuthResponse;
import fr.school.vintagemarketplace.auth.dto.LoginRequest;
import fr.school.vintagemarketplace.auth.dto.RegisterRequest;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .firstname("Paul")
                .lastname("Dupont")
                .email("paul@test.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();
    }

    @Test
    void shouldRegisterNewUser() {
        RegisterRequest request = new RegisterRequest("Paul", "Dupont", "paul@test.com", "password123");

        when(userRepository.existsByEmail("paul@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("paul@test.com");
        assertThat(response.role()).isEqualTo(Role.USER);
    }

    @Test
    void shouldRejectRegisterWhenEmailAlreadyUsed() {
        RegisterRequest request = new RegisterRequest("Paul", "Dupont", "paul@test.com", "password123");

        when(userRepository.existsByEmail("paul@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Un compte existe déjà avec cet email");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("paul@test.com", "password123");

        when(userRepository.findByEmail("paul@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.id()).isEqualTo(1L);
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void shouldRejectLoginWithBadCredentials() {
        LoginRequest request = new LoginRequest("paul@test.com", "wrong-password");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void shouldRejectLoginWhenUserNotFoundAfterAuthentication() {
        LoginRequest request = new LoginRequest("ghost@test.com", "password123");

        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Utilisateur introuvable");
    }
}
