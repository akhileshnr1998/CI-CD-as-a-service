# CI/CD as a service

A small-scale backend that mimics CI/CD — run shell commands on GitHub push events (e.g., lint/test/build).

* Mimic basic CI/CD (like GitHub Actions)
* Run shell commands on GitHub push events
* Show job logs, history, and status
* Support per-repo queuing
* Secure secrets

## Steps to test it out

### Pre-requisites

1. Install node
2. Install docker and docker-compose

### Install node modules

```sh
npm i
```

### Install redis using docker-compose file

```sh
sudo docker-compose up
```

### Initialise server

1. In development (watch) mode

```sh
npm run dev
```

1. In production mode

```sh
npm run prod
```