import json
import os
import subprocess
import time
import urllib.request
import urllib.error
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGE_JSON = os.path.join(REPO_ROOT, 'package.json')
PORT = 8081
HOST = '127.0.0.1'
URL = f'http://{HOST}:{PORT}/'
STARTUP_TIMEOUT = 5.0
POLL_INTERVAL = 0.2


def load_start_command():
    with open(PACKAGE_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    scripts = data.get('scripts', {})
    start_cmd = scripts.get('start')
    if not start_cmd:
        raise AssertionError('package.json missing scripts.start')
    return start_cmd


class TestLoopbackPreview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.start_cmd = load_start_command()
        # Assert explicit loopback binding
        assert '--bind' in cls.start_cmd, 'start command missing --bind'
        assert HOST in cls.start_cmd, f'start command must bind to {HOST}'
        # Simple port presence check
        assert str(PORT) in cls.start_cmd, f'start command must reference port {PORT}'
        # Detect occupied port before launch to avoid false positives from pre-existing listeners
        import socket
        try:
            with socket.create_connection((HOST, PORT), timeout=1):
                raise AssertionError(f'Preview port {PORT} is already in use by an existing listener; test cannot run reliably')
        except (ConnectionRefusedError, socket.timeout, OSError):
            # Port is free or not listening – safe to proceed
            pass
        # Launch server
        cls.proc = subprocess.Popen(
            cls.start_cmd,
            shell=True,
            cwd=REPO_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        # Bounded startup polling
        deadline = time.time() + STARTUP_TIMEOUT
        last_err = ''
        while time.time() < deadline:
            # Check if process died early
            if cls.proc.poll() is not None:
                out, err = cls.proc.communicate()
                raise AssertionError(
                    f'Preview server exited early. stderr: {err.strip() or out.strip()}'
                )
            try:
                with urllib.request.urlopen(URL, timeout=1) as resp:
                    if resp.status == 200:
                        cls._started = True
                        break
            except Exception as e:
                last_err = str(e)
                time.sleep(POLL_INTERVAL)
        else:
            # Timeout
            cls.proc.terminate()
            try:
                cls.proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                cls.proc.kill()
            out, err = cls.proc.communicate()
            # Detect occupied port
            combined = (err or '') + (out or '')
            if 'Address already in use' in combined or 'OSError' in combined or 'Errno 48' in combined:
                raise AssertionError(
                    f'Preview port {PORT} appears occupied. Server output: {combined.strip()}'
                )
            raise AssertionError(
                f'Preview server did not respond within {STARTUP_TIMEOUT}s. Last error: {last_err}. Output: {combined.strip()}'
            )

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'proc') and cls.proc.poll() is None:
            try:
                cls.proc.terminate()
                cls.proc.wait(timeout=2)
            except Exception:
                try:
                    cls.proc.kill()
                except Exception:
                    pass

    def test_start_command_loopback(self):
        self.assertIn('--bind', self.start_cmd)
        self.assertIn(HOST, self.start_cmd)
        self.assertIn(str(PORT), self.start_cmd)

    def test_start_command_explicit_loopback_bind(self):
        # Focused regression: ensure start command explicitly binds to loopback
        import re
        # Verify --bind 127.0.0.1 appears explicitly
        pattern = r'--bind\s+127\.0\.0\.1'
        self.assertRegex(self.start_cmd, pattern, 'start command must explicitly bind to 127.0.0.1')
        # Ensure it does not bind to all interfaces
        self.assertNotIn('0.0.0.0', self.start_cmd, 'start command must not bind to 0.0.0.0')

    def test_start_command_python_http_server(self):
        # Configuration regression: ensure start command uses documented Python HTTP server
        self.assertIn('python3 -m http.server', self.start_cmd, 'start command must use python3 -m http.server')
        self.assertIn(str(PORT), self.start_cmd, f'start command must reference port {PORT}')
        # Explicit loopback binding already checked, reaffirm
        import re
        self.assertRegex(self.start_cmd, r'--bind\s+127\.0\.0\.1', 'start command must explicitly bind to 127.0.0.1')

    def test_readme_documents_python_only_command_matches_package_json(self):
        # Guard that README documents the Python-only command matching package.json start script
        readme_path = os.path.join(REPO_ROOT, 'README.md')
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme = f.read()
        # The documented Python-only command must match the start script exactly
        self.assertIn(self.start_cmd, readme, 'README must document the Python-only command matching package.json scripts.start')
        # Ensure prerequisites mention Node.js/npm for npm usage
        self.assertIn('Node.js/npm', readme, 'README must clarify npm requires Node.js/npm')
        # Ensure Python-only option is documented
        self.assertIn('python3 -m http.server 8081 --bind 127.0.0.1', readme, 'README must document Python-only preview command')

    def test_preview_command_consistency_module_port_bind(self):
        # Focused regression: npm start script and documented Python-only command must retain matching module, port, and bind arguments
        readme_path = os.path.join(REPO_ROOT, 'README.md')
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme = f.read()
        # Extract documented Python-only command from README
        import re
        m = re.search(r'python3 -m http\.server\s+(\d+)\s+--bind\s+(\S+)', readme)
        self.assertIsNotNone(m, 'README must document a python3 -m http.server command with port and --bind')
        doc_port = m.group(1)
        doc_bind = m.group(2)
        # Parse start script components
        start_parts = self.start_cmd.split()
        self.assertGreaterEqual(len(start_parts), 5, 'start command must have enough parts')
        self.assertEqual(start_parts[0], 'python3', 'start command module interpreter must be python3')
        self.assertEqual(start_parts[1], '-m', 'start command must use -m')
        self.assertEqual(start_parts[2], 'http.server', 'start command module must be http.server')
        # Compare port and bind
        self.assertEqual(doc_port, str(PORT), 'documented port must match configured PORT')
        self.assertEqual(doc_bind, HOST, 'documented bind must match configured HOST')
        # Ensure start script contains same port and bind as documented
        self.assertIn(doc_port, self.start_cmd, 'start script port must match documented port')
        self.assertIn(doc_bind, self.start_cmd, 'start script bind must match documented bind')
        # Cross-check module consistency
        self.assertIn('python3 -m http.server', self.start_cmd, 'start script must use python3 -m http.server')

    def test_root_http_200(self):
        with urllib.request.urlopen(URL, timeout=2) as resp:
            self.assertEqual(resp.status, 200)

    def test_root_content_type_html(self):
        with urllib.request.urlopen(URL, timeout=2) as resp:
            ct = resp.headers.get_content_type()
            self.assertTrue(ct.startswith('text/html') or ct == 'text/html')


class TestLoopbackPreviewIsolated(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import socket
        # OS-assigned loopback port for isolation
        s = socket.socket()
        s.bind((HOST, 0))
        cls.port = s.getsockname()[1]
        s.close()
        cls.url = f'http://{HOST}:{cls.port}/'
        # Start documented Python HTTP server config with random port
        cmd = f'python3 -m http.server {cls.port} --bind {HOST}'
        cls.proc = subprocess.Popen(
            cmd,
            shell=True,
            cwd=REPO_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        deadline = time.time() + STARTUP_TIMEOUT
        while time.time() < deadline:
            if cls.proc.poll() is not None:
                out, err = cls.proc.communicate()
                raise AssertionError(f'Preview server exited early. stderr: {err.strip() or out.strip()}')
            try:
                with urllib.request.urlopen(cls.url, timeout=1) as resp:
                    if resp.status == 200:
                        break
            except Exception:
                time.sleep(POLL_INTERVAL)
        else:
            # Cleanup
            try:
                cls.proc.terminate()
                cls.proc.wait(timeout=2)
            except Exception:
                try:
                    cls.proc.kill()
                except Exception:
                    pass
            raise AssertionError('Isolated preview server did not respond within timeout')

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'proc') and cls.proc.poll() is None:
            try:
                cls.proc.terminate()
                cls.proc.wait(timeout=2)
            except Exception:
                try:
                    cls.proc.kill()
                except Exception:
                    pass

    def test_isolated_root_http_200(self):
        with urllib.request.urlopen(self.url, timeout=2) as resp:
            self.assertEqual(resp.status, 200)

    def test_isolated_root_content_type_html(self):
        with urllib.request.urlopen(self.url, timeout=2) as resp:
            ct = resp.headers.get_content_type()
            self.assertTrue(ct.startswith('text/html') or ct == 'text/html')


if __name__ == '__main__':
    unittest.main()
