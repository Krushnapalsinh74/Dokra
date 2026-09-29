package com.dokra.health.provider.data;

import java.util.List;

/**
 * Dokra Health - Health Data Store Abstraction Contract
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Provides capability-aware access to health data on generic Android devices
 * without requiring Samsung framework services.
 */
public interface HealthDataStore {

    /**
     * Checks the operational availability of a given health capability.
     * 
     * @param capability The health data type to check
     * @return Current CapabilityStatus (SUPPORTED, PERMISSION_REQUIRED, HARDWARE_REQUIRED, etc.)
     */
    CapabilityStatus checkCapability(HealthCapability capability);

    /**
     * Reads records for a supported capability.
     * Returns an empty list without fabricating fake measurements if unsupported.
     * 
     * @param capability The health data type
     * @return List of JSON-encoded health records
     */
    List<String> readHealthData(HealthCapability capability);

    /**
     * Writes a health record to the underlying store.
     * 
     * @param capability The health data type
     * @param recordJson JSON-encoded record payload
     * @return true if successfully committed
     */
    boolean writeHealthData(HealthCapability capability, String recordJson);
}
