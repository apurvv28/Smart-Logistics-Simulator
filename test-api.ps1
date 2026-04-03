# Test the LocalDeliveryController API endpoint

# Wait for backend to start
Start-Sleep -Seconds 3

$body = @{
  warehouse = @{
    id = "warehouse"
    name = "Pune Warehouse"
    latitude = 18.5204
    longitude = 73.8567
    address = "Kalyani Nagar, Pune"
  }
  deliveryStops = @(
    @{
      id = "stop-1"
      name = "Shivaji Nagar"
      address = "Shivaji Nagar, Pune 411005"
      latitude = 18.5523
      longitude = 73.8479
      type = "delivery"
    },
    @{
      id = "stop-2"
      name = "Koregaon Park"
      address = "Koregaon Park, Pune 411001"
      latitude = 18.5347
      longitude = 73.8787
      type = "delivery"
    },
    @{
      id = "stop-3"
      name = "Viman Nagar"
      address = "Viman Nagar, Pune 411014"
      latitude = 18.5672
      longitude = 73.9125
      type = "delivery"
    },
    @{
      id = "stop-4"
      name = "Hadapsar"
      address = "Hadapsar, Pune 411013"
      latitude = 18.5183
      longitude = 73.9288
      type = "delivery"
    }
  )
}

$jsonBody = $body | ConvertTo-Json -Depth 10
Write-Host "Sending request to http://localhost:8080/api/local-delivery/calculate-route"
Write-Host "Request body: $jsonBody"

try {
  $response = Invoke-WebRequest -Uri "http://localhost:8080/api/local-delivery/calculate-route" -Method POST -ContentType "application/json" -Body $jsonBody -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $($response.Content)"
} catch {
  Write-Host "Error: $_"
}
