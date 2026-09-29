package com.dokra.health.provider.auth;

/**
 * Dokra Health - Authenticated User Profile Model
 * Supports Firebase and Google Sign-In attributes.
 */
public class DokraUser {
    private final String uid;
    private final String email;
    private final String displayName;
    private final String photoUrl;
    private final String provider;

    public DokraUser(String uid, String email, String displayName, String photoUrl, String provider) {
        this.uid = uid != null ? uid : "usr_dokra_runner";
        this.email = email != null ? email : "runner@dokrahealth.com";
        this.displayName = displayName != null ? displayName : "Dokra Athlete";
        this.photoUrl = photoUrl != null ? photoUrl : "";
        this.provider = provider != null ? provider : "google";
    }

    public String getUid() {
        return uid;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public String getProvider() {
        return provider;
    }

    @Override
    public String toString() {
        return "DokraUser{" +
                "uid='" + uid + '\'' +
                ", email='" + email + '\'' +
                ", displayName='" + displayName + '\'' +
                ", provider='" + provider + '\'' +
                '}';
    }
}
