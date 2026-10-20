package com.turing.platform;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 图灵测试平台后端服务入口。
 */
@SpringBootApplication
@MapperScan("com.turing.platform.**.mapper")
public class TuringPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(TuringPlatformApplication.class, args);
    }
}
