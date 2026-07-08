package fr.school.vintagemarketplace.item;

import fr.school.vintagemarketplace.item.dto.ItemRequest;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemService itemService;

    private User seller;
    private User otherUser;
    private Item item;

    @BeforeEach
    void setUp() {
        seller = User.builder()
                .id(1L)
                .firstname("Paul")
                .lastname("Vendeur")
                .email("vendeur@test.com")
                .password("password")
                .role(Role.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .firstname("Alice")
                .lastname("Autre")
                .email("autre@test.com")
                .password("password")
                .role(Role.USER)
                .build();

        item = Item.builder()
                .id(10L)
                .title("Figurine Star Wars vintage")
                .description("Figurine originale en bon état")
                .price(new BigDecimal("100.00"))
                .imageUrl("https://example.com/star-wars.jpg")
                .status(ItemStatus.AVAILABLE)
                .seller(seller)
                .build();
    }

    @Test
    void shouldReturnAvailableItems() {
        when(itemRepository.findAllByStatusOrderByCreatedAtDesc(ItemStatus.AVAILABLE))
                .thenReturn(List.of(item));

        List<ItemResponse> result = itemService.getAvailableItems();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(10L);
    }

    @Test
    void shouldReturnItemById() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));

        ItemResponse response = itemService.getItemById(10L);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.title()).isEqualTo("Figurine Star Wars vintage");
    }

    @Test
    void shouldRejectGetItemByIdWhenNotFound() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> itemService.getItemById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Objet introuvable");
    }

    @Test
    void shouldReturnMyItems() {
        when(itemRepository.findAllBySellerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item));

        List<ItemResponse> result = itemService.getMyItems(seller);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).sellerId()).isEqualTo(1L);
    }

    @Test
    void shouldCreateItem() {
        ItemRequest request = new ItemRequest(
                "Nouvel objet",
                "Une description",
                new BigDecimal("49.90"),
                "https://example.com/image.jpg"
        );

        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> {
            Item saved = invocation.getArgument(0);
            saved.setId(20L);
            return saved;
        });

        ItemResponse response = itemService.createItem(request, seller);

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.title()).isEqualTo("Nouvel objet");
        assertThat(response.status()).isEqualTo(ItemStatus.AVAILABLE);
        assertThat(response.sellerId()).isEqualTo(1L);
    }

    @Test
    void shouldUpdateItemWhenOwner() {
        ItemRequest request = new ItemRequest(
                "Titre modifié",
                "Description modifiée",
                new BigDecimal("75.00"),
                "https://example.com/new-image.jpg"
        );

        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(itemRepository.save(any(Item.class))).thenReturn(item);

        ItemResponse response = itemService.updateItem(10L, request, seller);

        assertThat(response.title()).isEqualTo("Titre modifié");
        assertThat(item.getPrice()).isEqualByComparingTo("75.00");
    }

    @Test
    void shouldRejectUpdateWhenNotOwner() {
        ItemRequest request = new ItemRequest(
                "Titre modifié",
                "Description modifiée",
                new BigDecimal("75.00"),
                null
        );

        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> itemService.updateItem(10L, request, otherUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vous ne pouvez modifier que vos propres objets");

        verify(itemRepository, never()).save(any(Item.class));
    }

    @Test
    void shouldRejectUpdateWhenItemNotFound() {
        ItemRequest request = new ItemRequest("T", "D", new BigDecimal("1.00"), null);

        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> itemService.updateItem(999L, request, seller))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Objet introuvable");
    }

    @Test
    void shouldDeleteItemWhenOwner() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));

        itemService.deleteItem(10L, seller);

        verify(itemRepository).delete(item);
    }

    @Test
    void shouldRejectDeleteWhenNotOwner() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> itemService.deleteItem(10L, otherUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vous ne pouvez modifier que vos propres objets");

        verify(itemRepository, never()).delete(any(Item.class));
    }

    @Test
    void shouldRejectDeleteWhenItemNotFound() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> itemService.deleteItem(999L, seller))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Objet introuvable");
    }
}
