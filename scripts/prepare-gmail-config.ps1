<#
Owner-operated local preparation helper. It does not grant OAuth, configure the
website, change its launcher, or enable delivery. Run interactively as the
Windows account that will own the protected file.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Assert-NoReparsePoint([string] $Path) {
    $item = Get-Item -LiteralPath $Path -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Refusing a reparse point in the protected path: $Path"
    }
}

function Assert-NoReparseComponents([string] $Path) {
    $current = [IO.DirectoryInfo]::new($Path)
    while ($null -ne $current) {
        if (Test-Path -LiteralPath $current.FullName) {
            Assert-NoReparsePoint $current.FullName
        }
        $current = $current.Parent
    }
}

if ([string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
    throw 'LOCALAPPDATA is unavailable for this user.'
}

$localAppData = [IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd([IO.Path]::DirectorySeparatorChar)
$expectedParent = [IO.Path]::Combine($localAppData, 'DivaaBeauty')
$secretRoot = [IO.Path]::Combine($expectedParent, 'secrets')
$secretFile = [IO.Path]::Combine($secretRoot, 'gmail-config.dpapi')
if (-not [string]::Equals([IO.Path]::GetFullPath($secretRoot), $secretRoot, [StringComparison]::OrdinalIgnoreCase) -or
    -not $secretRoot.StartsWith($localAppData + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Resolved secret path is outside the expected LOCALAPPDATA/DivaaBeauty/secrets directory.'
}

# Refuse unexpected existing components; do not change their ACLs or follow links.
if (-not (Test-Path -LiteralPath $localAppData -PathType Container)) {
    throw 'LOCALAPPDATA directory does not exist.'
}
Assert-NoReparseComponents $localAppData
if (Test-Path -LiteralPath $expectedParent) {
    if (-not (Test-Path -LiteralPath $expectedParent -PathType Container)) { throw 'DivaaBeauty path is not a directory.' }
    Assert-NoReparsePoint $expectedParent
}
if (Test-Path -LiteralPath $secretRoot) {
    if (-not (Test-Path -LiteralPath $secretRoot -PathType Container)) { throw 'Secrets path is not a directory.' }
    Assert-NoReparsePoint $secretRoot
    throw 'The secrets directory already exists. Review it manually; this helper will not alter an existing directory or its ACLs.'
}
if (Test-Path -LiteralPath $secretFile) {
    throw 'A Gmail config file already exists. No overwrite is permitted by this helper.'
}

$clientId = Read-Host 'Google OAuth client ID (masked input)' -AsSecureString
$clientSecret = Read-Host 'Google OAuth client secret (masked input)' -AsSecureString
$sender = Read-Host 'Approved Gmail sender address'
if ([string]::IsNullOrWhiteSpace($sender) -or $sender -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
    throw 'Sender must be a valid email address.'
}

$clientIdPtr = [IntPtr]::Zero
$clientSecretPtr = [IntPtr]::Zero
$plain = $null
$protected = $null
$createdDirectory = $false
$createdFile = $false
try {
    $clientIdPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientId)
    $clientSecretPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
    $clientIdText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($clientIdPtr)
    $clientSecretText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($clientSecretPtr)
    if ([string]::IsNullOrWhiteSpace($clientIdText) -or [string]::IsNullOrWhiteSpace($clientSecretText)) {
        throw 'OAuth client ID and secret are required.'
    }

    $payload = [ordered]@{
        version = 1
        provider = 'gmail'
        clientId = $clientIdText
        clientSecret = $clientSecretText
        sender = $sender.Trim()
        redirectUri = 'http://127.0.0.1:3119/api/admin/gmail/callback'
    } | ConvertTo-Json -Compress
    $plain = [Text.Encoding]::UTF8.GetBytes($payload)
    $protected = [Security.Cryptography.ProtectedData]::Protect(
        $plain, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)

    # Create only missing directories, one level at a time. Never mutate an
    # existing directory or broaden its ACL; reject races and reparse points.
    if (-not (Test-Path -LiteralPath $expectedParent -PathType Container)) {
        [void][IO.Directory]::CreateDirectory($expectedParent)
        $createdDirectory = $true
        Assert-NoReparsePoint $expectedParent
    }
    [void][IO.Directory]::CreateDirectory($secretRoot)
    $createdDirectory = $true
    Assert-NoReparsePoint $secretRoot

    $identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $acl = [Security.AccessControl.DirectorySecurity]::new()
    $acl.SetAccessRuleProtection($true, $false)
    $inherit = [Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [Security.AccessControl.InheritanceFlags]::ObjectInherit
    $propagate = [Security.AccessControl.PropagationFlags]::None
    $allow = [Security.AccessControl.AccessControlType]::Allow
    foreach ($principal in @($identity, 'SYSTEM')) {
        $rule = [Security.AccessControl.FileSystemAccessRule]::new($principal,
            [Security.AccessControl.FileSystemRights]::FullControl, $inherit, $propagate, $allow)
        $acl.AddAccessRule($rule)
    }
    Set-Acl -LiteralPath $secretRoot -AclObject $acl

    # CreateNew is atomic: a concurrent/existing file is never overwritten.
    $stream = [IO.File]::Open($secretFile, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    $createdFile = $true
    try {
        $stream.Write($protected, 0, $protected.Length)
        $stream.Flush($true)
    }
    finally { $stream.Dispose() }

    $fileAcl = Get-Acl -LiteralPath $secretFile
    $fileAcl.SetAccessRuleProtection($true, $false)
    foreach ($principal in @($identity, 'SYSTEM')) {
        $rule = [Security.AccessControl.FileSystemAccessRule]::new($principal,
            [Security.AccessControl.FileSystemRights]::FullControl, $allow)
        $fileAcl.AddAccessRule($rule)
    }
    Set-Acl -LiteralPath $secretFile -AclObject $fileAcl
    Write-Output "Protected Gmail configuration prepared for CurrentUser DPAPI at $secretFile. No OAuth grant or website configuration was performed."
}
catch {
    # Roll back only artifacts created by this invocation. Never remove an
    # existing user file or directory, even when setup fails.
    if ($createdFile -and (Test-Path -LiteralPath $secretFile -PathType Leaf)) {
        [IO.File]::Delete($secretFile)
    }
    if ($createdDirectory -and (Test-Path -LiteralPath $secretRoot -PathType Container) -and
        -not (Get-ChildItem -LiteralPath $secretRoot -Force | Select-Object -First 1)) {
        [IO.Directory]::Delete($secretRoot, $false)
    }
    throw 'Gmail configuration preparation failed. No secret values were written to output.'
}
finally {
    if ($plain) { [Array]::Clear($plain, 0, $plain.Length) }
    if ($protected) { [Array]::Clear($protected, 0, $protected.Length) }
    if ($clientIdPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($clientIdPtr) }
    if ($clientSecretPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($clientSecretPtr) }
    if ($clientId) { $clientId.Dispose() }
    if ($clientSecret) { $clientSecret.Dispose() }
    Remove-Variable clientIdText, clientSecretText, payload -ErrorAction SilentlyContinue
}
