package fr.school.vintagemarketplace.item;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

class ItemTest {

    @Test
    void prePersistShouldSetDefaultsWhenFieldsAreNull() {
        Item item = new Item();

        item.prePersist();

        assertThat(item.getCreatedAt()).isNotNull();
        assertThat(item.getStatus()).isEqualTo(ItemStatus.AVAILABLE);
    }

    @Test
    void prePersistShouldNotOverrideAlreadySetFields() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 10, 0);
        Item item = Item.builder()
                .createdAt(createdAt)
                .status(ItemStatus.SOLD)
                .build();

        item.prePersist();

        assertThat(item.getCreatedAt()).isEqualTo(createdAt);
        assertThat(item.getStatus()).isEqualTo(ItemStatus.SOLD);
    }

    @Test
    void preUpdateShouldSetUpdatedAt() {
        Item item = new Item();

        item.preUpdate();

        assertThat(item.getUpdatedAt()).isNotNull();
    }
}
