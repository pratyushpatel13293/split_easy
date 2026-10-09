# SplitEasy

A Splitwise-style expense-splitting **backend** built with Spring Boot.
Create users and groups, record shared expenses (split equally), see who owes whom, and get a short list of payments that settles the group.

> Backend only — no frontend, no authentication. Tested with Postman and JUnit.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17+ (developed on Java 21) |
| Framework | Spring Boot 4.1 (Web MVC, Validation) |
| Persistence | Spring Data JPA, Hibernate 7 |
| Database | MySQL 8 |
| Build | Maven (wrapper included) |
| Testing | JUnit 5, Mockito, Postman |

---

## Database Schema

```
users          (id, name, email UNIQUE)
expense_group  (id, name)                         -- "group" is a reserved SQL keyword
group_member   (group_id, user_id)                -- many-to-many link
expense        (id, group_id, paid_by, amount, description, created_at)
expense_split  (id, expense_id, user_id, share_amount)   UNIQUE(expense_id, user_id)
```

Money columns are `DECIMAL(12,2)` and mapped to `BigDecimal` in Java.

---

## How to Run

**1. Create the database**
```sql
CREATE DATABASE spliteasy;
```

**2. Configure `src/main/resources/application.properties`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spliteasy
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

**3. Start the app**
```bash
# macOS / Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```
The API runs on `http://localhost:8080`.

---

## API Endpoints

| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/users` | Create a user | 201 |
| POST | `/groups` | Create a group | 201 |
| POST | `/groups/{id}/members` | Add a user to a group | 200 |
| POST | `/groups/{id}/expenses` | Add an expense, split equally among members | 201 |
| GET | `/groups/{id}/expenses?page=0&size=10` | List expenses, newest first (paginated) | 200 |
| GET | `/groups/{id}/balances` | Net balance of every member | 200 |
| GET | `/groups/{id}/settlements` | Suggested payments to settle the group | 200 |

### Sample requests

**Create user** — `POST /users`
```json
{ "name": "Rahul", "email": "rahul@mail.com" }
```
Response `201 Created`
```json
{ "id": 11, "name": "Rahul", "email": "rahul@mail.com" }
```

**Create group** — `POST /groups`
```json
{ "name": "Goa Trip" }
```

**Add member** — `POST /groups/2/members`
```json
{ "userId": 8 }
```

**Add expense** — `POST /groups/1/expenses`
```json
{ "description": "Dinner", "amount": 100, "paidByUserId": 2 }
```
Response `201 Created` (shortened)
```json
{
  "id": 9,
  "description": "Dinner",
  "amount": 100,
  "paidByUserId": 2,
  "createdAt": "2026-10-09T09:15:51.4021817",
  "splits": [
    { "userId": 4, "userName": "Priya", "shareAmount": 25.00 }
  ]
}
```

**List expenses** — `GET /groups/2/expenses?page=1&size=2`
```json
{
  "content": [
    { "id": 6, "description": "Snacks", "amount": 60.00, "paidByUserId": 10, "createdAt": "2026-10-06T21:46:46.201578" },
    { "id": 5, "description": "Lunch",  "amount": 90.00, "paidByUserId": 9,  "createdAt": "2026-10-05T10:13:52.155746" }
  ],
  "page": { "size": 2, "number": 1, "totalElements": 5, "totalPages": 3 }
}
```
`page` must be ≥ 0 and `size` must be 1–50, otherwise `400`.

### Error format

All errors are handled by one `@ControllerAdvice` and return:
```json
{ "status": 409, "message": "User 1 is already a member of group 1" }
```

| Status | When |
|---|---|
| 400 | Validation failed (blank name, invalid email, bad page/size, …) |
| 404 | Group or user not found |
| 409 | Duplicate email, or user already in the group |

---

## Key Design Decisions

- **BigDecimal for money** —
double stores numbers in binary, so values like 0.1 can’t be stored exactly (0.1 + 0.2 = 0.30000000000000004). BigDecimal stores exact decimal digits and lets me control rounding explicitly.
- **Rounding rule** (₹100 split 3 ways) —
Each share is rounded down to 2 decimals; the leftover paise go to the payer. ₹100 / 3 → 33.33, 33.33, and 33.34 for the payer, so shares always add up to exactly the amount.
- **@Transactional on add expense** —
Saving an expense and its splits is one @Transactional unit: if any split fails, the expense is rolled back too, so no half-saved data.
- **DTOs, not entities, in responses** —
Controllers return DTOs, not entities, so internal fields aren’t exposed and the API shape doesn’t change when the database model changes.
- **409 on duplicates** (Java check + DB unique constraint) —
existsByEmail gives a friendly 409 message. But two simultaneous requests can both pass that check (a race condition), so the DB unique constraint is the real guarantee; its DataIntegrityViolationException is mapped to 409 instead of 500.
- **Balances algorithm** —
One pass with a HashMap<userId, BigDecimal>: every member starts at 0, the payer gets +amount, each split’s user gets −share. Thanks to the rounding rule, balances always sum to 0.
- **Settlements: greedy with two max-heaps** — (include the limitation: at most n−1 payments, not always the minimum)
Two max-heaps (debtors stored as positive amounts). The largest debtor pays the largest creditor min(debt, credit); any leftover goes back into its heap. O(n log n), at most n−1 payments. Not always the minimum: +6, +5, −5, −3, −3 gives 4 payments, but 3 are possible.
- **Pagination** (stable sort, no splits in the list) —
Returns one page at a time instead of every expense. Sorted by createdAt DESC with id as a tie-breaker, so pages are stable. The list DTO has no splits, and page/size are validated (400 on bad values).
- **N+1 fix** (`@ManyToOne` LAZY, 5 → 3 queries) —
@ManyToOne is EAGER by default, so listing expenses fired one extra users query per payer. I made it LAZY: Hibernate uses a proxy, getId() reads the id with no SQL, and queries went from 5 → 3.

---

## Running Tests

```bash
./mvnw test        # Windows: mvnw.cmd test
```

| Test | What it checks |
|---|---|
| `SettlementServiceTest.goaTrip_producesTwoPayments` | Goa Trip balances give exactly Chetan→Amit 130, Bina→Amit 40 |
| `SettlementServiceTest.greedyIsNotAlwaysOptimal` | Documents the greedy limit: +6,+5,−5,−3,−3 gives 4 payments (optimal is 3) |
| `BalanceServiceTest.balances_sumToZero` | ₹100 split 3 ways (33.34 / 33.33 / 33.33) → balances sum to exactly 0 |

The service tests are **unit tests**: repositories and services are mocked with Mockito, so they run **without a database**.
`SpliteasyApplicationTests` starts the full Spring context and **needs MySQL running**.
