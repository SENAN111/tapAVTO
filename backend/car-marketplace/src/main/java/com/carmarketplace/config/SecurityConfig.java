
package com.carmarketplace.config;

import com.carmarketplace.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>();

        registration.setFilter(jwtAuthenticationFilter);
        registration.setEnabled(false);

        return registration;
    }

    // Frontend üçün CORS icazələri
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // OPTIONS sorğuları
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Authentication
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // Admin endpoint-ləri yalnız ADMIN üçün
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Şəxsi elanlar
                        .requestMatchers(HttpMethod.GET, "/api/cars/my-cars")
                        .hasAnyRole("SELLER", "ADMIN")

                        // Şəxsi bildirişlər
                        .requestMatchers("/api/notifications/**")
                        .authenticated()

                        // Kataloq
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/catalog/**"
                        ).permitAll()

                        // İctimai avtomobil siyahısı və axtarış
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/cars/**"
                        ).permitAll()

                        // Avtomobil yaratmaq
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/cars/**"
                        ).hasAnyRole("SELLER", "ADMIN")

                        // Avtomobili redaktə etmək
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/cars/**"
                        ).hasAnyRole("SELLER", "ADMIN")

                        // Avtomobili yeniləmək və təsdiqləmə əməliyyatları
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/cars/**"
                        ).hasAnyRole("SELLER", "ADMIN")

                        // Avtomobili silmək
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/cars/**"
                        ).hasAnyRole("SELLER", "ADMIN")

                        // Digər bütün endpoint-lər autentifikasiya tələb edir
                        .anyRequest().authenticated()
                )

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );
                                    response.setContentType("application/json");
                                    response.setCharacterEncoding("UTF-8");

                                    response.getWriter().write(
                                            "{\"status\":401,\"message\":\"Unauthorized\"}"
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );
                                    response.setContentType("application/json");
                                    response.setCharacterEncoding("UTF-8");

                                    response.getWriter().write(
                                            "{\"status\":403,\"message\":\"Forbidden\"}"
                                    );
                                }
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
