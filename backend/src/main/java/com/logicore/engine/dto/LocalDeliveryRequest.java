package com.logicore.engine.dto;

import java.util.List;
import com.logicore.engine.model.LocalDeliveryStop;

/**
 * LocalDeliveryRequest - DTO for intra-city delivery route calculation requests
 */
public class LocalDeliveryRequest {
    private String cityId;
    private LocalDeliveryStop warehouse;
    private List<LocalDeliveryStop> deliveryAddresses;
    private String algorithmType;

    // Constructors
    public LocalDeliveryRequest() {}

    public LocalDeliveryRequest(String cityId, LocalDeliveryStop warehouse,
                               List<LocalDeliveryStop> deliveryAddresses, String algorithmType) {
        this.cityId = cityId;
        this.warehouse = warehouse;
        this.deliveryAddresses = deliveryAddresses;
        this.algorithmType = algorithmType;
    }

    // Getters and Setters
    public String getCityId() {
        return cityId;
    }

    public void setCityId(String cityId) {
        this.cityId = cityId;
    }

    public LocalDeliveryStop getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(LocalDeliveryStop warehouse) {
        this.warehouse = warehouse;
    }

    public List<LocalDeliveryStop> getDeliveryAddresses() {
        return deliveryAddresses;
    }

    public void setDeliveryAddresses(List<LocalDeliveryStop> deliveryAddresses) {
        this.deliveryAddresses = deliveryAddresses;
    }

    public String getAlgorithmType() {
        return algorithmType;
    }

    public void setAlgorithmType(String algorithmType) {
        this.algorithmType = algorithmType;
    }

    @Override
    public String toString() {
        return "LocalDeliveryRequest{" +
                "cityId='" + cityId + '\'' +
                ", warehouse=" + warehouse +
                ", deliveryAddresses=" + deliveryAddresses +
                ", algorithmType='" + algorithmType + '\'' +
                '}';
    }
}
