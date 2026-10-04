# SplitEasy

A Splitwise-style expense splitter: REST API backend.

**Status:** in progress

## Tech stack
Java 21 · Spring Boot · Spring Data JPA · MySQL · Maven

## Endpoints (done so far)
- `POST /users`: create a user
- `POST /groups`: create a group
- `POST /groups/{id}/members`: add a user to a group
- `POST /groups/{id}/expenses`: add an expense, split equally among all group members

## Design decisions
- **Money uses `BigDecimal`, never `double`.** `double` stores numbers in binary,
  so `0.1 + 0.2` gives `0.30000000000000004`. `BigDecimal` stores exact decimals.
- **Rounding rule for equal splits.** Each share is the amount divided by the number
  of members, rounded **down** to 2 decimal places. The leftover paisa goes to the
  **payer**, so shares always add up to exactly the amount.
  Example: ₹100 among 3 → 33.34 (payer), 33.33, 33.33.
- **Expense and splits are saved in one transaction** (`@Transactional`):
  either all rows are saved, or none are.
- **Controllers return DTOs, never entities.**

## Error handling
All errors return the same JSON shape: `{ "status": ..., "message": "..." }`
- 400: validation errors, or payer is not a member of the group
- 404: user or group not found
- 409: duplicate email, or user already in group
