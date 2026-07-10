-- Support du panel admin : un compte peut etre desactive par un
-- administrateur (moderation). Defaut TRUE pour ne pas desactiver les
-- comptes existants lors de la migration.

ALTER TABLE users ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
