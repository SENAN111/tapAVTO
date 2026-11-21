package com.carmarketplace.entity.enums;

public enum SeatCount {
    TWO(2),
    THREE(3),
    FOUR(4),
    FIVE(5),
    SIX(6),
    SEVEN(7),
    EIGHT(8),
    NINE(9);

    private final int count;

    SeatCount(int count) {
        this.count = count;
    }

    public int getCount() {
        return count;
    }
}