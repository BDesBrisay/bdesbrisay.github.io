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
