# ZoomHopr — Zoomcar + Hopr Clone (Spring Boot Microservices)

A self-drive car rental platform (Zoomcar-style) combined with a peer-to-peer
ride/carpool matching platform (Hopr-style), built as independently
deployable Spring Boot microservices.

## What's included

| Service | Port | Purpose | DB |
|---|---|---|---|
| eureka-server | 8761 | Service discovery | - |
| config-server | 8888 | Centralized config | - |
| api-gateway | 8080 | Single entry point, JWT check, routing | - |
| auth-service | 8081 | Register/login, JWT issuing, KYC status | Postgres |
| user-service | 8084 | Profiles, license info, ratings summary | Postgres |
| vehicle-service | 8082 | Fleet/host car inventory, availability | Postgres + Redis |
| booking-service | 8083 | Zoomcar-style rentals, fare calc, trip lifecycle | Postgres + Kafka |
| payment-service | 8085 | Wallet/transactions, idempotent charges | Postgres + Kafka |
| ridematch-service | 8086 | Hopr-style ride offers, geo search, seat requests | Postgres + Redis |
| notification-service | 8087 | Kafka consumer → push/SMS/email dispatch | MongoDB + Kafka |
| chat-service | 8088 | WebSocket driver↔rider messaging | MongoDB |
| review-service | 8089 | Ratings & reviews | Postgres |

This is a working skeleton, not a finished production system: business
logic is intentionally kept simple (e.g. fare calc, fallback handling) so
the *pattern* is clear and easy to extend per service. Treat each service's
`service/` package as the place to layer on more real-world rules.

## Run it locally

```bash
# 1. Build all modules (each service depends on the parent pom for shared versions)
mvn clean package -DskipTests

# 2. Bring the whole system up
docker compose up --build

# 3. Check registered services
open http://localhost:8761   # Eureka dashboard

# 4. Hit the gateway
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Asha K","email":"asha@example.com","phone":"9999999999","password":"pass1234","role":"RIDER"}'
```

Every service also registers a Dockerfile individually, so you can run
`docker build` per-service if you're deploying to Kubernetes with separate
image pipelines instead of docker-compose.

## What to build next (in order)

1. **Wire real JWT validation** in `api-gateway`'s `JwtAuthenticationFilter`
   using a shared secret pulled from Config Server / a vault — not hardcoded.
2. **Flesh out fare calculation** in `booking-service` (surge pricing,
   late-return penalties, fuel deduction) and `ridematch-service`'s matching
   score (route overlap %, not just origin-radius).
3. **Real payment gateway** — replace the simulated `SUCCESS` in
   `PaymentService.chargeForBooking` with a Razorpay/Stripe call + webhook
   handler.
4. **File uploads** (KYC docs, car photos, damage photos) → S3 + presigned
   URLs; add a small `media-service` or extend `user-service`/`vehicle-service`.
5. **Admin service** — fleet ops dashboard, fraud rules, manual KYC review
   queue. Not scaffolded here; same pattern as the others.
6. **Observability** — add Spring Boot Actuator + Micrometer to every
   service, wire to Prometheus/Grafana, add Zipkin/OTel tracing headers
   through the Feign client and Kafka producers.
7. **Kubernetes** — write Helm charts per service (start from the
   Dockerfiles already present), add HPA based on CPU/queue depth for
   booking-service and ridematch-service specifically since they're the
   highest-traffic paths.
8. **CI/CD** — GitHub Actions: build → test → docker build/push → deploy via
   ArgoCD/Helm to a staging namespace, promote to prod on tag.

## Architecture notes

- **DB-per-service**: no service reaches into another's database directly.
  Cross-service reads go through Feign (sync, e.g. booking→vehicle) or Kafka
  events (async, e.g. booking→payment/notification).
- **Resilience4j circuit breaker** is wired on the booking→vehicle Feign
  call as the reference pattern — replicate this on any other synchronous
  cross-service call before going to production.
- **Idempotency keys** are enforced at the DB level in `payment-service`
  (`transactions.idempotency_key` is unique) so gateway webhook retries
  can't double-charge a rider.
- The geo search in `ridematch-service` uses a raw Haversine SQL query for
  simplicity. At real scale, swap for PostGIS `ST_DWithin` with a GiST
  index, or maintain a Redis `GEOADD`/`GEORADIUS` index updated on offer
  create/cancel.
