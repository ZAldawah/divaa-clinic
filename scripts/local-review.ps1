<# Start the saved, isolated synthetic review instance; never migrates or seeds. #>
[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
function Assert-NoReparseComponents([string] $Path) {
  $current=[IO.DirectoryInfo]::new([IO.Path]::GetFullPath($Path))
  while($null -ne $current) { if(Test-Path -LiteralPath $current.FullName) { $item=Get-Item -LiteralPath $current.FullName -Force; if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Protected configuration path contains a reparse point.' } }; $current=$current.Parent }
}
if($env:OS -ne 'Windows_NT') { throw 'This local launcher requires Windows DPAPI.' }
$root=[IO.Path]::Combine($env:LOCALAPPDATA,'DivaaBeauty','secrets'); $path=[IO.Path]::Combine($root,'review-instance.dpapi')
Assert-NoReparseComponents $root
if(-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'Provision the local synthetic review instance first.' }
$acl=Get-Acl -LiteralPath $path
if(-not $acl.AreAccessRulesProtected) { throw 'Review configuration ACL is not protected.' }
$sealed=[IO.File]::ReadAllBytes($path); $plain=$null; $config=$null; $key=$null
try {
  $plain=[Security.Cryptography.ProtectedData]::Unprotect($sealed,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  $config=[Text.Encoding]::UTF8.GetString($plain) | ConvertFrom-Json
  $uri=[Uri]$config.databaseUrl
  if($uri.Host -notin @('127.0.0.1','::1') -or $uri.Port -ne 54329 -or $uri.AbsolutePath -notmatch '^/divaa_synthetic_[a-z0-9_]+$' -or $config.adminPassword.Length -lt 14) { throw 'Saved local instance configuration failed validation.' }
  $key=[Convert]::FromBase64String($config.encryptionKey)
  if($key.Length -ne 32) { throw 'Saved local encryption key is invalid.' }
  $env:BOOKING_SYNTHETIC_DATABASE_URL=$config.databaseUrl; $env:BOOKING_ADMIN_PASSWORD=$config.adminPassword
  $env:DATABASE_URL=$config.databaseUrl; $env:BOOKING_ALLOW_SYNTHETIC='true'; $env:BOOKING_CALENDAR_MODE='mock'
  $env:BOOKING_ENCRYPTION_KEY=$config.encryptionKey; $env:BETTER_AUTH_URL='http://127.0.0.1:3119'; $env:BOOKING_ADMIN_EMAIL='staff@example.test'
  $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
  try { $auth=[byte[]]::new(48); $rate=[byte[]]::new(32); $job=[byte[]]::new(32); $rng.GetBytes($auth); $rng.GetBytes($rate); $rng.GetBytes($job); $env:BETTER_AUTH_SECRET=[Convert]::ToBase64String($auth); $env:BOOKING_RATE_KEY=([BitConverter]::ToString($rate).Replace('-','')).ToLowerInvariant(); $env:BOOKING_JOB_SECRET=([BitConverter]::ToString($job).Replace('-','')).ToLowerInvariant() }
  finally { $rng.Dispose(); foreach($b in @($auth,$rate,$job)) { if($b) { [Array]::Clear($b,0,$b.Length) } } }
  $env:BOOKING_EMAIL_ENABLED='false'; $env:NEXT_TELEMETRY_DISABLED='1'
  foreach($name in @(Get-ChildItem Env: | ForEach-Object Name)) { if($name.StartsWith('GOOGLE_') -or $name -in @('VERCEL','BOOKING_TRUSTED_EDGE','BOOKING_GMAIL_CLIENT_ID','BOOKING_GMAIL_CLIENT_SECRET','BOOKING_GMAIL_SENDER','BOOKING_GMAIL_REFRESH_TOKEN')) { Remove-Item "Env:$name" -ErrorAction SilentlyContinue } }
  $guard=@'
import { syntheticDatabase } from './src/lib/booking/synthetic.mjs';
import { openStore } from './src/lib/booking/store.mjs';
const database=syntheticDatabase(); const db=openStore(database);
try { const r=await db.query("SELECT current_database() AS name,to_regclass('public.booking_settings') AS settings,to_regclass('public.booking_reservations') AS reservations"); if(r.rows[0].name!==new URL(database).pathname.slice(1)||!r.rows[0].settings||!r.rows[0].reservations) throw new Error('Wrong or uninitialized synthetic database'); console.log(JSON.stringify({database:r.rows[0].name,initialized:true,synthetic:true})); } finally { await db.end(); }
'@
  $guard | node --input-type=module -; if($LASTEXITCODE -ne 0) { throw 'Saved synthetic database check failed.' }
  Write-Output 'Saved synthetic DB identity verified; Gmail disabled. Starting preview.'
  & node.exe 'node_modules/next/dist/bin/next' dev --webpack --hostname 127.0.0.1 --port 3119
  if($LASTEXITCODE -ne 0) { throw 'Local preview child failed.' }
} catch { throw 'Local synthetic preview did not start; secret material was not written to output.' }
finally { foreach($b in @($sealed,$plain,$key)) { if($b) { [Array]::Clear($b,0,$b.Length) } }; Remove-Variable config -ErrorAction SilentlyContinue; foreach($n in @('BOOKING_ENCRYPTION_KEY','BOOKING_ADMIN_PASSWORD','DATABASE_URL','BOOKING_SYNTHETIC_DATABASE_URL')) { Remove-Item "Env:$n" -ErrorAction SilentlyContinue } }
