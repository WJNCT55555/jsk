@echo off
cd /d C:\Users\lx\Downloads\fuego-de-libertad
start "Dev Server" cmd /c npm run dev
timeout /t 5 /nobreak >nul
start http://localhost:3000/
exit