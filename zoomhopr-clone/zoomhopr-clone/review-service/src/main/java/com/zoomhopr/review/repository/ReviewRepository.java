package com.zoomhopr.review.repository;

import com.zoomhopr.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByRevieweeId(String revieweeId);
}
