package com.yourcar.yourway;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class YourcaryourwayApplicationTests {

    @BeforeAll
    static void setup() {
        // On cherche le .env de manière plus flexible
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // Tente la racine du dossier courant
                .ignoreIfMissing()
                .load();

        // On injecte les variables
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
            // Ligne de debug (optionnelle, à retirer après)
            System.out.println("Test Env Load: " + entry.getKey());
        });
        
        // Vérification critique pour t'aider à diagnostiquer
        if (System.getProperty("DB_URL") == null) {
            System.err.println("ALERTE : DB_URL n'est pas chargée ! Vérifie l'emplacement de ton .env");
        }
    }

    @Test
    void contextLoads() {
        // Si ça arrive ici, c'est que la DB est connectée
    }
}