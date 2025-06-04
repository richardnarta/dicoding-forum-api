# dicoding-forum-api

## Installation

If you don't have [NodeJS](https://nodejs.org/en/download/package-manager), [PostgreSQL](https://www.postgresql.org/) installed, install those first.

---

Clone the repository

```bash
  git clone https://github.com/richardnarta/dicoding-forum-api
```

Navigate to the directory

```bash
  cd dicoding-forum-api
```

Install dependencies

```bash
  npm install
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### server configuration

`HOST`=localhost

`PORT`=5000

### database configuration

`PGUSER`=your_username

`PGPASSWORD`=your_password

`PGDATABASE`=your_database

`PGHOST`=database_host

`PGPORT`=databaseport

### database test configuration

`PGUSER_TEST`=your_username

`PGPASSWORD_TEST`=your_password

`PGDATABASE_TEST`=your_database

`PGHOST_TEST`=database_host

`PGPORT_TEST`=databaseport

### tokenize configuration

`ACCESS_TOKEN_KEY`=your_access_key

`REFRESH_TOKEN_KEY`=your_refresh_key

`ACCCESS_TOKEN_AGE`=3000


## Start Database Migration

Prepare the test database config

- Make new directory "config"
- Create new config file "test.json" with content : 
```
  {
    "user": "your_username",
    "password": "your_password",
    "host": "database_host",
    "port": "database_port",
    "database": "database_name"
  }
```

To start database migration, run the following command

*Database Creation*

```bash
  psql -U <username>
  CREATE DATABASE forumapi
  CREATE DATABASE forumapi_test
```

```bash
  npm run migrate up
  npm run migrate:test up
```


## Running Testing

To run unit and coverage testing, run the following command

```bash
  npm run test
```


## Running Server

To run the backend service, run the following command

```bash
  npm run start
```