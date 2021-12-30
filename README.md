## Pre-requisites

- Working installaton of [Docker](https://docs.docker.com/get-docker/) (Run **docker ps** to test)
- [NodeJS](https://nodejs.org/en/download/)

## Running the app

#### Set the environment variables

- Create a **.env** file and set the environment variables.
- Use the **.env.example** file as a reference

#### Run the services (backend & database)

```bash
$ npm run services
```

#### Open another terminal, and initialize the tables by runnning the migration(s)

```bash
$ npm run migration:run
```

---

## Accessing the API

#### Available routes

- `GET` /users - List of all users (Must be logged in as a **user**)
- `POST` /register - Register as a user
- `POST` /login - This is where you enter your **email** and **password** to login (Must have a user or admin account)
- `GET` /twitch-auth - OAuth Redirect endpoint for twitch authentication

#### First time running the app? Create an admin account first

Open another terminal.
Access and run the bash terminal inside of the container

```bash
$ npm run db:bash
```

Connnect to the database using **psql** - PostgreSQL Interactive Terminal.
Make sure the command below matches whatever is inside of your .env file

```bash
$ psql -U YourENVFileDB_USER YourENVFileDB_NAME
```

When connected successfuly, execute this sql query to insert the first admin user

```sql
INSERT INTO public.user(email, password, role) VALUES ('admin@sample.com', '$2b$10$tgCEWdWS/04mEjzSH.XiA.2C1HaBkXLkUIeGRNQPUoP6YrHuMu9ki', 'admin');
```

_\*\* Ask the backend developer for the admin credentials \*\*_

After inserting the first admin user, you can now close the psql with this command (Or just close the terminal lol)

```sql
\q
```

Now, use the admin credentials to send a `POST` request to /login route.
You can now enjoy the power of admin 😈

**_“With great power comes great responsibility"_** - Uncle Ben

---

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
