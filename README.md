# SplitEasy

A Splitwise-style expense splitter. Create people and groups, record shared expenses (split equally), see who owes whom, and get a short list of payments that settles the group.

- **Backend (my own work):** Java, Spring Boot, Spring Data JPA, MySQL, with unit tests.
- **Demo UI (built with AI):** a React frontend in [`frontend/`](frontend) so the API can be shown in a browser. See [About the frontend](#about-the-frontend).

No authentication and no real payments: settlements are suggestions only.

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
| Demo UI | React 19, Vite, Tailwind CSS, React Router, Axios, Recharts |

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

## How to Run (Windows)

You need: **JDK 17+**, **MySQL 8**, and **Node.js 22 LTS** (only for the UI).

### 1. Create the database
In MySQL Workbench or the `mysql` shell:
```sql
CREATE DATABASE spliteasy;
```

### 2. Give the app your MySQL password
`application.properties` reads the password from an environment variable, so it is never committed:
```properties
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
```
- **IntelliJ:** Run → Edit Configurations → `SpliteasyApplication` → Environment variables → `DB_PASSWORD=your_password`
- **PowerShell:** `$env:DB_PASSWORD="your_password"` (in the same window you start the app from)

### 3. Start the backend
Run `SpliteasyApplication` in IntelliJ, or in PowerShell from the project folder:
```powershell
.\mvnw.cmd spring-boot:run
```
The API runs on `http://localhost:8080`. Tables are created automatically (`ddl-auto=update`).

### 4. Start the UI
In a **second** PowerShell window:
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```
Open **http://localhost:5173**.

The UI calls `/api/...` and the Vite dev server forwards those calls to `http://localhost:8080`, so the browser only talks to one origin and **the backend needs no CORS configuration**.

### 5. (Optional) Load clean demo data
With the backend running and the database empty:
```powershell
cd frontend
npm run seed
```
This calls the real API to create 5 people, a **Goa Trip** group (Amit pays Hotel ₹300, Bina pays Lunch ₹90 → Amit +170, Bina −40, Chetan −130, the same numbers as the unit test) and an **Office Lunch** group (₹100 split 3 ways → 33.33 / 33.33 / 33.34) to show the rounding rule.

### Reset the database
Deletes **all** SplitEasy data:
```sql
DROP DATABASE spliteasy;
CREATE DATABASE spliteasy;
```
Then restart the backend so it recreates the tables.

---

## API Endpoints

| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/users` | Create a user | 201 |
| GET | `/users` | List all users *(added for the UI)* | 200 |
| POST | `/groups` | Create a group | 201 |
| GET | `/groups` | List all groups, id + name *(added for the UI)* | 200 |
| GET | `/groups/{id}` | One group with its members *(added for the UI)* | 200 |
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
|

---

## Key Design Decisions

- **BigDecimal for money** — `double` stores numbers in binary, so values like 0.1 can't be stored exactly (`0.1 + 0.2 = 0.30000000000000004`). `BigDecimal` stores exact decimal digits and lets me control rounding explicitly.

- **Rounding rule** (₹100 split 3 ways) — Each share is rounded down to 2 decimals; the leftover paise go to the payer. ₹100 / 3 → 33.33, 33.33, and 33.34 for the payer, so shares always add up to exactly the amount.

- **`@Transactional` on add expense** — Saving an expense and its splits is one `@Transactional` unit: if any split fails, the expense is rolled back too, so no half-saved data.

- **DTOs, not entities, in responses** — Controllers return DTOs, not entities, so internal fields aren't exposed and the API shape doesn't change when the database model changes.

- **409 on duplicates** (Java check + DB unique constraint) — `existsByEmail` gives a friendly 409 message. But two simultaneous requests can both pass that check (a race condition), so the DB unique constraint is the real guarantee; its `DataIntegrityViolationException` is mapped to 409 instead of 500.

- **Balances algorithm** — One pass with a `HashMap<userId, BigDecimal>`: every member starts at 0, the payer gets +amount, each split's user gets −share. Thanks to the rounding rule, balances always sum to 0.

- **Settlements: greedy with two max-heaps** — Two max-heaps (debtors stored as positive amounts). The largest debtor pays the largest creditor `min(debt, credit)`; any leftover goes back into its heap. O(n log n), at most n−1 payments. Not always the minimum: +6, +5, −5, −3, −3 gives 4 payments, but 3 are possible.

- **Pagination** (stable sort, no splits in the list) — Returns one page at a time instead of every expense. Sorted by `createdAt DESC` with `id` as a tie-breaker, so pages are stable. The list DTO has no splits, and `page`/`size` are validated (400 on bad values).

- **N+1 fix** (`@ManyToOne` LAZY, 5 → 3 queries) — `@ManyToOne` is EAGER by default, so listing expenses fired one extra `users` query per payer. I made it LAZY: Hibernate uses a proxy, `getId()` reads the id with no SQL, and queries went from 5 → 3.

---

## Running Tests

```powershell
.\mvnw.cmd test
```

| Test | What it checks |
|---|---|
| `SettlementServiceTest.goaTrip_producesTwoPayments` | Goa Trip balances give exactly Chetan→Amit 130, Bina→Amit 40 |
| `SettlementServiceTest.greedyIsNotAlwaysOptimal` | Documents the greedy limit: +6,+5,−5,−3,−3 gives 4 payments (optimal is 3) |
| `BalanceServiceTest.balances_sumToZero` | ₹100 split 3 ways (33.34 / 33.33 / 33.33) → balances sum to exactly 0 |
| `UserServiceTest` *(added with the UI)* | `getAllUsers` maps entities to DTOs; empty database gives an empty list |
| `GroupServiceTest` *(added with the UI)* | `getAllGroups` mapping; `getGroup` returns members sorted by id; missing group → `ResourceNotFoundException` |

The service tests are **unit tests**: repositories and services are mocked with Mockito, so they run **without a database**.
`SpliteasyApplicationTests` starts the full Spring context and **needs MySQL running** (and `DB_PASSWORD` set).

---

## About the frontend

**The backend is my own work. The React UI in `frontend/` was built with AI help** so the API can be demonstrated in a browser instead of Postman. It contains no business logic: every split, balance and settlement shown on screen comes from the Spring Boot API.

### What the UI uses

| Screen | Backend endpoints |
|---|---|
| Dashboard | `GET /users`, `GET /groups`, then per group `GET /groups/{id}`, all pages of `GET /groups/{id}/expenses`, `GET /groups/{id}/balances` |
| People | `GET /users`, `POST /users` (shows the 409 duplicate-email message on the email field) |
| Groups | `GET /groups`, `GET /groups/{id}` (member avatars), `POST /groups` |
| Group → Members | `GET /groups/{id}`, `GET /users`, `POST /groups/{id}/members` |
| Group → Expenses, Expenses page | `GET /groups/{id}/expenses` (paged, 10 per page), `POST /groups/{id}/expenses` (shows the returned `splits`) |
| Group → Balances | `GET /groups/{id}/balances` |
| Group → Settlements | `GET /groups/{id}/settlements` (ids resolved to names from the group's members) |

### Changes made to the original backend
Only additions; no existing endpoint, service or test was changed.
- `UserController` / `UserService`: `GET /users` → `getAllUsers()` (sorted by id)
- `GroupController` / `GroupService`: `GET /groups` → `getAllGroups()`, `GET /groups/{id}` → `getGroup()` (404 via the existing `ResourceNotFoundException`; `@Transactional(readOnly = true)` because `members` is lazy and open-in-view is off)
- New tests: `UserServiceTest`, `GroupServiceTest`

### Limitations
- No login: anyone using the UI can see and change everything.
- Settlements are suggestions. Nothing records that a payment happened, so balances only change when expenses change.
- No editing or deleting of users, groups, expenses or members (the API has no such endpoints).
- The dashboard makes a few requests per group (fine for a demo; a real app would add one summary endpoint).
- The UI loads fonts from Google Fonts; offline it falls back to system fonts.

---

## Demo script (about 3 minutes)

1. **Dashboard:** "Total spent and what is still waiting to be settled, computed from the API."
2. **Goa Trip → Balances:** "Amit +170, Bina −40, Chetan −130. They add up to zero because the rounding leftover always goes to the payer."
3. **Settlements:** "Two max-heaps: the biggest debtor pays the biggest creditor. Chetan pays Amit 130, Bina pays Amit 40. At most n−1 payments, but not always optimal; I have a unit test with a counterexample."
4. **Office Lunch → Expenses:** add ₹100 paid by Rahul. "100 / 3 rounds down to 33.33; the extra paisa goes to Rahul, so the shares add up to exactly 100."
5. **People:** add an existing email. "The friendly 409 comes from `existsByEmail`; the DB unique constraint is the real guarantee if two requests race."
6. Close: "The backend and tests are mine. I used AI for the UI so the demo doesn't need Postman, and I kept all logic on the server."
