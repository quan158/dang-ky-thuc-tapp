package com.quan.project1.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity // Kích hoạt cấu hình bảo mật web của Spring Security
@EnableMethodSecurity // Kích hoạt bảo mật dựa trên annotation (@PreAuthorize)
public class SecurityConfig {

    // Các endpoint công khai khác của bạn
    private final String[] PUBLIC_ENDPOINTS = {
            "/accounts", // Ví dụ: Nếu đây là endpoint đăng ký
            "/auth/login",
            "/auth/introspect"
            // Thêm các endpoint công khai khác vào đây
    };

    @Value("${jwt.signerKey}")
    private String signerKey;

    // Định nghĩa Filter Chain bảo mật chính
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // Cấu hình CORS (sử dụng bean corsConfigurationSource bên dưới)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Vô hiệu hóa CSRF nếu bạn đang xây dựng API stateless (thường dùng với JWT)
                .csrf(AbstractHttpConfigurer::disable) // Sử dụng lambda expression cho cấu hình DSL

                // Cấu hình ủy quyền cho các HTTP requests
                .authorizeHttpRequests(request ->
                        request
                                // CHO PHÉP TRUY CẬP CÔNG KHAI VÀO ĐƯỜNG DẪN TÀI NGUYÊN AVATAR
                                // ĐẶT DÒNG NÀY TRƯỚC CÁC QUY TẮC YÊU CẦU XÁC THỰC
                                .requestMatchers("/resources/avatars/**").permitAll() // <-- CHO PHÉP TRUY CẬP VÀO ĐƯỜNG DẪN AVATAR

                                // Cho phép truy cập vào các endpoint công khai khác (ví dụ: đăng nhập, đăng ký)
                                .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                                // .requestMatchers(HttpMethod.GET, "/public/**").permitAll() // Ví dụ

                                // Cấu hình các endpoint yêu cầu vai trò cụ thể (nếu không dùng @PreAuthorize)
                                // Nếu bạn dùng @PreAuthorize, bạn có thể không cần cấu hình chi tiết ở đây
                                .requestMatchers(HttpMethod.GET, "/accounts").hasRole("ADMIN") // Ví dụ: Chỉ ADMIN mới được GET /accounts

                                // YÊU CẦU XÁC THỰC CHO TẤT CẢ CÁC REQUEST CÒN LẠI
                                // ĐẶT anyRequest().authenticated() CUỐI CÙNG
                                .anyRequest().authenticated() // <-- TẤT CẢ CÁC REQUEST KHÁC CẦN XÁC THỰC
                )

                // Cấu hình OAuth2 Resource Server để xử lý JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                                .jwt(jwtConfigurer -> jwtConfigurer
                                        .decoder(jwtDecoder()) // Sử dụng bean jwtDecoder bên dưới
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()) // Sử dụng bean jwtAuthenticationConverter bên dưới
                                )
                        // Cấu hình xử lý lỗi xác thực JWT (nếu có JwtAuthenticationError)
                        // .authenticationEntryPoint(new JwtAuthenticationError()) // Ví dụ nếu bạn có class JwtAuthenticationError
                )

                // Cấu hình quản lý session là stateless nếu bạn dùng JWT hoặc token-based auth
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // Thêm các filter tùy chỉnh của bạn vào chuỗi filter nếu cần (ví dụ: JWT filter nếu không dùng OAuth2 Resource Server)
        // Nếu bạn dùng OAuth2 Resource Server như trên, bạn KHÔNG cần thêm JwtAuthFilter thủ công
        // .addFilterBefore(yourCustomFilter, UsernamePasswordAuthenticationFilter.class); // Ví dụ

        // Cấu hình Authentication Provider nếu bạn có CustomAuthenticationProvider
        // .authenticationProvider(customAuthenticationProvider); // Ví dụ

        // Cấu hình xử lý ngoại lệ (ví dụ: AuthenticationEntryPoint, AccessDeniedHandler)
        // Nếu bạn dùng OAuth2 Resource Server và JwtAuthenticationError, bạn có thể cấu hình ở đó
        // .exceptionHandling(exception -> exception
        //     .authenticationEntryPoint(...)
        //     .accessDeniedHandler(...)
        // );


        return httpSecurity.build();
    }

    // Bean để chuyển đổi JWT thành Authentication object với Granted Authorities
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); // Đảm bảo prefix khớp với cách bạn lưu vai trò trong JWT

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    // Bean để giải mã và xác thực JWT
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");

        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512) // Đảm bảo thuật toán khớp với thuật toán ký JWT
                .build();
    }

    // Bean cấu hình CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Đảm bảo AllowedOrigins chứa origin của frontend React của bạn
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Thay đổi nếu frontend chạy ở port khác
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*")); // Cho phép tất cả header, bao gồm Authorization
        configuration.setAllowCredentials(true); // Cho phép gửi cookie hoặc header Authorization

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cấu hình CORS cho tất cả các path
        return source;
    }

    // Bean PasswordEncoder
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    // Nếu bạn có Bean JwtAuthenticationError, bạn có thể định nghĩa nó ở đây
    // @Bean
    // public JwtAuthenticationError jwtAuthenticationError() {
    //     return new JwtAuthenticationError();
    // }
}
