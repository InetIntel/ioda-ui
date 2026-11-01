# ioda-ui
Web application UI for the IODA project (https://ioda.live)

## Install
1. Ensure Node.js (v16–v18) and Yarn are installed.
2. Clone repo locally.
3. Install frontend dependencies:
   ```bash
   yarn install
   ```

## Development & Building

### Watch mode (Development)
The `watch-all` script watches for both SASS and JavaScript changes, compiling assets into `public/build/` and updating `public/index.html`:
```bash
yarn run watch-all
```

### Production Build
To create an optimized production build:
```bash
yarn run build
yarn run build:css
```
This compiles assets with versioned hashes into `public/build/` and generates `public/index.html`.

### Serving Locally
You can serve the static `public/` directory using any static web server (e.g. `npx serve public` or Python):
```bash
npx serve -s public -l 8000
```
or
```bash
python3 -m http.server 8000 --directory public
```
Check `http://localhost:8000` in your browser.

## Troubleshooting

### OpenSSL unsupported error
If you encounter `ERR_OSSL_EVP_UNSUPPORTED` on newer Node versions:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
```
