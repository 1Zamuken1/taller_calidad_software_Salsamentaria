@echo off
cls
echo ============================================
echo   Analizando Backend con SonarQube
echo ============================================
echo.

mvn clean verify sonar:sonar ^
  -Dsonar.projectKey=salsamentaria-backend ^
  -Dsonar.projectName="Salsamentaria Backend" ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqa_ec0626fcd2088d2f1cd07930af28b86eee04a206

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   ANALISIS EXITOSO!
    echo   Abre: http://localhost:9000
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   ERROR EN EL ANALISIS
    echo   Revisa los mensajes arriba
    echo ============================================
)

echo.
pause