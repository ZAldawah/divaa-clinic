<# Owner-operated setup for the local synthetic review encryption key only. #>
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
function Assert-NoReparseComponents([string] $Path) {
  $current=[IO.DirectoryInfo]::new($Path)
  while($null -ne $current) { if(Test-Path -LiteralPath $current.FullName) { $item=Get-Item -LiteralPath $current.FullName -Force; if(($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Protected path contains a reparse point.' } }; $current=$current.Parent }
}
$base=$env:LOCALAPPDATA
if([string]::IsNullOrWhiteSpace($base)) { throw 'LOCALAPPDATA is unavailable.' }
$base=[IO.Path]::GetFullPath($base).TrimEnd([IO.Path]::DirectorySeparatorChar)
$parent=[IO.Path]::Combine($base,'DivaaBeauty'); $root=[IO.Path]::Combine($parent,'secrets'); $file=[IO.Path]::Combine($root,'review-key.dpapi')
if(-not [string]::Equals([IO.Path]::GetFullPath($file),$file,[StringComparison]::OrdinalIgnoreCase) -or -not $root.StartsWith($base+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Refusing an unexpected protected path.' }
if(-not (Test-Path -LiteralPath $base -PathType Container) -or -not (Test-Path -LiteralPath $parent -PathType Container)) { throw 'LOCALAPPDATA/DivaaBeauty must already exist.' }
Assert-NoReparseComponents $parent
if(Test-Path -LiteralPath $root) { throw 'Secrets directory already exists; no overwrite or ACL modification is permitted.' }
if(Test-Path -LiteralPath $file) { throw 'Key file already exists; no overwrite is permitted.' }
if(-not ('DivaaBeauty.ReviewKey.NativeDirectory' -as [type])) {
Add-Type -TypeDefinition @'
using System; using System.ComponentModel; using System.Runtime.InteropServices; using System.Security.AccessControl;
namespace DivaaBeauty.ReviewKey {
 public static class NativeDirectory {
  [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] private struct SECURITY_ATTRIBUTES { public int nLength; public IntPtr lpSecurityDescriptor; public bool bInheritHandle; }
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] private static extern bool CreateDirectoryW(string path,ref SECURITY_ATTRIBUTES attributes);
  public static void CreateExclusive(string path,DirectorySecurity security) { byte[] descriptor=security.GetSecurityDescriptorBinaryForm(); GCHandle pin=GCHandle.Alloc(descriptor,GCHandleType.Pinned); try { var a=new SECURITY_ATTRIBUTES{nLength=Marshal.SizeOf(typeof(SECURITY_ATTRIBUTES)),lpSecurityDescriptor=pin.AddrOfPinnedObject(),bInheritHandle=false}; if(!CreateDirectoryW(path,ref a)) throw new Win32Exception(Marshal.GetLastWin32Error()); } finally { pin.Free(); Array.Clear(descriptor,0,descriptor.Length); } }
 }
}
'@
}
$key=$null; $plain=$null; $protected=$null
try {
 Assert-NoReparseComponents $parent
 if(Test-Path -LiteralPath $root) { throw 'Secrets directory appeared concurrently.' }
 $identity=[Security.Principal.WindowsIdentity]::GetCurrent().Name
 $acl=[Security.AccessControl.DirectorySecurity]::new(); $acl.SetAccessRuleProtection($true,$false)
 $inherit=[Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [Security.AccessControl.InheritanceFlags]::ObjectInherit
 foreach($principal in @($identity,'SYSTEM')) { $rule=[Security.AccessControl.FileSystemAccessRule]::new($principal,[Security.AccessControl.FileSystemRights]::FullControl,$inherit,[Security.AccessControl.PropagationFlags]::None,[Security.AccessControl.AccessControlType]::Allow); $acl.AddAccessRule($rule) }
 [DivaaBeauty.ReviewKey.NativeDirectory]::CreateExclusive($root,$acl)
 Assert-NoReparseComponents $root
 $key=[byte[]]::new(32); [Security.Cryptography.RandomNumberGenerator]::Fill($key)
 $plain=[Text.Encoding]::UTF8.GetBytes([Convert]::ToBase64String($key))
 $protected=[Security.Cryptography.ProtectedData]::Protect($plain,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 $stream=[IO.File]::Open($file,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try { $stream.Write($protected,0,$protected.Length); $stream.Flush($true) } finally { $stream.Dispose() }
 $fileAcl=[Security.AccessControl.FileSecurity]::new(); $fileAcl.SetAccessRuleProtection($true,$false)
 foreach($principal in @($identity,'SYSTEM')) { $rule=[Security.AccessControl.FileSystemAccessRule]::new($principal,[Security.AccessControl.FileSystemRights]::FullControl,[Security.AccessControl.AccessControlType]::Allow); $fileAcl.AddAccessRule($rule) }
 Set-Acl -LiteralPath $file -AclObject $fileAcl
 Write-Output "Protected local synthetic review key created: $file"
} catch { throw 'Protected review-key preparation failed. No secret value was written to output; partial encrypted artifacts are retained.' }
finally { if($key) { [Array]::Clear($key,0,$key.Length) }; if($plain) { [Array]::Clear($plain,0,$plain.Length) }; if($protected) { [Array]::Clear($protected,0,$protected.Length) } }
