-- 1. Insertion des Utilisateurs (Clients et Agents)
-- Le hash correspond à : password123
INSERT INTO "users" (first_name, last_name, email, password, address, birth_date, role) VALUES
('Jean', 'Dupont', 'jean.dupont@email.com', '$2a$10$XmSDF9pOfSClxVv5MhG9vOovs0.Ait6GInuJAsM7N0Fv7GvCstG8q', '12 rue des Fleurs, Paris', '1985-05-15', 'CUSTOMER'),
('Marie', 'Curie', 'marie.curie@email.com', '$2a$10$XmSDF9pOfSClxVv5MhG9vOovs0.Ait6GInuJAsM7N0Fv7GvCstG8q', '5 Avenue de la Gare, Lyon', '1992-08-22', 'CUSTOMER'),
('Marc', 'Support', 'marc.agent@yourcaryourway.com', '$2a$10$XmSDF9pOfSClxVv5MhG9vOovs0.Ait6GInuJAsM7N0Fv7GvCstG8q', 'Siège Social, Bordeaux', '1980-01-01', 'AGENT'),
('Lucie', 'Expert', 'lucie.agent@yourcaryourway.com', '$2a$10$XmSDF9pOfSClxVv5MhG9vOovs0.Ait6GInuJAsM7N0Fv7GvCstG8q', 'Siège Social, Bordeaux', '1988-12-10', 'AGENT');

-- 2. Insertion des Agences
INSERT INTO agency (name, address, city) VALUES
('Agence Paris Centre', '45 Boulevard Haussmann', 'Paris'),
('Agence Lyon Part-Dieu', 'Place Charles Béraudier', 'Lyon'),
('Agence Bordeaux Gare', 'Rue Charles Domercq', 'Bordeaux');

-- 3. Insertion des Véhicules
INSERT INTO vehicle (brand, model, license_plate, category) VALUES
('Renault', 'Clio 5', 'AA-123-BB', 'ECONOMY'),
('Peugeot', '3008', 'CC-456-DD', 'SUV'),
('Tesla', 'Model 3', 'EE-789-FF', 'ELECTRIC'),
('Volkswagen', 'Golf 8', 'GG-012-HH', 'COMPACT');

-- 4. Insertion des Réservations (Booking)
INSERT INTO booking (start_date, end_date, total_amount, status, user_id, vehicle_id, departure_agency_id, return_agency_id) VALUES
('2026-03-01 09:00:00', '2026-03-05 18:00:00', 250.00, 'CONFIRMED', 1, 1, 1, 1),
('2026-04-10 10:00:00', '2026-04-12 10:00:00', 450.00, 'PENDING', 2, 2, 2, 3),
('2026-02-15 08:00:00', '2026-02-16 20:00:00', 120.00, 'CANCELLED', 1, 4, 1, 1);

-- 5. Insertion des Tickets de Support
INSERT INTO support_ticket (created_at, status, subject, user_id, agent_id) VALUES
('2026-02-11 10:00:00', TRUE, 'Problème de paiement réservation #1', 1, 3),
('2026-02-11 14:30:00', TRUE, 'Question sur l assurance Tesla', 2, NULL),
('2026-02-10 09:00:00', FALSE, 'Modification de date de retour', 1, 4);

-- 6. Insertion des Messages de Chat
INSERT INTO chat_message (content, timestamp, is_real_time, ticket_id, sender_id) VALUES
('Bonjour, j''ai été débité deux fois pour ma réservation.', '2026-02-11 10:05:00', FALSE, 1, 1),
('Bonjour Jean, je regarde cela tout de suite. Pouvez-vous me donner votre numéro de transaction ?', '2026-02-11 10:10:00', TRUE, 1, 3),
('C''est le TXN-987654321.', '2026-02-11 10:12:00', TRUE, 1, 1);