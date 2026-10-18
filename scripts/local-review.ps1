<#
Owner-operated local synthetic preview launcher. Requires an already provisioned
isolated DB and the CurrentUser DPAPI key. Never reads .env files or runs setup,
migrations, seed, reset, OAuth, or Gmail delivery.
#>
[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
function Assert-NoReparseComponents([string] $Path) {
  $current=[IO.DirectoryInfo]::new($Path)
  while($null -ne $current) { if(Test-Path -LiteralPath $current.FullName) { $item=Get-Item -LiteralPath $current.FullName -Force; if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Protected key path contains a reparse point.' } }; $current=$current.Parent }
}
if($env:OS -ne 'Windows_NT') { throw 'This local key launcher requires Windows DPAPI.' }
$DatabaseUrl=$env:BOOKING_SYNTHETIC_DATABASE_URL
if(-not $DatabaseUrl -or $DatabaseUrl -notmatch '^postgres(?:ql)?://(?:[^/@]+@)?(?:127\.0\.0\.1|\[::1\]):[0-9]+/divaa_synthetic_[a-z0-9_]+$') { throw 'Provide an explicit loopback synthetic database through the approved host process configuration; URL options are forbidden.' }
if(-not $env:BOOKING_ADMIN_PASSWORD -or $env:BOOKING_ADMIN_PASSWORD.Length -lt 14) { throw 'Owner must inject the synthetic staff password securely into this process.' }
$root=[IO.Path]::Combine($env:LOCALAPPDATA,'DivaaBeauty','secrets')
$keyPath=[IO.Path]::Combine($root,'review-key.dpapi')
Assert-NoReparseComponents $root
$acl=Get-Acl -LiteralPath $keyPath
if(-not $acl.AreAccessRulesProtected) { throw 'Review key ACL is not protected.' }
$sealed=[IO.File]::ReadAllBytes($keyPath); $plain=$null; $keyBytes=$null; $keyText=$null
try {
  $plain=[Security.Cryptography.ProtectedData]::Unprotect($sealed,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  $keyText=[Text.Encoding]::UTF8.GetString($plain)
  $keyBytes=[Convert]::FromBase64String($keyText)
  if($keyBytes.Length -ne 32) { throw 'Stored review key is invalid.' }

  $env:DATABASE_URL=$DatabaseUrl
  $env:BOOKING_SYNTHETIC_DATABASE_URL=$DatabaseUrl
  $env:BOOKING_ALLOW_SYNTHETIC='true'
  $env:BOOKING_CALENDAR_MODE='mock'
  $env:BOOKING_ENCRYPTION_KEY=$keyText
  $env:BETTER_AUTH_URL='http://127.0.0.1:3119'
  $env:BOOKING_ADMIN_EMAIL='staff@example.test'
  $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $authBytes=[byte[]]::new(48); $rateBytes=[byte[]]::new(32); $jobBytes=[byte[]]::new(32)
    $rng.GetBytes($authBytes); $rng.GetBytes($rateBytes); $rng.GetBytes($jobBytes)
    $env:BETTER_AUTH_SECRET=[Convert]::ToBase64String($authBytes)
    $env:BOOKING_RATE_KEY=([BitConverter]::ToString($rateBytes).Replace('-','')).ToLowerInvariant()
    $env:BOOKING_JOB_SECRET=([BitConverter]::ToString($jobBytes).Replace('-','')).ToLowerInvariant()
  } finally { $rng.Dispose(); if($authBytes){[Array]::Clear($authBytes,0,$authBytes.Length)}; if($rateBytes){[Array]::Clear($rateBytes,0,$rateBytes.Length)}; if($jobBytes){[Array]::Clear($jobBytes,0,$jobBytes.Length)} }
  $env:BOOKING_EMAIL_ENABLED='false'
  $env:NEXT_TELEMETRY_DISABLED='1'
  foreach($name in @(Get-ChildItem Env: | ForEach-Object Name)) { if($name.StartsWith('GOOGLE_') -or $name -in @('VERCEL','BOOKING_TRUSTED_EDGE','BOOKING_GMAIL_CLIENT_ID','BOOKING_GMAIL_CLIENT_SECRET','BOOKING_GMAIL_SENDER','BOOKING_GMAIL_REFRESH_TOKEN')) { Remove-Item "Env:$name" -ErrorAction SilentlyContinue } }

  # Load the app's own synthetic guard and store code, but do not mutate DB.
  $guard=@'
import { syntheticDatabase } from './src/lib/booking/synthetic.mjs';
import { openStore } from './src/lib/booking/store.mjs';
const database=syntheticDatabase();
const db=openStore(database);
try {
  const r=await db.query("SELECT current_database() AS name, to_regclass('public.booking_settings') AS settings, to_regclass('public.reservations') AS reservations");
  if(r.rows[0].name!==new URL(database).pathname.slice(1) || !r.rows[0].settings || !r.rows[0].reservations) throw new Error('Wrong or uninitialized synthetic database');
  console.log(JSON.stringify({database:r.rows[0].name,initialized:true,synthetic:true}));
} finally { await db.end(); }
'@
  $guard | node --input-type=module -
  if($LASTEXITCODE -ne 0) { throw 'Selected synthetic database check failed.' }

  Write-Output 'Synthetic DB identity verified; Gmail delivery disabled. Starting local preview in foreground.'
  & node.exe 'node_modules/next/dist/bin/next' dev --webpack --hostname 127.0.0.1 --port 3119
  if($LASTEXITCODE -ne 0) { throw "Local preview child exited with code $LASTEXITCODE." }
}
catch { throw 'Local synthetic preview did not start; secret material was not written to output.' }
finally {
  if($sealed) { [Array]::Clear($sealed,0,$sealed.Length) }; if($plain) { [Array]::Clear($plain,0,$plain.Length) }; if($keyBytes) { [Array]::Clear($keyBytes,0,$keyBytes.Length) }
  Remove-Item Env:BOOKING_ENCRYPTION_KEY -ErrorAction SilentlyContinue
  Remove-Variable keyText -ErrorAction SilentlyContinue
}
