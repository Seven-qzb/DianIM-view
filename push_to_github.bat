@echo off
chcp 65001 >nul
echo ======================================================
echo   DianIM-view 代码上传工具 (Push to GitHub)
echo   目标仓库: https://github.com/Seven-qzb/DianIM-view
echo ======================================================
echo.

set PATH=C:\Users\admin\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%

echo 正在推送到 GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================
    echo   [成功] 代码及打包产物已成功上传到 GitHub!
    echo ======================================================
) else (
    echo.
    echo ======================================================
    echo   [提示] 推送需要 GitHub 身份认证。
    echo   你可以使用 GitHub Personal Access Token (PAT) 推送:
    echo   git push https://<YOUR_TOKEN>@github.com/Seven-qzb/DianIM-view.git main
    echo ======================================================
)
pause
