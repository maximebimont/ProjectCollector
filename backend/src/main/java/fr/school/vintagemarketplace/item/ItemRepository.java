package fr.school.vintagemarketplace.item;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @EntityGraph(attributePaths = "seller")
    List<Item> findAllByStatusOrderByCreatedAtDesc(ItemStatus status);

    @EntityGraph(attributePaths = "seller")
    List<Item> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);
}
