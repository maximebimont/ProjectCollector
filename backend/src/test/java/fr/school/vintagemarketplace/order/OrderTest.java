package fr.school.vintagemarketplace.order;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

class OrderTest {

    @Test
    void prePersistShouldSetDefaultsWhenFieldsAreNull() {
        Order order = new Order();

        order.prePersist();

        assertThat(order.getCreatedAt()).isNotNull();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.COMPLETED);
    }

    @Test
    void prePersistShouldNotOverrideAlreadySetFields() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 10, 0);
        Order order = Order.builder()
                .createdAt(createdAt)
                .status(OrderStatus.CANCELLED)
                .build();

        order.prePersist();

        assertThat(order.getCreatedAt()).isEqualTo(createdAt);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }
}
