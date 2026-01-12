$baseUrl = "http://localhost:8080/api"

Write-Host "--- E-COMMERCE BACKEND DEMO ---" -ForegroundColor Cyan

# 1. Register Admin
Write-Host "`n[1] Registering Admin User..." -ForegroundColor Yellow
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body '{"username": "adminUser", "password": "password123", "role": ["admin"]}'
    Write-Host "Success: $regResponse" -ForegroundColor Green
} catch {
    Write-Host "User 'adminUser' already exists or error. Proceeding..." -ForegroundColor Gray
}

# 2. Login Admin
Write-Host "`n[2] Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"username": "adminUser", "password": "password123"}'
    $token = $loginResponse.token
    Write-Host "Authentication Successful! Token acquired." -ForegroundColor Green
} catch {
    Write-Host "Login failed. Stopping demo." -ForegroundColor Red
    exit
}

# 3. Create Product
Write-Host "`n[3] Creating a Product (Legacy ThinkPad)..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
try {
    $productBody = '{"name": "Lenovo ThinkPad X1", "price": 1500.00, "description": "Business flagship laptop", "stock": 50}'
    $product = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -ContentType "application/json" -Headers $headers -Body $productBody
    Write-Host "Product Created: $($product.name) (ID: $($product.id))" -ForegroundColor Green
} catch {
    Write-Host "Failed to create product. $_" -ForegroundColor Red
}

# 4. List Products
Write-Host "`n[4] Fetching Product Catalog..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
$products | Format-Table id, name, price, stock, description -AutoSize

Write-Host "`nDemo Complete!" -ForegroundColor Cyan
