package fr.school.vintagemarketplace.item.dto;

import fr.school.vintagemarketplace.item.Item;
import fr.school.vintagemarketplace.item.ItemStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        String imageUrl,
        ItemStatus status,
        Long sellerId,
        String sellerFirstname,
        String sellerLastname,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getPrice(),
                item.getImageUrl(),
                item.getStatus(),
                item.getSeller().getId(),
                item.getSeller().getFirstname(),
                item.getSeller().getLastname(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}