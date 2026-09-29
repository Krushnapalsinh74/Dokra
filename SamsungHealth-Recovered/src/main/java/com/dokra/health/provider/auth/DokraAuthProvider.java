package com.dokra.health.provider.auth;

/**
 * Dokra Health - Generic Authentication Provider Contract
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Defines standard authentication operations for generic Android devices
 * without requiring Samsung Account or Samsung Health OEM credentials.
 */
public interface DokraAuthProvider {
    
    /**
     * Obtains the active access token for Dokra API requests.
     * Refreshes automatically if expired and refresh is supported.
     * 
     * @return Valid Bearer access token string
     * @throws Exception if authentication fails or network is unreachable
     */
    String getAccessToken() throws Exception;

    /**
     * Explicitly forces a token refresh against the auth server.
     * 
     * @return New Bearer access token string
     * @throws Exception if refresh fails
     */
    String refreshToken() throws Exception;

    /**
     * Checks if a valid, unexpired session exists locally.
     * 
     * @return true if currently authenticated with a valid token
     */
    boolean isAuthenticated();

    /**
     * Clears local tokens and active session.
     */
    void logout();
}
