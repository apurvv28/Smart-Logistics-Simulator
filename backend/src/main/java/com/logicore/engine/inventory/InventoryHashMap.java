package com.logicore.engine.inventory;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class InventoryHashMap {
    private static final int DEFAULT_CAPACITY = 16;
    private Node[] buckets;

    @SuppressWarnings("unused")
    public static class Node {
        private String key; // SKU
        private Integer value; // Quantity
        private Node next;

        public Node() {
        }

        public Node(String key, Integer value, Node next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public Integer getValue() { return value; }
        public void setValue(Integer value) { this.value = value; }
        public Node getNext() { return next; }
        public void setNext(Node next) { this.next = next; }
    }

    public InventoryHashMap() {
        this.buckets = new Node[DEFAULT_CAPACITY];
    }

    public void put(String key, int value) {
        int index = getBucketIndex(key);
        Node head = buckets[index];
        while (head != null) {
            if (head.key.equals(key)) {
                head.value = value;
                return;
            }
            head = head.next;
        }
        Node newNode = new Node(key, value, buckets[index]);
        buckets[index] = newNode;
    }

    public Integer get(String key) {
        int index = getBucketIndex(key);
        Node head = buckets[index];
        while (head != null) {
            if (head.key.equals(key)) return head.value;
            head = head.next;
        }
        return null;
    }

    public List<BucketSnapshot> getInventorySnapshot() {
        List<BucketSnapshot> snapshots = new ArrayList<>();
        for (int i = 0; i < buckets.length; i++) {
            List<String> items = new ArrayList<>();
            Node curr = buckets[i];
            while (curr != null) {
                items.add(curr.key + ":" + curr.value);
                curr = curr.next;
            }
            snapshots.add(new BucketSnapshot(i, items));
        }
        return snapshots;
    }

    private int getBucketIndex(String key) {
        return Math.abs(key.hashCode()) % buckets.length;
    }

    @SuppressWarnings("unused")
    public static class BucketSnapshot {
        private int bucketIndex;
        private List<String> items;

        public BucketSnapshot() {
        }

        public BucketSnapshot(int bucketIndex, List<String> items) {
            this.bucketIndex = bucketIndex;
            this.items = items;
        }

        public int getBucketIndex() { return bucketIndex; }
        public void setBucketIndex(int bucketIndex) { this.bucketIndex = bucketIndex; }
        public List<String> getItems() { return items; }
        public void setItems(List<String> items) { this.items = items; }
    }
}
