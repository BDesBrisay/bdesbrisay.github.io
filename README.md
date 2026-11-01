# Personal Website

[bdesbrisay.github.io](bdesbrisay.github.io)

## Local Preview

Prerequisites:
- Python 3 installed (for Python-only preview).
- Node.js/npm installed (required for `npm start`/`npm test`).

1. Open a terminal in the repository root (`bdesbrisay.github.io/`).
2. Run the preview server:
   - Using npm (requires Node.js/npm):
      ```bash
      npm start
      ```
   - Python-only (no npm required):
      ```bash
      python3 -m http.server 8081 --bind 127.0.0.1
      ```
   Both commands execute `python3 -m http.server 8081 --bind 127.0.0.1` from `package.json`, binding the server to loopback only.
3. Open http://localhost:8081/ in your browser. The site root page should load. The server is local-only and does not expose the repository beyond 127.0.0.1.
4. Stop the server with `Ctrl+C` in the terminal.

## Smoke Test

Automated verification of the loopback preview configuration — not a browser UI check.

Prerequisites:
- Python 3 installed.
- Node.js/npm installed (required for `npm test`).

Run from the repository root:

```bash
npm test
```

This executes `python3 -m unittest tests.test_preview`. The test reads `package.json` `scripts.start`, asserts explicit `--bind 127.0.0.1` binding and port 8081, launches the configured Python server, polls http://127.0.0.1:8081/ for HTTP 200, reports an occupied preview port clearly, and always terminates the child process.

This automated smoke test validates the preview command and responsiveness. Independent browser verification of page content is separate and uses the Local Preview steps above.

### Verification

Run from the repository root:

```bash
npm test
```

or npm-free:

```bash
python3 -m unittest tests.test_preview
```

Both commands execute the same verification defined in `package.json` (`"test": "python3 -m unittest tests.test_preview"`) and `tests/test_preview.py`. The test reads `package.json` `scripts.start`, asserts explicit `--bind 127.0.0.1` binding and port 8081, and validates the loopback preview.
