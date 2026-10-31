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

    def test_root_http_200(self):
        with urllib.request.urlopen(URL, timeout=2) as resp:
            self.assertEqual(resp.status, 200)

    def test_root_content_type_html(self):
        with urllib.request.urlopen(URL, timeout=2) as resp:
            ct = resp.headers.get_content_type()
            self.assertTrue(ct.startswith('text/html') or ct == 'text/html')


if __name__ == '__main__':
    unittest.main()
