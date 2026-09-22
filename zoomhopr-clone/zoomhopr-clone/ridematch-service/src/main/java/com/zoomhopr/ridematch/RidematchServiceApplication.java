package com.zoomhopr.ridematch;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableFeignClients
public class RidematchServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RidematchServiceApplication.class, args);
    }
}
