package fr.school.vintagemarketplace.common.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class MessageResponseTest {

    @Test
    void shouldExposeMessage() {
        MessageResponse response = new MessageResponse("Objet supprimé avec succès");

        assertThat(response.message()).isEqualTo("Objet supprimé avec succès");
    }
}
