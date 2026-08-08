# AITY VIP Iteration Current

This is the clean iteration baseline created on 2026-08-08.

## Structure

- `backend/`: stable backend API baseline, aligned with the currently running production backend as closely as local evidence allows.
- `aity-uni-app-v2/`: uni-app frontend source. Use it for both Weixin mini-program and H5 builds.
- `docs/operations/`: production baseline, deployment, and iteration operation notes.

## Frontend Policy

Maintain one frontend source: `aity-uni-app-v2`.

- Weixin mini-program: `npm run build:mp-weixin`, then upload with Weixin DevTools or `miniprogram-ci`.
- H5: `npm run build:h5`, then deploy the built artifact to the server static directory.
- Do not continue feature development from the old server `/var/www/frontend` source unless explicitly reviving the old H5 app.

## Backend Policy

Backend deployment should be Git/SHA traceable. Runtime data, logs, uploads, and `.env*` files are not source code.

## Safe Defaults

Do not commit `.env*`, PEM/key files, archives, `node_modules`, `dist`, logs, or uploads.
