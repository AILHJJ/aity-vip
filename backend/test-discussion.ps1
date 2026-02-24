# Test create discussion API
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NzA3NzU1NDcsImV4cCI6MTc3MDg2MTk0N30.wd3QTKo7uLKJvBDi5TbPYWozBfp1Q5wnJPIZVhNsrB4"

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$body = @{
    messageId = 93
    title = 'test discussion'
    content = 'test content'
    visibility = 'private'
} | ConvertTo-Json

Write-Host "Testing create discussion API..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/discussions' -Method POST -Body $body -Headers $headers -TimeoutSec 30
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)"
}
