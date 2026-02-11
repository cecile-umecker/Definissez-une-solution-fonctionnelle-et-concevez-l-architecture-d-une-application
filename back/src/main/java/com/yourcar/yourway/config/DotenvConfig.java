package com.yourcar.yourway.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

/**
 * Loads environment variables from .env file and makes them available as system properties.
 */
@Configuration
public class DotenvConfig {
    static {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
    }
}