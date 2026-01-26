@echo off
echo ========================================
echo Evidence Management System - FDSJ 739-24
echo ========================================
echo.
echo [1] Open Evidence Viewer (Standalone)
echo [2] Start API Server
echo [3] Rebuild Database
echo [4] Export Exhibit Index
echo [5] View Statistics
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" (
    echo.
    echo Opening Evidence Viewer...
    start evidence_viewer.html
)

if "%choice%"=="2" (
    echo.
    echo Starting API Server on http://localhost:5000...
    python api_server.py
)

if "%choice%"=="3" (
    echo.
    echo Rebuilding database...
    python evidence_database.py
    python module_mapper.py
    echo.
    echo Database rebuilt successfully!
    pause
)

if "%choice%"=="4" (
    echo.
    echo Exporting exhibit index...
    python -c "from evidence_database import EvidenceDatabase; db = EvidenceDatabase(); db.export_exhibit_index(); print('Exported to exhibit_index.txt')"
    echo.
    pause
)

if "%choice%"=="5" (
    echo.
    python -c "from evidence_database import EvidenceDatabase; db = EvidenceDatabase(); stats = db.get_stats(); print('Total Exhibits:', stats['total_exhibits']); print('Critical (P10):', stats['critical_count']); print('\nBy Category:'); [print(f'  {k}: {v}') for k,v in stats['by_category'].items()]"
    echo.
    pause
)
