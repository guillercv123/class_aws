param(
  [string]$Email = "demo@orderflow.dev",
  [string]$TenantId = "tnt_demo_001",
  [ValidateSet("admin", "manager", "staff")]
  [string]$Group = "admin",
  [string]$Password = "TempPass!23456",
  [string]$Stage = "dev"
)

$ErrorActionPreference = "Stop"
$StackName = "identity-service-$Stage"

$UserPoolId = (aws cloudformation describe-stacks `
  --stack-name $StackName `
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" `
  --output text).Trim()

if (-not $UserPoolId) {
  throw "No se pudo obtener UserPoolId del stack $StackName"
}

aws cognito-idp admin-create-user `
  --user-pool-id $UserPoolId `
  --username $Email `
  --user-attributes `
    "Name=email,Value=$Email" `
    "Name=email_verified,Value=true" `
    "Name=custom:tenant_id,Value=$TenantId" `
  --message-action SUPPRESS

if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el usuario $Email" }

aws cognito-idp admin-set-user-password `
  --user-pool-id $UserPoolId `
  --username $Email `
  --password $Password `
  --permanent

if ($LASTEXITCODE -ne 0) { throw "No se pudo establecer el password del usuario $Email" }

aws cognito-idp admin-add-user-to-group `
  --user-pool-id $UserPoolId `
  --username $Email `
  --group-name $Group

if ($LASTEXITCODE -ne 0) { throw "No se pudo agregar el usuario $Email al grupo $Group" }

Write-Host "User created: $Email / $Password (group: $Group, tenant: $TenantId)"
