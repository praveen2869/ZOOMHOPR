package com.zoomhopr.payment.service;

import com.zoomhopr.payment.entity.Transaction;
import com.zoomhopr.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final TransactionRepository repository;

    // In production this calls out to Razorpay/Stripe here before marking SUCCESS.
    public Transaction chargeForBooking(String userId, String bookingId, BigDecimal amount, String idempotencyKey) {
        return repository.findByIdempotencyKey(idempotencyKey).orElseGet(() -> {
            Transaction txn = Transaction.builder()
                    .userId(userId)
                    .bookingId(bookingId)
                    .amount(amount)
                    .type(Transaction.TransactionType.BOOKING_CHARGE)
                    .idempotencyKey(idempotencyKey)
                    .status(Transaction.TransactionStatus.SUCCESS) // simulate gateway success
                    .build();
            return repository.save(txn);
        });
    }

    public List<Transaction> getHistory(String userId) {
        return repository.findByUserId(userId);
    }
}
