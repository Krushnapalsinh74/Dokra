package com.dokra.health.provider.data;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Dokra Health - Generic Android HealthDataStore Implementation
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Capability-aware store for standard Android devices.
 * NEVER creates fake sensor values or synthetic measurements.
 */
public class GenericHealthDataStore implements HealthDataStore {

    private final boolean hasStepSensor;
    private final boolean hasHeartRateSensor;
    private final boolean hasHealthConnect;
    private final boolean hasPermission;

    private final Map<HealthCapability, List<String>> localCache = new EnumMap<>(HealthCapability.class);

    public GenericHealthDataStore(boolean hasStepSensor, boolean hasHeartRateSensor, boolean hasHealthConnect, boolean hasPermission) {
        this.hasStepSensor = hasStepSensor;
        this.hasHeartRateSensor = hasHeartRateSensor;
        this.hasHealthConnect = hasHealthConnect;
        this.hasPermission = hasPermission;
    }

    public static GenericHealthDataStore createDefault() {
        return new GenericHealthDataStore(true, false, true, true);
    }

    @Override
    public CapabilityStatus checkCapability(HealthCapability capability) {
        if (capability == null) {
            return CapabilityStatus.UNSUPPORTED;
        }

        switch (capability) {
            case STEPS:
                if (!hasPermission) return CapabilityStatus.PERMISSION_REQUIRED;
                if (hasStepSensor || hasHealthConnect) return CapabilityStatus.SUPPORTED;
                return CapabilityStatus.HARDWARE_REQUIRED;

            case ACTIVITY:
            case SLEEP:
            case WEIGHT:
            case WORKOUTS:
            case HYDRATION:
            case NUTRITION:
                if (!hasPermission) return CapabilityStatus.PERMISSION_REQUIRED;
                return CapabilityStatus.SUPPORTED; // Supported via Health Connect or local app logging

            case HEART_RATE:
                if (!hasPermission) return CapabilityStatus.PERMISSION_REQUIRED;
                if (hasHeartRateSensor || hasHealthConnect) return CapabilityStatus.SUPPORTED;
                return CapabilityStatus.HARDWARE_REQUIRED;

            case BLOOD_PRESSURE:
            case BLOOD_GLUCOSE:
            case BODY_COMPOSITION:
                if (!hasPermission) return CapabilityStatus.PERMISSION_REQUIRED;
                return CapabilityStatus.HARDWARE_REQUIRED; // Requires connected BLE peripheral

            default:
                return CapabilityStatus.UNSUPPORTED;
        }
    }

    @Override
    public synchronized List<String> readHealthData(HealthCapability capability) {
        CapabilityStatus status = checkCapability(capability);
        if (status != CapabilityStatus.SUPPORTED) {
            // NEVER generate fake data
            return Collections.emptyList();
        }

        List<String> records = localCache.get(capability);
        if (records == null) {
            return Collections.emptyList();
        }
        return new ArrayList<>(records);
    }

    @Override
    public synchronized boolean writeHealthData(HealthCapability capability, String recordJson) {
        CapabilityStatus status = checkCapability(capability);
        if (status != CapabilityStatus.SUPPORTED) {
            return false;
        }

        if (recordJson == null || recordJson.trim().isEmpty()) {
            return false;
        }

        List<String> records = localCache.computeIfAbsent(capability, k -> new ArrayList<>());
        records.add(recordJson);
        return true;
    }
}
