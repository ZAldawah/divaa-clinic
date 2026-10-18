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

if (-not ('DivaaBeauty.GmailConfig.NativeDirectory' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security.AccessControl;

namespace DivaaBeauty.GmailConfig {
    public static class NativeDirectory {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct SECURITY_ATTRIBUTES {
            public int nLength;
            public IntPtr lpSecurityDescriptor;
            public bool bInheritHandle;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool CreateDirectoryW(string path, ref SECURITY_ATTRIBUTES attributes);

        public static void CreateExclusive(string path, DirectorySecurity security) {
            byte[] descriptor = security.GetSecurityDescriptorBinaryForm();
            GCHandle pinned = GCHandle.Alloc(descriptor, GCHandleType.Pinned);
            try {
                SECURITY_ATTRIBUTES attributes = new SECURITY_ATTRIBUTES();
                attributes.nLength = Marshal.SizeOf(typeof(SECURITY_ATTRIBUTES));
                attributes.lpSecurityDescriptor = pinned.AddrOfPinnedObject();
                attributes.bInheritHandle = false;
                if (!CreateDirectoryW(path, ref attributes))
                    throw new Win32Exception(Marshal.GetLastWin32Error());
            } finally {
                pinned.Free();
                Array.Clear(descriptor, 0, descriptor.Length);
            }
        }
    }
}
'@
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

    # Require the application parent to exist. Create only the secrets leaf
    # using native CreateDirectory, which fails if any entry already occupies
    # that name. Restrict its DACL in the creation call so there is no interval
    # with inherited permissions. Revalidate ancestry immediately beforehand.
    if (-not (Test-Path -LiteralPath $expectedParent -PathType Container)) {
        throw 'The DivaaBeauty parent directory must already exist; no directories were created.'
    }
    Assert-NoReparseComponents $localAppData
    Assert-NoReparsePoint $expectedParent
    if (Test-Path -LiteralPath $secretRoot) {
        throw 'The secrets directory already exists. No overwrite or ACL change is permitted.'
    }

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
    [DivaaBeauty.GmailConfig.NativeDirectory]::CreateExclusive($secretRoot, $acl)
    Assert-NoReparseComponents $secretRoot

    # CreateNew is atomic: a concurrent/existing file is never overwritten.
    $stream = [IO.File]::Open($secretFile, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
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
    # Never delete by path: a partial encrypted artifact is retained for
    # manual review, avoiding deletion of a substituted file or directory.
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
