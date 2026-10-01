# SplitEasy

A Splitwise-style expense splitter: REST API backend.

**Status:** in progress

## Tech stack
Java 21 · Spring Boot · Spring Data JPA · MySQL · Maven

## Endpoints (done so far)
- `POST /users`: create a user
- `POST /groups`: create a group
- `POST /groups/{id}/members`: add a user to a group

## Error handling
All errors return the same JSON shape: `{ "status": ..., "message": "..." }`
(400 validation, 404 not found, 409 conflict)
