package fr.school.vintagemarketplace.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.school.vintagemarketplace.auth.dto.RegisterRequest;
import fr.school.vintagemarketplace.item.dto.ItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class PurchaseFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCompletePurchaseFlow() throws Exception {
        String sellerToken = registerAndGetToken(
                "Paul",
                "Vendeur",
                "vendeur.integration@test.com",
                "password123"
        );

        String buyerToken = registerAndGetToken(
                "Alice",
                "Acheteur",
                "acheteur.integration@test.com",
                "password123"
        );

        ItemRequest itemRequest = new ItemRequest(
                "Figurine Star Wars vintage",
                "Figurine originale en bon état.",
                new BigDecimal("100.00"),
                "https://example.com/star-wars.jpg"
        );

        String createdItemResponse = mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Figurine Star Wars vintage"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode createdItemJson = objectMapper.readTree(createdItemResponse);
        Long itemId = createdItemJson.get("id").asLong();

        mockMvc.perform(post("/api/orders/items/" + itemId)
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemId").value(itemId))
                .andExpect(jsonPath("$.itemTitle").value("Figurine Star Wars vintage"))
                .andExpect(jsonPath("$.itemPrice").value(100.00))
                .andExpect(jsonPath("$.platformFee").value(5.00))
                .andExpect(jsonPath("$.sellerAmount").value(95.00))
                .andExpect(jsonPath("$.totalAmount").value(100.00))
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mockMvc.perform(get("/api/items/" + itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLD"));

        String purchasesResponse = mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itemId").value(itemId))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode purchasesJson = objectMapper.readTree(purchasesResponse);
        assertThat(purchasesJson).hasSize(1);
    }

    @Test
    void shouldRejectPurchaseWithoutToken() throws Exception {
        mockMvc.perform(post("/api/orders/items/1"))
                .andExpect(status().isForbidden());
    }

    private String registerAndGetToken(
            String firstname,
            String lastname,
            String email,
            String password
    ) throws Exception {
        RegisterRequest request = new RegisterRequest(
                firstname,
                lastname,
                email,
                password
        );

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);

        return json.get("token").asText();
    }
}