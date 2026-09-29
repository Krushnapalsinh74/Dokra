package com.dokra.health.provider.api;

import com.dokra.health.provider.auth.DokraAuthProvider;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dokra Health - Generic API Client for Mobile Feeds & Card Sync
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Supports:
 * - Bearer token injection from DokraAuthProvider
 * - ETag conditional caching (If-None-Match -> 304 Not Modified)
 * - 200, 304, 401, 403, 5xx status handling
 * - Compatibility with legacy WebServiceData format
 */
public class DokraApiClient {

    private final String baseUrl;
    private final DokraAuthProvider authProvider;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public static class CacheEntry {
        public final String etag;
        public final String body;

        public CacheEntry(String etag, String body) {
            this.etag = etag;
            this.body = body;
        }
    }

    public static class ApiResponse {
        public final int statusCode;
        public final boolean fromCache;
        public final String etag;
        public final String body;

        public ApiResponse(int statusCode, boolean fromCache, String etag, String body) {
            this.statusCode = statusCode;
            this.fromCache = fromCache;
            this.etag = etag;
            this.body = body;
        }
    }

    public DokraApiClient(String baseUrl, DokraAuthProvider authProvider) {
        this.baseUrl = (baseUrl != null && !baseUrl.isEmpty()) ? baseUrl : "http://10.0.2.2:8080";
        this.authProvider = authProvider;
    }

    /**
     * Fetches the Home Card feed adhering to the legacy-compatible WebServiceData JSON schema.
     * 
     * @param country Target country code (e.g. "US", "KR")
     * @param lang Target language code (e.g. "en", "ko")
     * @param appVersion App version string (e.g. "7.00.6.011")
     * @return ApiResponse containing HTTP status code, ETag, and JSON payload
     * @throws Exception on connection failure or unauthorized token
     */
    public ApiResponse getServiceCards(String country, String lang, String appVersion) throws Exception {
        String token = authProvider.getAccessToken();
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalStateException("Cannot query Card Feed: No active access token.");
        }

        String path = "/v2/servicecard/list?country=" + (country != null ? country : "US")
                + "&lang=" + (lang != null ? lang : "en")
                + "&app_ver=" + (appVersion != null ? appVersion : "7.00.6.011");

        String fullUrl = baseUrl + path;
        CacheEntry cached = cache.get(fullUrl);

        HttpURLConnection connection = null;
        try {
            URL url = new URL(fullUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setRequestProperty("providerId", "com.dokra.health");
            connection.setRequestProperty("Accept", "application/json");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            if (cached != null && cached.etag != null && !cached.etag.isEmpty()) {
                connection.setRequestProperty("If-None-Match", cached.etag);
            }

            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_NOT_MODIFIED && cached != null) {
                return new ApiResponse(304, true, cached.etag, cached.body);
            }

            if (responseCode == HttpURLConnection.HTTP_OK) {
                String etag = connection.getHeaderField("ETag");
                if (etag == null) etag = connection.getHeaderField("etag");

                String responseBody = readStream(connection.getInputStream());
                if (etag != null && !etag.isEmpty()) {
                    cache.put(fullUrl, new CacheEntry(etag, responseBody));
                }
                return new ApiResponse(200, false, etag, responseBody);
            }

            String errorBody = readStream(connection.getErrorStream());
            throw new RuntimeException("Dokra API returned HTTP " + responseCode + ": " + errorBody);

        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
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
}
