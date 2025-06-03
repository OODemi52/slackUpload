# [ARCHIVED] SlackShots (Fullstack Monorepo)

> This repository has been **archived** and is no longer actively maintained.  
> The codebase has been split into focused, standalone services for better structure, scalability, and maintainability.

---

##  SlacksShots - Legacy Structure

This monorepo previously contained:

- `frontend/` – a SlackShots frontend written in Typescript with React+Vite
- `backend/` – a SlackShots backend written in Typescript with Node

Both folders have been preserved for historical reference but are no longer updated.

---

## Migration Details

The application is now structured across multiple dedicated repositories:

- **Frontend (Next.js)** → [`TBD`](https://github.com/OODemi52)
- **Backend -  Go Implementation** → [`TBD`](https://github.com/OODemi52)
- **Backend - Node Implementation** → [`TBDo`](https://github.com/OODemi52)

---

## Why the Split?

This monorepo grew to include multiple technologies and responsibilities, making it hard to maintain, test, and deploy independently. Splitting it allows for:

- Isolated deployments & CI/CD
- Better service ownership and versioning
- Cleaner code organization
- Improved performance on both backend and frontend

The backend is also being written in Golang due to the relatively high memory usage of running the server via Node, especially since parts of the application can be a bit computationally heavy and Node frequently proved be a bottleneck.
