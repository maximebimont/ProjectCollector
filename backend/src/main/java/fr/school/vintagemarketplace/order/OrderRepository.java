package fr.school.vintagemarketplace.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);

    boolean existsByItemId(Long itemId);
}