#requires -version 5.0
###############################################################################
# Download All GitHub Repositories
# Works on: Windows (PowerShell 5.0+), Mac, Linux
#
# Usage:
#   .\download_all_repos.ps1 -Username asif530
#   .\download_all_repos.ps1 -Username asif530 -Token ghp_xxxxx
#   .\download_all_repos.ps1 -Username asif530 -UseSsh
#   .\download_all_repos.ps1 -Username asif530 -OutputDir my_repos
#
# Requirements:
#   - PowerShell 5.0+ (Windows 10+ or download)
#   - git installed and in PATH
#   - GitHub account
#
# Authentication:
#   1. Token: Generate at https://github.com/settings/tokens
#   2. SSH: Set up SSH key at https://github.com/settings/keys
#   3. HTTPS: Use GitHub username + PAT as password
#
# Note: On first run, you may need to allow script execution:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
###############################################################################

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,

    [Parameter(Mandatory=$false)]
    [string]$Token,

    [Parameter(Mandatory=$false)]
    [switch]$UseSsh,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "github_repos"
)

# Script configuration
$API_URL = "https://api.github.com"
$ReposDownloaded = 0
$ReposFailed = 0
$ReposSkipped = 0

###############################################################################
# Helper Functions
###############################################################################

function Write-Header {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor White
    Write-Host "GitHub Repositories Downloader".PadRight(60).Substring(0, 60) -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor White
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Status {
    param([string]$Message)
    Write-Host "📥 $Message" -NoNewline -ForegroundColor Cyan
}

###############################################################################
# Validation Functions
###############################################################################

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check git
    try {
        $null = & git --version 2>&1
        Write-Success "Git is installed"
    }
    catch {
        Write-Error-Custom "Git is not installed or not in PATH"
        Write-Host "Download from: https://git-scm.com/download/win"
        return $false
    }

    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Error-Custom "PowerShell 5.0+ is required (you have $($PSVersionTable.PSVersion))"
        return $false
    }
    Write-Success "PowerShell 5.0+ is installed"

    return $true
}

function New-OutputDirectory {
    if (-not (Test-Path $OutputDir)) {
        $null = New-Item -ItemType Directory -Path $OutputDir -Force
        Write-Info "Created output directory: $OutputDir"
    }
    else {
        Write-Info "Output directory: $OutputDir"
    }

    $script:OutputDir = (Resolve-Path $OutputDir).Path
}

###############################################################################
# GitHub API Functions
###############################################################################

function Get-GitHubRepositories {
    Write-Info "Fetching repositories for user: $Username"

    $repositories = @()
    $page = 1
    $perPage = 100

    while ($true) {
        $url = "$API_URL/users/$Username/repos?per_page=$perPage&page=$page&sort=updated"

        try {
            Write-Status "Fetching page $page..."

            $headers = @{}
            if ($Token) {
                $headers["Authorization"] = "token $Token"
            }

            $params = @{
                Uri     = $url
                Method  = "Get"
                Headers = $headers
            }

            $response = Invoke-RestMethod @params -ErrorAction Stop

            if ($null -eq $response -or $response.Count -eq 0) {
                break
            }

            $repositories += $response
            $page++

            # Clear the status line
            Write-Host ""
        }
        catch [Microsoft.PowerShell.Commands.HttpRequestException] {
            $errorMsg = $_.Exception.Message
            Write-Error-Custom "API Error: $errorMsg"

            if ($errorMsg -contains "401") {
                Write-Error-Custom "Invalid token or permission denied"
            }
            elseif ($errorMsg -contains "404") {
                Write-Error-Custom "User '$Username' not found"
            }

            return $null
        }
        catch {
            Write-Error-Custom "Error fetching repositories: $($_.Exception.Message)"
            return $null
        }
    }

    Write-Success "Found $($repositories.Count) repositories"
    return $repositories
}

###############################################################################
# Cloning Functions
###############################################################################

function Clone-Repository {
    param(
        [string]$RepoName,
        [string]$RepoUrl
    )

    $repoPath = Join-Path $OutputDir $RepoName

    # Skip if already exists
    if (Test-Path $repoPath) {
        Write-Warning-Custom "Skipping $RepoName (already exists)"
        $script:ReposSkipped++
        return $true
    }

    try {
        Write-Status "Cloning $RepoName..."

        # Clone with timeout (PowerShell doesn't have built-in timeout for git)
        $process = Start-Process -FilePath git -ArgumentList "clone", "--quiet", $RepoUrl, $repoPath -NoNewWindow -PassThru -ErrorAction Stop

        # Wait for process with timeout (120 seconds)
        $process.WaitForExit(120000)

        if ($process.ExitCode -eq 0) {
            Write-Host ""  # New line
            Write-Success "Cloned $RepoName"
            $script:ReposDownloaded++
            return $true
        }
        else {
            Write-Host ""  # New line
            Write-Error-Custom "Failed to clone $RepoName (exit code: $($process.ExitCode))"
            $script:ReposFailed++
            return $false
        }
    }
    catch {
        Write-Host ""  # New line
        Write-Error-Custom "Failed to clone $RepoName : $($_.Exception.Message)"
        $script:ReposFailed++
        return $false
    }
}

###############################################################################
# Main Logic
###############################################################################

function Start-Download {
    Write-Header

    # Test prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }

    # Get authentication token if needed
    if (-not $UseSsh -and -not $Token) {
        Write-Warning-Custom "No token provided"
        $tokenInput = Read-Host "Enter GitHub Personal Access Token (or press Enter to skip)"
        if ($tokenInput) {
            $Token = $tokenInput
        }
    }

    # Create output directory
    New-OutputDirectory

    # Fetch repositories
    $repositories = Get-GitHubRepositories
    if ($null -eq $repositories) {
        exit 1
    }

    # Download repositories
    Write-Info "Starting downloads...`n"

    $repoCount = $repositories.Count
    $current = 1

    foreach ($repo in $repositories) {
        $repoName = $repo.name
        $httpsUrl = $repo.clone_url
        $sshUrl = $repo.ssh_url

        # Choose clone URL based on auth method
        if ($UseSsh) {
            $cloneUrl = $sshUrl
        }
        else {
            if ($Token) {
                # Insert token into HTTPS URL
                $cloneUrl = $httpsUrl -replace "https://", "https://$Token@"
            }
            else {
                $cloneUrl = $httpsUrl
            }
        }

        Write-Host "[$current/$repoCount] " -NoNewline -ForegroundColor Cyan
        Clone-Repository $repoName $cloneUrl

        $current++
    }

    # Print summary
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor White
    Write-Host "Download Complete!".PadRight(60).Substring(0, 60) -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor White
    Write-Success "Successfully downloaded: $ReposDownloaded"
    Write-Error-Custom "Failed: $ReposFailed"
    Write-Warning-Custom "Skipped: $ReposSkipped"
    Write-Info "Location: $OutputDir"
    Write-Host "============================================================" -ForegroundColor White
    Write-Host ""
}

# Execute
Start-Download
