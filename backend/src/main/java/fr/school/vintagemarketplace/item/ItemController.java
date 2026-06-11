package fr.school.vintagemarketplace.item;

import fr.school.vintagemarketplace.item.dto.ItemRequest;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public List<ItemResponse> getAvailableItems() {
        return itemService.getAvailableItems();
    }

    @GetMapping("/{id}")
    public ItemResponse getItemById(@PathVariable Long id) {
        return itemService.getItemById(id);
    }

    @GetMapping("/me")
    public List<ItemResponse> getMyItems(@AuthenticationPrincipal User user) {
        return itemService.getMyItems(user);
    }

    @PostMapping
    public ItemResponse createItem(
            @Valid @RequestBody ItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return itemService.createItem(request, user);
    }

    @PutMapping("/{id}")
    public ItemResponse updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request,
            @AuthenticationPrincipal User user
    ) {
        return itemService.updateItem(id, request, user);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        itemService.deleteItem(id, user);
    }
}