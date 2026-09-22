package com.zoomhopr.review.service;

import com.zoomhopr.review.entity.Review;
import com.zoomhopr.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;

    public Review submit(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        return repository.save(review);
    }

    public List<Review> getForUser(String revieweeId) {
        return repository.findByRevieweeId(revieweeId);
    }

    public double averageRating(String revieweeId) {
        List<Review> reviews = getForUser(revieweeId);
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }
}
