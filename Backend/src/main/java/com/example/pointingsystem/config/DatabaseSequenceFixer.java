package com.example.pointingsystem.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DatabaseSequenceFixer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSequenceFixer.class);

    @PersistenceContext
    private EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncDatabaseSequences() {
        logger.info("Synchronizing PostgreSQL ID sequences with maximum existing table IDs...");
        List<String> tables = List.of("points_log", "yuvak", "attendance_log", "teams");

        for (String table : tables) {
            try {
                String sql = String.format(
                    "SELECT setval(pg_get_serial_sequence('%s', 'id'), COALESCE((SELECT MAX(id) FROM %s), 1))",
                    table, table
                );
                Object result = entityManager.createNativeQuery(sql).getSingleResult();
                logger.info("Sequence for table '{}' reset to: {}", table, result);
            } catch (Exception e) {
                logger.warn("Could not sync sequence for table '{}': {}", table, e.getMessage());
            }
        }
    }
}
