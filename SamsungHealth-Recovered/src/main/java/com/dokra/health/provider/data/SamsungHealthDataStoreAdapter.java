package com.dokra.health.provider.data;

import java.util.Collections;
import java.util.List;

/**
 * Dokra Health - Optional Samsung OEM HealthDataStore Adapter
 * Task ID: DOKRA-GENERIC-ANDROID-001
 * 
 * Only active on Samsung devices with legitimate Samsung Health framework services.
 * Fails gracefully without throwing crashes on standard Android devices.
 */
public class SamsungHealthDataStoreAdapter implements HealthDataStore {

    private final boolean isSamsungDevice;
    private final boolean isSamsungServiceAvailable;

    public SamsungHealthDataStoreAdapter(boolean isSamsungDevice, boolean isSamsungServiceAvailable) {
        this.isSamsungDevice = isSamsungDevice;
        this.isSamsungServiceAvailable = isSamsungServiceAvailable;
    }

    public static SamsungHealthDataStoreAdapter detect() {
        boolean samsungBrand = "samsung".equalsIgnoreCase(android.os.Build.MANUFACTURER);
        return new SamsungHealthDataStoreAdapter(samsungBrand, false);
    }

    @Override
    public CapabilityStatus checkCapability(HealthCapability capability) {
        if (!isSamsungDevice || !isSamsungServiceAvailable) {
            return CapabilityStatus.TEMPORARILY_UNAVAILABLE;
        }
        return CapabilityStatus.SUPPORTED;
    }

    @Override
    public List<String> readHealthData(HealthCapability capability) {
        if (!isSamsungDevice || !isSamsungServiceAvailable) {
            return Collections.emptyList();
        }
        return Collections.emptyList();
    }

    @Override
    public boolean writeHealthData(HealthCapability capability, String recordJson) {
        if (!isSamsungDevice || !isSamsungServiceAvailable) {
            return false;
        }
        return false;
    }
}
