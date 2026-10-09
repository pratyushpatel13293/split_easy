package com.pratyush.spliteasy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import java.math.BigDecimal;
import java.math.RoundingMode;

@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
@SpringBootApplication
public class SpliteasyApplication {

	public static void main(String[] args) {

        SpringApplication.run(SpliteasyApplication.class, args);

	}

}
