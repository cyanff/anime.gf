@echo off

set db_path=%USERPROFILE%\AppData\Roaming\Electron\agf.db
set blob_path=%USERPROFILE%\AppData\Roaming\Electron\blob

if not exist "%db_path%" (
    echo Database already does not exist.
    echo Creating a new, empty database.
    type nul > "%db_path%"
    exit /b 0
)

:: Delete and recreate the database
del "%db_path%"
type nul > "%db_path%"

:: Delete the blob directory
if exist "%blob_path%" (
    rmdir /s /q "%blob_path%"
)

echo "Database & blob storage nuked successfully."