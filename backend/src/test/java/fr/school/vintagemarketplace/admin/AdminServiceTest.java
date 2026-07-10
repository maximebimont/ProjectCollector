package fr.school.vintagemarketplace.admin;

import fr.school.vintagemarketplace.item.Item;
import fr.school.vintagemarketplace.item.ItemRepository;
import fr.school.vintagemarketplace.item.ItemStatus;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import fr.school.vintagemarketplace.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private AdminService adminService;

    private User admin;
    private User otherUser;
    private Item item;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L)
                .firstname("Admin")
                .lastname("Collector")
                .email("admin@test.com")
                .password("password")
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        otherUser = User.builder()
                .id(2L)
                .firstname("Paul")
                .lastname("Vendeur")
                .email("vendeur@test.com")
                .password("password")
                .role(Role.USER)
                .enabled(true)
                .build();

        item = Item.builder()
                .id(10L)
                .title("Figurine douteuse")
                .description("Annonce a moderer")
                .price(new BigDecimal("10.00"))
                .status(ItemStatus.AVAILABLE)
                .seller(otherUser)
                .build();
    }

    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(admin, otherUser));

        List<UserResponse> result = adminService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).email()).isEqualTo("admin@test.com");
    }

    @Test
    void shouldDisableUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(userRepository.save(any(User.class))).thenReturn(otherUser);

        UserResponse response = adminService.setUserEnabled(2L, false, admin);

        assertThat(otherUser.isEnabled()).isFalse();
        assertThat(response.enabled()).isFalse();
    }

    @Test
    void shouldReenableUser() {
        otherUser.setEnabled(false);

        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(userRepository.save(any(User.class))).thenReturn(otherUser);

        UserResponse response = adminService.setUserEnabled(2L, true, admin);

        assertThat(response.enabled()).isTrue();
    }

    @Test
    void shouldRejectDisablingOwnAccount() {
        assertThatThrownBy(() -> adminService.setUserEnabled(1L, false, admin))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vous ne pouvez pas modifier le statut de votre propre compte");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRejectStatusUpdateWhenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.setUserEnabled(999L, false, admin))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Utilisateur introuvable");
    }

    @Test
    void shouldReturnAllItemsRegardlessOfSellerOrStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Item> page = new PageImpl<>(List.of(item), pageable, 1);

        when(itemRepository.findAllBy(pageable)).thenReturn(page);

        Page<ItemResponse> result = adminService.getAllItems(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(10L);
    }

    @Test
    void shouldDeleteAnyItemAsModeratorEvenWhenNotOwner() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));

        adminService.deleteItemAsModerator(10L);

        verify(itemRepository).delete(item);
    }

    @Test
    void shouldRejectDeleteWhenItemNotFound() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.deleteItemAsModerator(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Objet introuvable");
    }
}
