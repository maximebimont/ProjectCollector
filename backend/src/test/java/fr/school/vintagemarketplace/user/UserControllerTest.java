package fr.school.vintagemarketplace.user;

import fr.school.vintagemarketplace.user.dto.UserResponse;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UserControllerTest {

    @Test
    void shouldReturnCurrentUser() {
        User user = User.builder()
                .id(1L)
                .firstname("Paul")
                .lastname("Dupont")
                .email("paul@test.com")
                .role(Role.USER)
                .build();

        UserController controller = new UserController();
        UserResponse response = controller.getCurrentUser(user);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("paul@test.com");
    }
}
