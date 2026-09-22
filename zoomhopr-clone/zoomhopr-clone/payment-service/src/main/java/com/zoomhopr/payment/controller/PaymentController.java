package com.zoomhopr.payment.controller;

import com.zoomhopr.payment.entity.Transaction;
import com.zoomhopr.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/charge")
    public ResponseEntity<Transaction> charge(@RequestBody Map<String, String> body) {
        Transaction txn = paymentService.chargeForBooking(
                body.get("userId"),
                body.get("bookingId"),
                new BigDecimal(body.get("amount")),
                body.get("idempotencyKey"));
        return ResponseEntity.ok(txn);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Transaction>> history(@PathVariable String userId) {
        return ResponseEntity.ok(paymentService.getHistory(userId));
    }
}
