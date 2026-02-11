package com.yourcar.yourway;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class YourcaryourwayApplicationTests {

    @BeforeAll
    static void setup() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
            System.out.println("Test Env Load: " + entry.getKey());
        });
        
        if (System.getProperty("DB_URL") == null) {
            System.err.println("ALERTE : DB_URL n'est pas chargée ! Vérifie l'emplacement de ton .env");
        }
    }

    @Test
    void contextLoads() {
    }
}