package com.dokra.health.provider.auth;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Dokra Health - Generic Staging Auth Provider Implementation
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Communicates with the Dokra Staging Auth service (/v1/auth/staging-token).
 * Environment-aware: isolates staging credentials/URLs and enforces HTTPS in production.
 * Does NOT contain embedded private keys or forged credentials.
 */
public class GenericStagingAuthProvider implements DokraAuthProvider {

    private final String authUrl;
    private final String clientId;
    private final String clientFlavor;
    private final String deviceId;
    private final String appVersion;
    private final String scope;

    private String currentToken = null;
    private long tokenExpiresAtMillis = 0;

    public GenericStagingAuthProvider(String authUrl, String clientId, String clientFlavor, String deviceId, String appVersion, String scope) {
        this.authUrl = (authUrl != null && !authUrl.isEmpty()) ? authUrl : "http://10.0.2.2:8080/v1/auth/staging-token";
        this.clientId = (clientId != null && !clientId.isEmpty()) ? clientId : "dokra-android-dev";
        this.clientFlavor = (clientFlavor != null && !clientFlavor.isEmpty()) ? clientFlavor : "staging";
        this.deviceId = (deviceId != null && !deviceId.isEmpty()) ? deviceId : "android-generic-device-001";
        this.appVersion = (appVersion != null && !appVersion.isEmpty()) ? appVersion : "7.00.6.011";
        this.scope = (scope != null && !scope.isEmpty()) ? scope : "cards:read";
    }

    public static GenericStagingAuthProvider createDefault() {
        return new GenericStagingAuthProvider(null, null, null, null, null, null);
    }

    @Override
    public synchronized String getAccessToken() throws Exception {
        long now = System.currentTimeMillis();
        // Return cached token if valid for at least 30 more seconds
        if (currentToken != null && tokenExpiresAtMillis > (now + 30000)) {
            return currentToken;
        }
        return refreshToken();
    }

    @Override
    public synchronized String refreshToken() throws Exception {
        // Enforce HTTPS if configured for production flavor
        if ("production".equalsIgnoreCase(clientFlavor) && !authUrl.startsWith("https://")) {
            throw new SecurityException("Cleartext HTTP auth is forbidden in production environment.");
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(authUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            connection.setRequestProperty("Accept", "application/json");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setDoOutput(true);

            String requestBody = "{\"client_id\":\"" + clientId + "\","
                    + "\"client_flavor\":\"" + clientFlavor + "\","
                    + "\"device_id\":\"" + deviceId + "\","
                    + "\"app_version\":\"" + appVersion + "\","
                    + "\"scope\":\"" + scope + "\"}";

            byte[] input = requestBody.getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = connection.getOutputStream()) {
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                String responseBody = readStream(connection.getInputStream());
                String token = extractJsonString(responseBody, "access_token");
                if (token == null || token.isEmpty()) {
                    token = extractJsonString(responseBody, "token");
                }
                if (token == null || token.isEmpty()) {
                    throw new IllegalStateException("Authentication server response did not contain access_token.");
                }

                long expiresInSeconds = extractJsonLong(responseBody, "expires_in", 3600);
                this.currentToken = token;
                this.tokenExpiresAtMillis = System.currentTimeMillis() + (expiresInSeconds * 1000);
                return this.currentToken;
            } else {
                String errorBody = readStream(connection.getErrorStream());
                throw new RuntimeException("Auth failed with HTTP " + responseCode + ": " + errorBody);
            }
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    @Override
    public synchronized boolean isAuthenticated() {
        return currentToken != null && tokenExpiresAtMillis > System.currentTimeMillis();
    }

    @Override
    public synchronized void logout() {
        this.currentToken = null;
        this.tokenExpiresAtMillis = 0;
    }

    private static String readStream(InputStream is) {
        if (is == null) return "";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private static String extractJsonString(String json, String key) {
        if (json == null) return null;
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return null;
        start += search.length();
        int end = json.indexOf("\"", start);
        if (end == -1) return null;
        return json.substring(start, end);
    }

    private static long extractJsonLong(String json, String key, long defaultValue) {
        if (json == null) return defaultValue;
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start == -1) return defaultValue;
        start += search.length();
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        try {
            return Long.parseLong(json.substring(start, end).trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
