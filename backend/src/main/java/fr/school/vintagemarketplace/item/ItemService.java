package fr.school.vintagemarketplace.item;

import fr.school.vintagemarketplace.item.dto.ItemRequest;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public Page<ItemResponse> getAvailableItems(Pageable pageable) {
        return itemRepository.findAllByStatus(ItemStatus.AVAILABLE, pageable)
                .map(ItemResponse::from);
    }

    public ItemResponse getItemById(Long id) {
        Item item = findItemById(id);
        return ItemResponse.from(item);
    }

    public List<ItemResponse> getMyItems(User user) {
        return itemRepository.findAllBySellerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ItemResponse::from)
                .toList();
    }

    public ItemResponse createItem(ItemRequest request, User seller) {
        Item item = Item.builder()
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .status(ItemStatus.AVAILABLE)
                .seller(seller)
                .build();

        Item savedItem = itemRepository.save(item);

        return ItemResponse.from(savedItem);
    }

    public ItemResponse updateItem(Long id, ItemRequest request, User user) {
        Item item = findItemById(id);

        checkOwner(item, user);

        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setImageUrl(request.imageUrl());

        Item updatedItem = itemRepository.save(item);

        return ItemResponse.from(updatedItem);
    }

    public void deleteItem(Long id, User user) {
        Item item = findItemById(id);

        checkOwner(item, user);

        itemRepository.delete(item);
    }

    private Item findItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Objet introuvable"));
    }

    private void checkOwner(Item item, User user) {
        if (!item.getSeller().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Vous ne pouvez modifier que vos propres objets");
        }
    }
}