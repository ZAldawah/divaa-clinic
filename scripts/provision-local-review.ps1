<# Coordinator-only fresh synthetic instance provisioning. Do not run during code review. #>
[CmdletBinding()]
param([switch] $Resume)
$ErrorActionPreference='Stop'
function Assert-NoReparseComponents([string] $Path) { $current=[IO.DirectoryInfo]::new([IO.Path]::GetFullPath($Path)); while($null -ne $current) { if(Test-Path -LiteralPath $current.FullName) { $item=Get-Item -LiteralPath $current.FullName -Force; if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Protected configuration path contains a reparse point.' } }; $current=$current.Parent } }
function Save-Stage([string] $Stage) { $value=[ordered]@{database=$dbName;stage=$Stage;updatedUtc=[DateTime]::UtcNow.ToString('o')}; $json=$value|ConvertTo-Json -Compress; [IO.File]::WriteAllText($stagePath,$json,[Text.UTF8Encoding]::new($false)) }
if($env:OS -ne 'Windows_NT' -or [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) { throw 'Run in the intended Windows user context.' }
$source='C:\Users\zhald\Documents\Paperclip-Runtime\start-divaa-redesign.mjs'; if(-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw 'Approved host launcher source is unavailable.' }
# Read source text only. Do not execute it or open its referenced login file.
$sourceText=[IO.File]::ReadAllText($source); $match=[regex]::Match($sourceText,"const sql\s*=\s*postgres\('([^']+)'\s*,")
if(-not $match.Success) { throw 'Admin connection declaration was not found in approved source.' }
$adminUrl=[Uri]$match.Groups[1].Value
if($adminUrl.Host -ne '127.0.0.1' -or $adminUrl.Port -ne 54329 -or $adminUrl.AbsolutePath -ne '/postgres' -or $adminUrl.UserInfo.Length -eq 0) { throw 'Approved admin connection did not match the loopback postgres contract.' }
$base=[IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd([IO.Path]::DirectorySeparatorChar); $parent=[IO.Path]::Combine($base,'DivaaBeauty'); $root=[IO.Path]::Combine($parent,'secrets'); $configPath=[IO.Path]::Combine($root,'review-instance.dpapi'); $stagePath=[IO.Path]::Combine($root,'review-instance-stage.json')
if(-not (Test-Path -LiteralPath $parent -PathType Container)) { throw 'Expected LOCALAPPDATA\DivaaBeauty parent is absent.' }; Assert-NoReparseComponents $parent
if($Resume) {
  if(-not (Test-Path -LiteralPath $root -PathType Container) -or -not (Test-Path -LiteralPath $configPath -PathType Leaf) -or -not (Test-Path -LiteralPath $stagePath -PathType Leaf)) { throw 'Resume requires the existing protected config and stage record.' }
  Assert-NoReparseComponents $root
  $stage=Get-Content -LiteralPath $stagePath -Raw | ConvertFrom-Json
  if($stage.stage -ne 'protected-config-created' -or $stage.database -notmatch '^divaa_synthetic_\d{14}_[a-f0-9]{8}$' -or $stage.database -eq 'divaa_synthetic_1792308261799') { throw 'Existing stage is not the expected resumable state.' }
  $sealed=[IO.File]::ReadAllBytes($configPath); $plain=$null; $cfg=$null
  try { $plain=[Security.Cryptography.ProtectedData]::Unprotect($sealed,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); $cfg=[Text.Encoding]::UTF8.GetString($plain)|ConvertFrom-Json } catch { throw 'Existing protected configuration could not be opened in this user context.' }
  $dbName=[string]$cfg.database; $role=[string]$cfg.role; $dbUrl=[string]$cfg.databaseUrl
  $uri=[Uri]$dbUrl
  if($dbName -ne $stage.database -or $role -ne ($dbName -replace '^divaa_synthetic_','divaa_review_') -or $uri.Host -ne '127.0.0.1' -or $uri.Port -ne 54329 -or $uri.AbsolutePath.TrimStart('/') -ne $dbName -or $dbName -eq 'divaa_synthetic_1792308261799' -or $cfg.encryptionKey.Length -ne 44 -or $cfg.adminPassword.Length -lt 14) { throw 'Existing config/stage/database binding validation failed.' }
  $userInfo=$uri.UserInfo.Split(':',2); if($userInfo.Count -ne 2 -or [Uri]::UnescapeDataString($userInfo[0]) -ne $role) { throw 'Saved database URL role binding failed.' }; $dbPassword=[Uri]::UnescapeDataString($userInfo[1])
  $key=[Convert]::FromBase64String($cfg.encryptionKey); $staffPassword=[string]$cfg.adminPassword
  if($key.Length -ne 32) { throw 'Existing protected key length is invalid.' }
  $identity=[Security.Principal.WindowsIdentity]::GetCurrent().Name; $acl=Get-Acl -LiteralPath $configPath
  $allowed=@($acl.Access | Where-Object { $_.AccessControlType -eq [Security.AccessControl.AccessControlType]::Allow -and -not $_.IsInherited } | ForEach-Object { $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value } | Sort-Object -Unique); $expected=@($identity,'SYSTEM' | ForEach-Object { ([Security.Principal.NTAccount]$_).Translate([Security.Principal.SecurityIdentifier]).Value } | Sort-Object -Unique)
  if(-not $acl.AreAccessRulesProtected -or ($allowed -join ',') -ne ($expected -join ',')) { throw 'Existing protected configuration ACL allowlist failed verification.' }
} else {
if(Test-Path -LiteralPath $root) { throw 'Secrets directory already exists; use -Resume only for the recorded protected-config-created stage.' }
$instance=[DateTime]::UtcNow.ToString('yyyyMMddHHmmss')+'_'+[Guid]::NewGuid().ToString('N').Substring(0,8)
$dbName='divaa_synthetic_'+$instance; $role='divaa_review_'+$instance; if($dbName -eq 'divaa_synthetic_1792308261799') { throw 'Refusing protected original database.' }
$pwBytes=[byte[]]::new(32); $key=[byte[]]::new(32); $staffBytes=[byte[]]::new(32); $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($pwBytes); $rng.GetBytes($key); $rng.GetBytes($staffBytes) } finally { $rng.Dispose() }
$dbPassword=[Convert]::ToBase64String($pwBytes); $staffPassword=[Convert]::ToBase64String($staffBytes)
if(-not ('DivaaBeauty.ReviewKey.NativeDirectory' -as [type])) { Add-Type -TypeDefinition @'
using System; using System.ComponentModel; using System.Runtime.InteropServices; using System.Security.AccessControl;
namespace DivaaBeauty.ReviewKey { public static class NativeDirectory { [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] private struct SA { public int nLength; public IntPtr lpSecurityDescriptor; public bool bInheritHandle; } [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] private static extern bool CreateDirectoryW(string p,ref SA a); public static void CreateExclusive(string p,DirectorySecurity s) { byte[] d=s.GetSecurityDescriptorBinaryForm(); GCHandle h=GCHandle.Alloc(d,GCHandleType.Pinned); try { var a=new SA{nLength=Marshal.SizeOf(typeof(SA)),lpSecurityDescriptor=h.AddrOfPinnedObject(),bInheritHandle=false}; if(!CreateDirectoryW(p,ref a)) throw new Win32Exception(Marshal.GetLastWin32Error()); } finally { h.Free(); Array.Clear(d,0,d.Length); } } } }
'@ }
$identity=[Security.Principal.WindowsIdentity]::GetCurrent().Name; $dirAcl=[Security.AccessControl.DirectorySecurity]::new(); $dirAcl.SetAccessRuleProtection($true,$false); $inherit=[Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [Security.AccessControl.InheritanceFlags]::ObjectInherit
foreach($principal in @($identity,'SYSTEM')) { $dirAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($principal,[Security.AccessControl.FileSystemRights]::FullControl,$inherit,[Security.AccessControl.PropagationFlags]::None,[Security.AccessControl.AccessControlType]::Allow)) }
[DivaaBeauty.ReviewKey.NativeDirectory]::CreateExclusive($root,$dirAcl); Assert-NoReparseComponents $root
Save-Stage 'directory-created'
$dbUrl="postgresql://${role}:$([Uri]::EscapeDataString($dbPassword))@127.0.0.1:54329/$dbName"
$configJson=@{databaseUrl=$dbUrl;database=$dbName;role=$role;adminPassword=$staffPassword;encryptionKey=[Convert]::ToBase64String($key)}|ConvertTo-Json -Compress
$plain=[Text.Encoding]::UTF8.GetBytes($configJson); $sealed=[Security.Cryptography.ProtectedData]::Protect($plain,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
$fileStream=[IO.File]::Open($configPath,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None); try{$fileStream.Write($sealed,0,$sealed.Length);$fileStream.Flush($true)}finally{$fileStream.Dispose()}
$fileAcl=[Security.AccessControl.FileSecurity]::new();$fileAcl.SetAccessRuleProtection($true,$false);foreach($principal in @($identity,'SYSTEM')){$fileAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($principal,[Security.AccessControl.FileSystemRights]::FullControl,[Security.AccessControl.AccessControlType]::Allow))};Set-Acl -LiteralPath $configPath -AclObject $fileAcl
Save-Stage 'protected-config-created'
}
try {
  $module=Join-Path (Get-Location) 'node_modules\postgres'; if(-not (Test-Path -LiteralPath $module)) { throw 'Workspace postgres package is unavailable.' }
  if($Resume) { $provision=@'
import postgres from 'postgres';
const admin=process.env.DIVAA_ADMIN_URL,db=process.env.DIVAA_DB,role=process.env.DIVAA_ROLE,pw=process.env.DIVAA_DB_PASSWORD;
const url=new URL(admin); if(url.hostname!=='127.0.0.1'||url.port!=='54329'||url.pathname!=='/postgres'||db==='divaa_synthetic_1792308261799') throw Error('Admin/database guard failed');
const sql=postgres(admin,{max:1}); try { const databases=await sql`select 1 from pg_database where datname=${db}`; const roles=await sql`select 1 from pg_roles where rolname=${role}`; if(databases.length||roles.length) throw Object.assign(Error(),{code:'RECORDED_OBJECT_PRESENT'}); await sql.unsafe(`CREATE ROLE "${role}" LOGIN PASSWORD '${pw}' NOSUPERUSER NOCREATEDB NOCREATEROLE`); await sql.unsafe(`CREATE DATABASE "${db}" OWNER "${role}"`); process.stdout.write(JSON.stringify({ok:true})+'\n'); } catch(e) { process.stdout.write(JSON.stringify({ok:false,type:e?.name||'Error',code:typeof e?.code==='string'?e.code:'UNCLASSIFIED'})+'\n'); process.exitCode=1; } finally { await sql.end(); }
'@ } else { $provision=@'
import postgres from 'postgres';
const admin=process.env.DIVAA_ADMIN_URL,db=process.env.DIVAA_DB,role=process.env.DIVAA_ROLE,pw=process.env.DIVAA_DB_PASSWORD;
const url=new URL(admin); if(url.hostname!=='127.0.0.1'||url.port!=='54329'||url.pathname!=='/postgres'||db==='divaa_synthetic_1792308261799') throw Error('Admin/database guard failed');
const sql=postgres(admin,{max:1}); try { const exists=await sql`select 1 from pg_database where datname=${db}`; if(exists.length) throw Error('Fresh database name already exists'); await sql.unsafe(`CREATE ROLE "${role}" LOGIN PASSWORD '${pw}' NOSUPERUSER NOCREATEDB NOCREATEROLE`); await sql.unsafe(`CREATE DATABASE "${db}" OWNER "${role}"`); } finally { await sql.end(); }
'@ }
  $env:DIVAA_ADMIN_URL=$adminUrl.AbsoluteUri; $env:DIVAA_DB=$dbName; $env:DIVAA_ROLE=$role; $env:DIVAA_DB_PASSWORD=$dbPassword
  $nodeResult=$provision | node --input-type=module - 2>$null; $nodeExit=$LASTEXITCODE
  if($nodeExit -ne 0) { $diagnostic='unavailable'; try { $parsed=$nodeResult | ConvertFrom-Json; $diagnostic=('{0}/{1}' -f $parsed.type,$parsed.code) } catch {}; throw "Fresh database provisioning/resume failed ($diagnostic); created artifacts are retained." }; Save-Stage 'database-created'
  $env:BOOKING_SYNTHETIC_DATABASE_URL=$dbUrl; $env:DATABASE_URL=$dbUrl; $env:BOOKING_ALLOW_SYNTHETIC='true'; $env:BOOKING_CALENDAR_MODE='mock'; $env:BOOKING_ENCRYPTION_KEY=[Convert]::ToBase64String($key); $env:BOOKING_ADMIN_PASSWORD=$staffPassword; $env:BOOKING_ADMIN_EMAIL='staff@example.test'; $env:BOOKING_EMAIL_ENABLED='false'
  & node.exe 'scripts/booking-setup.mjs' --synthetic --seed --admin *> $null; if($LASTEXITCODE -ne 0) { throw 'Fresh synthetic schema/setup failed; created artifacts are retained.' }; Save-Stage 'schema-seeded-admin-created'
  # Check key decryptability and effective protected ACL without printing values.
  $opened=[Security.Cryptography.ProtectedData]::Unprotect($sealed,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); $decryptable=($opened.Length -gt 0); [Array]::Clear($opened,0,$opened.Length)
  $acl=Get-Acl -LiteralPath $configPath; $allowed=@($acl.Access | Where-Object { $_.AccessControlType -eq [Security.AccessControl.AccessControlType]::Allow -and -not $_.IsInherited } | ForEach-Object { $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value } | Sort-Object -Unique); $expected=@($identity,'SYSTEM' | ForEach-Object { ([Security.Principal.NTAccount]$_).Translate([Security.Principal.SecurityIdentifier]).Value } | Sort-Object -Unique)
  if(-not $acl.AreAccessRulesProtected -or ($allowed -join ',') -ne ($expected -join ',')) { throw 'Protected configuration ACL allowlist failed verification.' }
  Write-Output (([ordered]@{database=$dbName;role=$role;configPath=$configPath;aclAllowlistVerified=$true;keyDecryptable=$decryptable;schemaSeeded=$true;gmailEnabled=$false;startCommand='powershell.exe -NoProfile -File .\scripts\local-review.ps1'}|ConvertTo-Json -Compress))
  Save-Stage 'ready'
} catch { throw 'Fresh-only provisioning/resume failed. Preserve database, role, and protected artifacts for reconciliation; no cleanup was attempted.' }
finally { foreach($n in @('DIVAA_ADMIN_URL','DIVAA_DB','DIVAA_ROLE','DIVAA_DB_PASSWORD','BOOKING_SYNTHETIC_DATABASE_URL','DATABASE_URL','BOOKING_ENCRYPTION_KEY','BOOKING_ADMIN_PASSWORD')) { Remove-Item "Env:$n" -ErrorAction SilentlyContinue }; foreach($b in @($pwBytes,$key,$staffBytes,$plain,$sealed)) { if($b) { [Array]::Clear($b,0,$b.Length) } }; Remove-Variable adminUrl,configJson,dbUrl,dbPassword,staffPassword -ErrorAction SilentlyContinue }
