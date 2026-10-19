@echo off
rem Dubbelklik om De films van Bram te openen op http://localhost:8000
cd /d "%~dp0"
where python >nul 2>nul && (set PY=python) || (set PY=py -3)
if exist serve.py (
  %PY% serve.py 8000
) else (
  start "" http://localhost:8000
  %PY% -m http.server 8000
)
pause
