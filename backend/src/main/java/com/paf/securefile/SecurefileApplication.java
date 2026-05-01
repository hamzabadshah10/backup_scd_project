package com.paf.securefile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SecurefileApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurefileApplication.class, args);
	}

}
