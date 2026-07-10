package fr.school.vintagemarketplace.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @EntityGraph(attributePaths = "seller")
    Page<Item> findAllByStatus(ItemStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "seller")
    List<Item> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);

    @EntityGraph(attributePaths = "seller")
    Page<Item> findAllBy(Pageable pageable);
}
