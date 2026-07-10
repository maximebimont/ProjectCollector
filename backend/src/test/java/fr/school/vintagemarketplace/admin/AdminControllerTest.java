package fr.school.vintagemarketplace.admin;

import fr.school.vintagemarketplace.admin.dto.AdminUserStatusRequest;
import fr.school.vintagemarketplace.item.ItemStatus;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    private AdminController controller;
    private User admin;

    @BeforeEach
    void setUp() {
        controller = new AdminController(adminService);
        admin = User.builder().id(1L).email("admin@test.com").role(Role.ADMIN).build();
    }

    @Test
    void shouldReturnAllUsers() {
        List<UserResponse> users = List.of(sampleUserResponse());
        when(adminService.getAllUsers()).thenReturn(users);

        assertThat(controller.getAllUsers()).isEqualTo(users);
    }

    @Test
    void shouldUpdateUserStatus() {
        AdminUserStatusRequest request = new AdminUserStatusRequest(false);
        UserResponse response = sampleUserResponse();
        when(adminService.setUserEnabled(2L, false, admin)).thenReturn(response);

        assertThat(controller.updateUserStatus(2L, request, admin)).isEqualTo(response);
    }

    @Test
    void shouldReturnAllItems() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<ItemResponse> items = new PageImpl<>(List.of(sampleItemResponse()), pageable, 1);
        when(adminService.getAllItems(pageable)).thenReturn(items);

        assertThat(controller.getAllItems(pageable)).isEqualTo(items);
    }

    @Test
    void shouldDeleteItem() {
        controller.deleteItem(10L);

        verify(adminService).deleteItemAsModerator(10L);
    }

    private UserResponse sampleUserResponse() {
        return new UserResponse(
                2L, "Paul", "Vendeur", "vendeur@test.com", Role.USER, false, LocalDateTime.now()
        );
    }

    private ItemResponse sampleItemResponse() {
        return new ItemResponse(
                10L, "Titre", "Description", new BigDecimal("10.00"), null,
                ItemStatus.AVAILABLE, 2L, "Paul", "Vendeur", null, null
        );
    }
}
