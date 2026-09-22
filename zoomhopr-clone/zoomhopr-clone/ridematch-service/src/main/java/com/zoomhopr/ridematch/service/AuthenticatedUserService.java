package com.zoomhopr.ridematch.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final HttpServletRequest request;

    public String getAuthenticatedUserId() {
        String userId = request.getHeader(USER_ID_HEADER);
        if (!StringUtils.hasText(userId)) {
            throw new IllegalStateException("Missing authenticated user header");
        }
        return userId;
    }
}