Add-Type -Assembly "System.IO.Compression.FileSystem" ;
$PastaTfs="tfs-onpremise-ntlm\\bin\\Release\\"
$PastaClient="docs\\dist\\"

Copy-Item $PastaClient "$Env:Temp\\dash\\client" -Recurse
Copy-Item $PastaTfs "$Env:Temp\\dash\\tfs" -Recurse

$arquivo = "$Env:Temp\\dash\\tfs\\tfs-onpremise-ntlm.exe.config"
[xml]$xmlDoc = Get-Content $arquivo
$node = $xmlDoc.SelectSingleNode("//add[@key='static-files']")
$node.Attributes["value"].Value = "../client"

$xmlDoc.Save($arquivo);

if([System.IO.File]::Exists("release.zip")){
    Remove-Item -Recurse -Force "release.zip"
}
[System.IO.Compression.ZipFile]::CreateFromDirectory("$Env:Temp\\dash", "release.zip") 

Remove-Item -Recurse -Force "$Env:Temp\\dash"