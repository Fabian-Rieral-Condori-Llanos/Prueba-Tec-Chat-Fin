package com.chat.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = {
        "com.chat.module.auth.repository",
        "com.chat.module.chat.repository",
        "com.chat.module.contact.repository"
    },
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.REGEX,
        pattern = ".*MongoRepository"
    )
)
@EntityScan(basePackages = "com.chat.model.postgres")
public class PostgresConfig {
    
}
