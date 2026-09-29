package com.dokra.health.provider;

import com.dokra.health.provider.api.DokraApiClient;
import com.dokra.health.provider.auth.DokraAuthProvider;
import com.dokra.health.provider.auth.FirebaseGoogleAuthProvider;
import com.dokra.health.provider.auth.GenericStagingAuthProvider;
import com.dokra.health.provider.data.GenericHealthDataStore;
import com.dokra.health.provider.data.HealthDataStore;

/**
 * Dokra Health - Central Provider Registry & Service Locator
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Provides thread-safe access to Dokra providers across application components.
 * Initializes default generic providers lazily without requiring Samsung OEM services.
 */
public final class DokraProviderRegistry {

    private static volatile DokraProviderRegistry instance;

    private volatile DokraAuthProvider authProvider;
    private volatile DokraApiClient apiClient;
    private volatile HealthDataStore healthDataStore;

    private DokraProviderRegistry() {
        this.authProvider = FirebaseGoogleAuthProvider.createDefault();
        this.apiClient = new DokraApiClient(null, this.authProvider);
        this.healthDataStore = GenericHealthDataStore.createDefault();
    }

    public static DokraProviderRegistry getInstance() {
        if (instance == null) {
            synchronized (DokraProviderRegistry.class) {
                if (instance == null) {
                    instance = new DokraProviderRegistry();
                }
            }
        }
        return instance;
    }

    public DokraAuthProvider getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(DokraAuthProvider authProvider) {
        this.authProvider = authProvider;
        if (authProvider != null && this.apiClient != null) {
            this.apiClient = new DokraApiClient(null, authProvider);
        }
    }

    public DokraApiClient getApiClient() {
        return apiClient;
    }

    public void setApiClient(DokraApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public HealthDataStore getHealthDataStore() {
        return healthDataStore;
    }

    public void setHealthDataStore(HealthDataStore healthDataStore) {
        this.healthDataStore = healthDataStore;
    }
}
