param(
    [string]$Email = 'demo@orderflow.dev',
    [string]$Password = 'TempPass!23456',
    [string]$StackName = 'identity-service-dev'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$UserPoolId = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' `
    --output text

$ClientId = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' `
    --output text

$authResult = aws cognito-idp initiate-auth `
    --client-id $ClientId `
    --auth-flow USER_PASSWORD_AUTH `
    --auth-parameters "USERNAME=$Email,PASSWORD=$Password" `
    --query 'AuthenticationResult' `
    --output json | ConvertFrom-Json

$accessToken = $authResult.AccessToken

# Decodifica el payload del JWT (segunda parte) delegando en node: PowerShell puede
# estar en Constrained Language Mode y bloquear la invocacion directa de [Convert].
$payloadB64 = $accessToken.Split('.')[1]
$payloadJson = node -e "console.log(Buffer.from(process.argv[1], 'base64url').toString('utf8'))" $payloadB64
Write-Host "Claims del AccessToken:"
$payloadJson | ConvertFrom-Json | Format-List

$env:TOKEN = $accessToken
Write-Host "`nTOKEN guardado en `$env:TOKEN"
