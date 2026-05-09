package fr.school.vintagemarketplace.order.dto;

import fr.school.vintagemarketplace.order.Order;
import fr.school.vintagemarketplace.order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,

        Long itemId,
        String itemTitle,
        String itemImageUrl,

        Long buyerId,
        String buyerFirstname,
        String buyerLastname,

        Long sellerId,
        String sellerFirstname,
        String sellerLastname,

        BigDecimal itemPrice,
        BigDecimal platformFee,
        BigDecimal sellerAmount,
        BigDecimal totalAmount,

        OrderStatus status,
        LocalDateTime createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),

                order.getItem().getId(),
                order.getItem().getTitle(),
                order.getItem().getImageUrl(),

                order.getBuyer().getId(),
                order.getBuyer().getFirstname(),
                order.getBuyer().getLastname(),

                order.getSeller().getId(),
                order.getSeller().getFirstname(),
                order.getSeller().getLastname(),

                order.getItemPrice(),
                order.getPlatformFee(),
                order.getSellerAmount(),
                order.getTotalAmount(),

                order.getStatus(),
                order.getCreatedAt()
        );
    }
}