# flyrank-BE-02

## Why SQLite

Single file (`tasks.db`), zero setup, survives restarts. The database is created automatically on first run with the schema and three seeded tasks.

## Setup

1. Clone the repository

```bash
git clone https://github.com/faugconti/flyrank-BE.git
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm run dev
```

The server will run on:

```
http://localhost:3000
```

On first run, `tasks.db` is created automatically with the `tasks` table and three example tasks. The database file is git-ignored so each clone starts fresh.

## Database

![Database in DB Browser](screenshot.png)

## Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | API information |
| GET | /health | Health check |
| GET | /docs | swagger documentation |
| GET | /tasks | List all tasks |
| GET | /tasks/{id} | Get a task by id |
| POST | /tasks | Create a task |
| PUT | /tasks/{id} | Update a task |
| DELETE | /tasks/{id} | Delete a task |

## Example SQL query

```sql
SELECT * FROM tasks WHERE done = 0;
```

Returns all open (unfinished) tasks.

## Example

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Buy groceries\"}"
```

Output:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 4,
  "title": "Buy groceries",
  "done": false
}
```
