package fr.school.vintagemarketplace.order;

import fr.school.vintagemarketplace.item.Item;
import fr.school.vintagemarketplace.item.ItemRepository;
import fr.school.vintagemarketplace.item.ItemStatus;
import fr.school.vintagemarketplace.order.dto.OrderResponse;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private OrderService orderService;

    private User seller;
    private User buyer;
    private Item availableItem;

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

        buyer = User.builder()
                .id(2L)
                .firstname("Alice")
                .lastname("Acheteur")
                .email("acheteur@test.com")
                .password("password")
                .role(Role.USER)
                .build();

        availableItem = Item.builder()
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
    void shouldBuyAvailableItemSuccessfully() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(availableItem));
        when(orderRepository.existsByItemId(10L)).thenReturn(false);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        OrderResponse response = orderService.buyItem(10L, buyer);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.itemId()).isEqualTo(10L);
        assertThat(response.buyerId()).isEqualTo(2L);
        assertThat(response.sellerId()).isEqualTo(1L);
        assertThat(response.itemPrice()).isEqualByComparingTo("100.00");
        assertThat(response.platformFee()).isEqualByComparingTo("5.00");
        assertThat(response.sellerAmount()).isEqualByComparingTo("95.00");
        assertThat(response.totalAmount()).isEqualByComparingTo("100.00");
        assertThat(response.status()).isEqualTo(OrderStatus.COMPLETED);

        assertThat(availableItem.getStatus()).isEqualTo(ItemStatus.SOLD);

        verify(itemRepository).save(availableItem);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void shouldRejectPurchaseWhenBuyerIsSeller() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(availableItem));

        assertThatThrownBy(() -> orderService.buyItem(10L, seller))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vous ne pouvez pas acheter votre propre objet");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldRejectPurchaseWhenItemIsAlreadySold() {
        availableItem.setStatus(ItemStatus.SOLD);

        when(itemRepository.findById(10L)).thenReturn(Optional.of(availableItem));

        assertThatThrownBy(() -> orderService.buyItem(10L, buyer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cet objet est déjà vendu");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldRejectPurchaseWhenItemDoesNotExist() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.buyItem(999L, buyer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Objet introuvable");

        verify(orderRepository, never()).save(any(Order.class));
    }
}