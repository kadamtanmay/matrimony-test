package com.matrimony.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long expiration;

    // ✅ Generate JWT token with consistent secret key
    public String generateToken(String email) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        String token = Jwts.builder()
                   .setSubject(email)
                   .setIssuedAt(new Date())
                   .setExpiration(new Date(System.currentTimeMillis() + expiration))
                   .signWith(key)
                   .compact();
        
        // ✅ DEBUG LOGS FOR GENERATION
        System.out.println("=== JWT GENERATION DEBUG ===");
        System.out.println("Secret key: " + secretKey);
        System.out.println("Secret key length: " + secretKey.length());
        System.out.println("Email: " + email);
        System.out.println("Expiration: " + expiration);
        System.out.println("Generated token: " + token);
        System.out.println("============================");
        
        return token;
    }

    // ✅ Extract email from token with consistent secret key
    public String extractEmail(String token) {
        try {
            // ✅ DEBUG LOGS FOR VALIDATION
            System.out.println("=== JWT VALIDATION DEBUG ===");
            System.out.println("Secret key during validation: " + secretKey);
            System.out.println("Secret key length during validation: " + secretKey.length());
            System.out.println("Token to validate: " + token);
            
            Claims claims = getClaims(token);
            String email = claims.getSubject();
            
            System.out.println("Validation successful, extracted email: " + email);
            System.out.println("Token expiration: " + claims.getExpiration());
            System.out.println("Token issued at: " + claims.getIssuedAt());
            System.out.println("============================");
            
            return email;
        } catch (Exception e) {
            System.out.println("JWT validation error: " + e.getMessage());
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("============================");
            throw e;
        }
    }

    // ✅ Validate token
    public boolean validateToken(String token, String email) {
        try {
            System.out.println("=== TOKEN VALIDATION CHECK ===");
            System.out.println("Validating token for email: " + email);
            
            String extractedEmail = extractEmail(token);
            boolean emailMatches = extractedEmail.equals(email);
            boolean notExpired = !isTokenExpired(token);
            boolean isValid = emailMatches && notExpired;
            
            System.out.println("Email matches: " + emailMatches);
            System.out.println("Token not expired: " + notExpired);
            System.out.println("Overall valid: " + isValid);
            System.out.println("==============================");
            
            return isValid;
        } catch (Exception e) {
            System.out.println("Token validation failed: " + e.getMessage());
            System.out.println("==============================");
            return false;
        }
    }

    // ✅ Check if token is expired
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaims(token).getExpiration();
            boolean expired = expiration.before(new Date());
            
            System.out.println("=== EXPIRATION CHECK ===");
            System.out.println("Token expiration: " + expiration);
            System.out.println("Current time: " + new Date());
            System.out.println("Token expired: " + expired);
            System.out.println("========================");
            
            return expired;
        } catch (Exception e) {
            System.out.println("Error checking token expiration: " + e.getMessage());
            return true; // Consider expired if can't parse
        }
    }

    // ✅ Extract claims using consistent secret key
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Additional utility methods
    
    // Extract username (alias for extractEmail for compatibility)
    public String extractUsername(String token) {
        return extractEmail(token);
    }
    
    // Get token expiration date
    public Date getExpirationDateFromToken(String token) {
        return getClaims(token).getExpiration();
    }
    
    // Get token issued date
    public Date getIssuedAtDateFromToken(String token) {
        return getClaims(token).getIssuedAt();
    }
    
    // Generate token with custom expiration
    public String generateTokenWithCustomExpiration(String email, long customExpiration) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                   .setSubject(email)
                   .setIssuedAt(new Date())
                   .setExpiration(new Date(System.currentTimeMillis() + customExpiration))
                   .signWith(key)
                   .compact();
    }
}
