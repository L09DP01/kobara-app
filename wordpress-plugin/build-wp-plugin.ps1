param(
    [string]$Destination = "kobara-woocommerce.zip"
)

# Remove the old zip if it exists
if (Test-Path $Destination) {
    Remove-Item $Destination
}

# Compress the plugin directory properly
Write-Host "Creating $Destination..."
Compress-Archive -Path "kobara-wordpress-plugin" -DestinationPath $Destination

Write-Host "Done! You can now upload $Destination to WordPress."
