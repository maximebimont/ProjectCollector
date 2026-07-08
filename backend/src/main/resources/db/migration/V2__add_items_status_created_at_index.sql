-- Index sur le filtre + tri du catalogue (findAllByStatusOrderByCreatedAtDesc),
-- la requete la plus frequente de l'app (page catalogue publique).

CREATE INDEX idx_items_status_created_at ON items (status, created_at);
