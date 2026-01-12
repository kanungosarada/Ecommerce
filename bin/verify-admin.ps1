$baseUrl = "http://localhost:8080/api"

Write-Host "=== ADMIN USER VERIFICATION ===" -ForegroundColor Cyan

# Login as admin
Write-Host "`nLogging in as adminUser..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"adminUser","password":"password123"}'
    
    Write-Host "`nLOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "`nUser ID: $($loginResponse.id)" -ForegroundColor White
    Write-Host "Username: $($loginResponse.username)" -ForegroundColor White
    Write-Host "Roles: $($loginResponse.roles -join ', ')" -ForegroundColor Yellow
    
    if ($loginResponse.roles -contains "ROLE_ADMIN") {
        Write-Host "`n✓ USER HAS ROLE_ADMIN - Frontend SHOULD show admin features!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ USER DOES NOT HAVE ROLE_ADMIN - This is the problem!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`nLOGIN FAILED!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
