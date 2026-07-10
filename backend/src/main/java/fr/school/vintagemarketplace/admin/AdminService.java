package fr.school.vintagemarketplace.admin;

import fr.school.vintagemarketplace.item.Item;
import fr.school.vintagemarketplace.item.ItemRepository;
import fr.school.vintagemarketplace.item.dto.ItemResponse;
import fr.school.vintagemarketplace.user.User;
import fr.school.vintagemarketplace.user.UserRepository;
import fr.school.vintagemarketplace.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse setUserEnabled(Long id, boolean enabled, User currentAdmin) {
        if (id.equals(currentAdmin.getId())) {
            throw new IllegalArgumentException("Vous ne pouvez pas modifier le statut de votre propre compte");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        user.setEnabled(enabled);

        User savedUser = userRepository.save(user);

        return UserResponse.from(savedUser);
    }

    public Page<ItemResponse> getAllItems(Pageable pageable) {
        return itemRepository.findAllBy(pageable)
                .map(ItemResponse::from);
    }

    public void deleteItemAsModerator(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Objet introuvable"));

        itemRepository.delete(item);
    }
}
