# GProA EDGE - Windows PowerShell Deployment Helper
# Run this script locally to verify everything is ready for Render deployment

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  GProA EDGE - Pre-Deployment Checker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Colors
function Write-OK($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "✗ $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }

# Check 1: Git repository
Write-Host "1. Git Repository Status" -ForegroundColor Blue
if (Test-Path ".git") {
    Write-OK "Git repository exists"
    $branch = git branch --show-current
    Write-Host "   Current branch: $branch"
    
    $status = git status --porcelain
    if ($status) {
        Write-Warn "Uncommitted changes detected:"
        $status | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-OK "Working tree clean"
    }
} else {
    Write-Fail "No git repository found"
}

# Check 2: Required files
Write-Host ""
Write-Host "2. Required Files" -ForegroundColor Blue

$requiredFiles = @(
    "backend/server.py",
    "backend/requirements.txt",
    "backend/edge_rules.py",
    "backend/edge_processors.py",
    "frontend/package.json",
    "frontend/src/App.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-OK "$file exists"
    } else {
        Write-Fail "$file missing!"
    }
}

# Check 3: Environment example
Write-Host ""
Write-Host "3. Environment Configuration" -ForegroundColor Blue

if (Test-Path ".env.example") {
    Write-OK ".env.example exists"
} else {
    Write-Warn ".env.example not found. Creating template..."
    @"
# Environment Variables for GProA EDGE
# Copy to .env and fill in actual values

MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
EMERGENT_LLM_KEY=sk-your-key-here
DB_NAME=gproa_edge
CORS_ORIGINS=*
"@ | Out-File -FilePath ".env.example" -Encoding UTF8
    Write-OK ".env.example created"
}

# Check 4: Node and Python versions (local)
Write-Host ""
Write-Host "4. Local Development Tools" -ForegroundColor Blue

try {
    $nodeVersion = node --version
    Write-OK "Node.js: $nodeVersion"
} catch {
    Write-Fail "Node.js not installed"
}

try {
    $pythonVersion = python --version
    Write-OK "Python: $pythonVersion"
} catch {
    Write-Fail "Python not installed"
}

# Check 5: Git remote
Write-Host ""
Write-Host "5. GitHub Remote" -ForegroundColor Blue
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-OK "Remote origin: $remote"
    if ($remote -like "*github.com*") {
        Write-OK "Repository is on GitHub"
    } else {
        Write-Warn "Remote is not GitHub: $remote"
    }
} else {
    Write-Fail "No remote origin configured"
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Ready Checklist:" -ForegroundColor Cyan
Write-Host "  [ ] All files committed to git"
Write-Host "  [ ] Repository pushed to GitHub"
Write-Host "  [ ] MongoDB Atlas cluster created"
Write-Host "  [ ] Emergent API key obtained"
Write-Host "  [ ] .env created (for local testing)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create Render backend service" -ForegroundColor White
Write-Host "2. Create Render frontend service" -ForegroundColor White
Write-Host "3. Test deployment" -ForegroundColor White
Write-Host ""
Write-Host "See RENDER_STEP_BY_STEP.md for detailed guide" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
