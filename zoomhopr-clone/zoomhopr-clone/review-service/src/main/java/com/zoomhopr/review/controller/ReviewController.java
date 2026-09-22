package com.zoomhopr.review.controller;

import com.zoomhopr.review.entity.Review;
import com.zoomhopr.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> submit(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.submit(review));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getForUser(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getForUser(userId));
    }

    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Map<String, Object>> average(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of("userId", userId, "averageRating", reviewService.averageRating(userId)));
    }
}
