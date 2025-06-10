$headers = @{
    "Content-Type" = "application/json"
}

# Check DEVNET balance (what our system should be using)
Write-Host "=== DEVNET BALANCE (Our System) ==="
$devnetBody = @{
    "jsonrpc" = "2.0"
    "id" = 1
    "method" = "getBalance"
    "params" = @("fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh")
} | ConvertTo-Json

try {
    $devnetResponse = Invoke-RestMethod -Uri "https://api.devnet.solana.com" -Method POST -Headers $headers -Body $devnetBody
    Write-Host "Devnet RPC Response:"
    $devnetResponse | ConvertTo-Json -Depth 5
    
    if ($devnetResponse.result) {
        $devnetLamports = [long]$devnetResponse.result.value
        $devnetSol = $devnetLamports / 1000000000
        Write-Host "DEVNET Balance: $devnetLamports lamports = $devnetSol SOL"
        Write-Host "Expected from our system: 2.897839031 SOL (2,897,839,031 lamports)"
        
        $expectedLamports = 2897839031
        $devnetDifference = $devnetLamports - $expectedLamports
        Write-Host "DEVNET Difference: $devnetDifference lamports"
    }
} catch {
    Write-Host "Devnet Error: $($_.Exception.Message)"
}

Write-Host "`n=== MAINNET BALANCE (For Comparison) ==="
$mainnetBody = @{
    "jsonrpc" = "2.0"
    "id" = 1
    "method" = "getBalance"
    "params" = @("fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh")
} | ConvertTo-Json

try {
    $mainnetResponse = Invoke-RestMethod -Uri "https://api.mainnet-beta.solana.com" -Method POST -Headers $headers -Body $mainnetBody
    Write-Host "Mainnet RPC Response:"
    $mainnetResponse | ConvertTo-Json -Depth 5
    
    if ($mainnetResponse.result) {
        $mainnetLamports = [long]$mainnetResponse.result.value
        $mainnetSol = $mainnetLamports / 1000000000
        Write-Host "MAINNET Balance: $mainnetLamports lamports = $mainnetSol SOL"
    }
} catch {
    Write-Host "Mainnet Error: $($_.Exception.Message)"
}

# Also check Ethereum wallet
Write-Host "`n=== ETHEREUM WALLET ==="
try {
    $ethResponse = Invoke-RestMethod -Uri "https://eth.blockscout.com/api?module=account&action=balance&address=0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d"
    Write-Host "Ethereum API Response:"
    $ethResponse | ConvertTo-Json -Depth 5
    
    if ($ethResponse.result) {
        $wei = [bigint]$ethResponse.result
        $eth = [decimal]$wei / [Math]::Pow(10, 18)
        Write-Host "Balance: $wei wei = $eth ETH"
        Write-Host "Expected from our system: 0.005346845261965834 ETH"
        
        $expectedWei = [bigint]"5346845261965834"
        $weiDiff = $wei - $expectedWei
        Write-Host "Difference: $weiDiff wei"
    }
} catch {
    Write-Host "Ethereum Error: $($_.Exception.Message)"
}

Write-Host "`n=== SUMMARY ==="
Write-Host "System is configured for DEVNET but you may expect MAINNET balances."
Write-Host "Please verify which network should be used for treasury monitoring." 