# Stop the TripL backend and frontend without touching unrelated processes.
#
# Two traps this avoids:
#   1. "taskkill /F /IM python.exe" kills EVERY Python process on the machine,
#      including unrelated work, which makes crashes look random.
#   2. uvicorn --reload runs three processes: the reloader parent, a reloader
#      child, and the real worker. The worker is started via multiprocessing
#      spawn, so its command line contains no "uvicorn" and no project path -
#      killing only the first two leaves an orphan still holding the port.
# So: match on command line, then also take each match's children.

$all = Get-CimInstance Win32_Process

$ours = $all | Where-Object {
    ($_.Name -eq 'python.exe' -and $_.CommandLine -match 'uvicorn\s+app\.main:app') -or
    ($_.Name -eq 'node.exe'   -and $_.CommandLine -match 'vite')
}

$ids = @($ours | Select-Object -ExpandProperty ProcessId)

# An orphaned uvicorn worker keeps serving even after its reloader parent is
# gone, and Windows then reports the DEAD parent as the port owner. Such a
# worker is a bare "multiprocessing spawn_main ... --multiprocessing-fork"
# python process, so match that shape too.
$orphans = $all | Where-Object {
    $_.Name -eq 'python.exe' -and
    $_.CommandLine -match 'multiprocessing\.spawn' -and
    $_.CommandLine -match '--multiprocessing-fork'
} | Select-Object -ExpandProperty ProcessId

if ($ids.Count -eq 0 -and $orphans.Count -eq 0) {
    Write-Host "  nothing was running"
    exit 0
}

$kids = $all |
    Where-Object { $ids -contains $_.ParentProcessId } |
    Select-Object -ExpandProperty ProcessId

$targets = @($ids + $kids + $orphans) | Sort-Object -Unique

foreach ($id in $targets) {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$id" -ErrorAction SilentlyContinue
    $label = if ($p) { $p.Name } else { 'process' }
    Write-Host "  stopping $label pid $id"
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
}
