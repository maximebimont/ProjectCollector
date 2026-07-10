package fr.school.vintagemarketplace.admin;

import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminBootstrapRunner runner;

    @BeforeEach
    void setUp() {
        runner = new AdminBootstrapRunner(userRepository, passwordEncoder);
    }

    @ParameterizedTest
    @CsvSource(value = {
            "'',password123",
            "NULL,password123",
            "admin@test.com,''",
            "admin@test.com,NULL"
    }, nullValues = "NULL")
    void shouldSkipWhenEmailOrPasswordNotConfigured(String email, String password) throws Exception {
        ReflectionTestUtils.setField(runner, "bootstrapEmail", email);
        ReflectionTestUtils.setField(runner, "bootstrapPassword", password);

        runner.run(null);

        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldSkipWhenAdminAlreadyExists() throws Exception {
        ReflectionTestUtils.setField(runner, "bootstrapEmail", "admin@test.com");
        ReflectionTestUtils.setField(runner, "bootstrapPassword", "password123");

        when(userRepository.existsByEmail("admin@test.com")).thenReturn(true);

        runner.run(null);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldCreateAdminWhenConfiguredAndAbsent() throws Exception {
        ReflectionTestUtils.setField(runner, "bootstrapEmail", "admin@test.com");
        ReflectionTestUtils.setField(runner, "bootstrapPassword", "password123");

        when(userRepository.existsByEmail("admin@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");

        runner.run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("admin@test.com");
        assertThat(saved.getPassword()).isEqualTo("encoded");
        assertThat(saved.getRole()).isEqualTo(Role.ADMIN);
    }
}
