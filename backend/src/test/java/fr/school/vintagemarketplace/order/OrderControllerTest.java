package fr.school.vintagemarketplace.order;

import fr.school.vintagemarketplace.order.dto.OrderResponse;
import fr.school.vintagemarketplace.user.Role;
import fr.school.vintagemarketplace.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    private OrderController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new OrderController(orderService);
        user = User.builder().id(1L).email("paul@test.com").role(Role.USER).build();
    }

    @Test
    void shouldBuyItem() {
        OrderResponse response = sampleResponse();
        when(orderService.buyItem(10L, user)).thenReturn(response);

        assertThat(controller.buyItem(10L, user)).isEqualTo(response);
    }

    @Test
    void shouldReturnMyPurchases() {
        List<OrderResponse> orders = List.of(sampleResponse());
        when(orderService.getMyPurchases(user)).thenReturn(orders);

        assertThat(controller.getMyPurchases(user)).isEqualTo(orders);
    }

    @Test
    void shouldReturnMySales() {
        List<OrderResponse> orders = List.of(sampleResponse());
        when(orderService.getMySales(user)).thenReturn(orders);

        assertThat(controller.getMySales(user)).isEqualTo(orders);
    }

    private OrderResponse sampleResponse() {
        return new OrderResponse(
                1L,
                10L, "Titre", null,
                2L, "Alice", "Acheteur",
                1L, "Paul", "Vendeur",
                new BigDecimal("100.00"), new BigDecimal("5.00"),
                new BigDecimal("95.00"), new BigDecimal("100.00"),
                OrderStatus.COMPLETED, null
        );
    }
}
