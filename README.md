# Personal Website

[bdesbrisay.github.io](bdesbrisay.github.io)

## Local Preview

Prerequisites: Python 3 installed.

1. Open a terminal in the repository root (`bdesbrisay.github.io/`).
2. Run the preview server:
    ```bash
    npm start
    ```
    This executes `python3 -m http.server 8081 --bind 127.0.0.1` from `package.json`, binding the server to loopback only.
3. Open http://localhost:8081/ in your browser. The site root page should load. The server is local-only and does not expose the repository beyond 127.0.0.1.
4. Stop the server with `Ctrl+C` in the terminal.

## Smoke Test

Automated verification of the loopback preview configuration — not a browser UI check.

Prerequisites: Python 3 installed.

Run from the repository root:

```bash
npm test
```

This executes `python3 -m unittest tests.test_preview`. The test reads `package.json` `scripts.start`, asserts explicit `--bind 127.0.0.1` binding and port 8081, launches the configured Python server, polls http://127.0.0.1:8081/ for HTTP 200, reports an occupied preview port clearly, and always terminates the child process.

This automated smoke test validates the preview command and responsiveness. Independent browser verification of page content is separate and uses the Local Preview steps above.

Direct Python invocation also works:

```bash
python3 -m unittest discover -s tests -p test_preview.py
```

