package com.logicore.engine.model;

/**
 * Product model for items from e-commerce APIs (Amazon, Flipkart)
 */
@SuppressWarnings("unused")
public class Product {
    private String sku;
    private String name;

    private String url; // Original product link
    private double weight; // in kg
    private double price;
    private String category;
    private int warehouseNodeId; // Where this product is stocked
    private int quantity; // Current stock
    private String source; // "AMAZON" or "FLIPKART"

    // Delivery preference based on product type
    private DeliveryPreference deliveryPreference;

    public Product() {
    }

    public Product(String sku, String name, String url, double weight, double price, String category,
            int warehouseNodeId, int quantity, String source, DeliveryPreference deliveryPreference) {
        this.sku = sku;
        this.name = name;
        this.url = url;
        this.weight = weight;
        this.price = price;
        this.category = category;
        this.warehouseNodeId = warehouseNodeId;
        this.quantity = quantity;
        this.source = source;
        this.deliveryPreference = deliveryPreference;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getWarehouseNodeId() {
        return warehouseNodeId;
    }

    public void setWarehouseNodeId(int warehouseNodeId) {
        this.warehouseNodeId = warehouseNodeId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public DeliveryPreference getDeliveryPreference() {
        return deliveryPreference;
    }

    public void setDeliveryPreference(DeliveryPreference deliveryPreference) {
        this.deliveryPreference = deliveryPreference;
    }

    public enum DeliveryPreference {
        STANDARD, // 5-7 days
        EXPRESS, // 2-3 days
        SAME_DAY, // Same day delivery
        FRAGILE // Special handling needed
    }
}
