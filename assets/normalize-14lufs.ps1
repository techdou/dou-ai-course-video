# 成片响度归一化脚本（豆懂 AI 课程模板配套）
# 用途：把 ChatCut 导出的成片统一到平台标准响度（默认 -14 LUFS）。
# 方法：提取音频 pcm_f32le → 迭代「volume 增益 + alimiter 限幅」，
#       每轮用 ebur128 实测偏差收敛到 ±0.2 LUFS（通常 4-6 轮）；
#       视频流 -c:v copy 不重编码，音频重编码 AAC 192k + faststart。
# 为什么不用 loudnorm：口播源响度常低至 -20~-35 LUFS，一次提升 6~21dB
#       会被 loudnorm 限幅吃掉约 1.6dB 平均能量，实测只能到 -15.6 左右；
#       迭代法每次只补少量增益，限幅损失递减，最终可达 -14.2±0.1。
# 用法：.\normalize-14lufs.ps1 -Files a.mp4,b.mp4 [-TargetLUFS -14]
#       输出为同目录 <原名>-<目标值>LUFS.mp4；目标值取整用于文件名。
param(
    [Parameter(Mandatory = $true)]
    [string[]]$Files,
    [double]$TargetLUFS = -14.0
)

$TargetI = $TargetLUFS
$TargetTolerance = 0.2
$MaxRounds = 8
$TargetLabel = [Math]::Round($TargetLUFS)

function Get-Metrics([string]$File) {
    $out = & ffmpeg -hide_banner -nostats -i $File -af ebur128=peak=true -f null - 2>&1 | Out-String
    $m = [regex]::Match($out, 'Integrated loudness:[\s\S]{0,160}?I:\s+(-?[\d.]+) LUFS[\s\S]{0,160}?LRA:\s+(-?[\d.]+) LU')
    $p = [regex]::Match($out, 'Peak:\s+(-?[\d.]+) dBFS')
    if (-not $m.Success) { throw "Cannot parse ebur128 metrics for $File" }
    return [pscustomobject]@{
        I   = [double]$m.Groups[1].Value
        LRA = [double]$m.Groups[2].Value
        TP  = if ($p.Success) { [double]$p.Groups[1].Value } else { $null }
    }
}

foreach ($raw in $Files) {
    $raw = (Resolve-Path $raw).Path
    $base = [System.IO.Path]::GetFileNameWithoutExtension($raw)
    $out = Join-Path (Split-Path $raw) ($base + '-' + $TargetLabel + 'LUFS.mp4')
    $workDir = Join-Path (Split-Path $raw) ('_work-' + $base)
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
    try {
        $wav0 = Join-Path $workDir 'a0.wav'
        & ffmpeg -hide_banner -y -i $raw -map 0:a -c:a pcm_f32le $wav0 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed extracting audio (exit $LASTEXITCODE)" }

        $cur = $wav0
        $src = Get-Metrics $cur
        $rounds = 0
        for ($i = 1; $i -le $MaxRounds; $i++) {
            $mt = Get-Metrics $cur
            $rounds = $i
            $err = $mt.I - $TargetI
            if ([Math]::Abs($err) -le $TargetTolerance) { break }
            $next = Join-Path $workDir ("a$i.wav")
            $af = 'volume=' + ('{0:F2}' -f (-$err)) + 'dB,alimiter=limit=-2.5dB:level=false:attack=5:release=100'
            & ffmpeg -hide_banner -y -i $cur -af $af -c:a pcm_f32le $next 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed in loudness iteration (exit $LASTEXITCODE)" }
            $cur = $next
        }

        $final = Get-Metrics $cur
        & ffmpeg -hide_banner -y -i $raw -i $cur -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart $out 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed muxing output (exit $LASTEXITCODE)" }
        Write-Output ("{0} | sourceI={1} LUFS | finalI={2} LUFS | LRA={3} | TP={4} | rounds={5} | size={6}MB" -f $base, $src.I, $final.I, $final.LRA, $final.TP, $rounds, [Math]::Round((Get-Item $out).Length / 1MB, 1))
    }
    finally {
        if (Test-Path $workDir) { Remove-Item -Recurse -Force $workDir }
    }
}
