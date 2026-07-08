package fr.school.vintagemarketplace.item;

import fr.school.vintagemarketplace.item.dto.ItemRequest;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemControllerTest {

    @Mock
    private ItemService itemService;

    private ItemController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new ItemController(itemService);
        user = User.builder().id(1L).email("paul@test.com").role(Role.USER).build();
    }

    @Test
    void shouldReturnAvailableItems() {
        List<ItemResponse> items = List.of(sampleResponse());
        when(itemService.getAvailableItems()).thenReturn(items);

        assertThat(controller.getAvailableItems()).isEqualTo(items);
    }

    @Test
    void shouldReturnItemById() {
        ItemResponse response = sampleResponse();
        when(itemService.getItemById(10L)).thenReturn(response);

        assertThat(controller.getItemById(10L)).isEqualTo(response);
    }

    @Test
    void shouldReturnMyItems() {
        List<ItemResponse> items = List.of(sampleResponse());
        when(itemService.getMyItems(user)).thenReturn(items);

        assertThat(controller.getMyItems(user)).isEqualTo(items);
    }

    @Test
    void shouldCreateItem() {
        ItemRequest request = new ItemRequest("Titre", "Description", new BigDecimal("10.00"), null);
        ItemResponse response = sampleResponse();
        when(itemService.createItem(request, user)).thenReturn(response);

        assertThat(controller.createItem(request, user)).isEqualTo(response);
    }

    @Test
    void shouldUpdateItem() {
        ItemRequest request = new ItemRequest("Titre", "Description", new BigDecimal("10.00"), null);
        ItemResponse response = sampleResponse();
        when(itemService.updateItem(10L, request, user)).thenReturn(response);

        assertThat(controller.updateItem(10L, request, user)).isEqualTo(response);
    }

    @Test
    void shouldDeleteItem() {
        controller.deleteItem(10L, user);

        verify(itemService).deleteItem(10L, user);
    }

    private ItemResponse sampleResponse() {
        return new ItemResponse(
                10L, "Titre", "Description", new BigDecimal("10.00"), null,
                ItemStatus.AVAILABLE, 1L, "Paul", "Vendeur", null, null
        );
    }
}
