
## Installation

```bash
$ pnpm install
```
## Setup

If you want to run the nest client on a port other than 3000, create a file called .env.local in the root of the project and copy the contents of the .env.example file into it.
```bash

$ NEST_CLIENT_PORT=6789
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
