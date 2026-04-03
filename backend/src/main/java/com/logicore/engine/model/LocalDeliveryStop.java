package com.logicore.engine.model;

/**
 * LocalDeliveryStop - Minimal stub for compilation
 * This class was deleted during Phase 3 undo but is still referenced in EndToEndJourney code.
 */
public class LocalDeliveryStop {
    private String id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private String type;

    public LocalDeliveryStop() {}

    public LocalDeliveryStop(String id, String name, String address, double latitude, double longitude, String type) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.type = type;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    @Override
    public String toString() {
        return "LocalDeliveryStop{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}
