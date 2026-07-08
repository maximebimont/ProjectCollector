package fr.school.vintagemarketplace.order;

import fr.school.vintagemarketplace.item.Item;
import fr.school.vintagemarketplace.item.ItemRepository;
import fr.school.vintagemarketplace.item.ItemStatus;
import fr.school.vintagemarketplace.order.dto.OrderResponse;
import fr.school.vintagemarketplace.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05");

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;

    @Transactional
    public OrderResponse buyItem(Long itemId, User buyer) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Objet introuvable"));

        if (item.getStatus() == ItemStatus.SOLD) {
            throw new IllegalArgumentException("Cet objet est déjà vendu");
        }

        if (item.getSeller().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Vous ne pouvez pas acheter votre propre objet");
        }

        if (orderRepository.existsByItemId(itemId)) {
            throw new IllegalArgumentException("Une commande existe déjà pour cet objet");
        }

        BigDecimal itemPrice = item.getPrice();
        BigDecimal platformFee = itemPrice
                .multiply(PLATFORM_FEE_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal sellerAmount = itemPrice
                .subtract(platformFee)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = itemPrice.setScale(2, RoundingMode.HALF_UP);

        item.setStatus(ItemStatus.SOLD);
        itemRepository.save(item);

        Order order = Order.builder()
                .item(item)
                .buyer(buyer)
                .seller(item.getSeller())
                .itemPrice(itemPrice)
                .platformFee(platformFee)
                .sellerAmount(sellerAmount)
                .totalAmount(totalAmount)
                .status(OrderStatus.COMPLETED)
                .build();

        Order savedOrder = orderRepository.save(order);

        log.info(
                "Commande creee : orderId={} itemId={} buyerId={} sellerId={} totalAmount={}",
                savedOrder.getId(), item.getId(), buyer.getId(), item.getSeller().getId(), totalAmount
        );

        return OrderResponse.from(savedOrder);
    }

    public List<OrderResponse> getMyPurchases(User buyer) {
        return orderRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyer.getId())
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> getMySales(User seller) {
        return orderRepository.findAllBySellerIdOrderByCreatedAtDesc(seller.getId())
                .stream()
                .map(OrderResponse::from)
                .toList();
    }
}