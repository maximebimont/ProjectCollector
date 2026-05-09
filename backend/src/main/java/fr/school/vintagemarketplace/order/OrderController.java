package fr.school.vintagemarketplace.order;

import fr.school.vintagemarketplace.order.dto.OrderResponse;
import fr.school.vintagemarketplace.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/items/{itemId}")
    public OrderResponse buyItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal User buyer
    ) {
        return orderService.buyItem(itemId, buyer);
    }

    @GetMapping("/me")
    public List<OrderResponse> getMyPurchases(@AuthenticationPrincipal User buyer) {
        return orderService.getMyPurchases(buyer);
    }

    @GetMapping("/sales")
    public List<OrderResponse> getMySales(@AuthenticationPrincipal User seller) {
        return orderService.getMySales(seller);
    }
}