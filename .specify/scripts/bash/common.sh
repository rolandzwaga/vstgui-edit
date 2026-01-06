#!/usr/bin/env bash
# Common bash functions for speckit scripts

# Get repository root
get_repo_root() {
    local root
    root=$(git rev-parse --show-toplevel 2>/dev/null)
    if [[ $? -eq 0 && -n "$root" ]]; then
        echo "$root"
        return 0
    fi
    
    # Fall back to script location for non-git repos
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "$(cd "$script_dir/../../.." && pwd)"
}

# Get current branch or feature name
get_current_branch() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [[ -n "$SPECIFY_FEATURE" ]]; then
        echo "$SPECIFY_FEATURE"
        return 0
    fi
    
    # Then check git if available
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [[ $? -eq 0 && -n "$branch" ]]; then
        echo "$branch"
        return 0
    fi
    
    # For non-git repos, try to find the latest feature directory
    local repo_root specs_dir
    repo_root=$(get_repo_root)
    specs_dir="$repo_root/specs"
    
    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0
        
        for dir in "$specs_dir"/*/; do
            if [[ -d "$dir" ]]; then
                local name
                name=$(basename "$dir")
                if [[ "$name" =~ ^([0-9]{3})- ]]; then
                    local num=$((10#${BASH_REMATCH[1]}))
                    if ((num > highest)); then
                        highest=$num
                        latest_feature="$name"
                    fi
                fi
            fi
        done
        
        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return 0
        fi
    fi
    
    # Final fallback
    echo "main"
}

# Check if git is available
test_has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
    return $?
}

# Validate feature branch naming
test_feature_branch() {
    local branch="$1"
    local has_git="${2:-true}"
    
    # For non-git repos, we can't enforce branch naming but still provide output
    if [[ "$has_git" != "true" ]]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi
    
    if [[ ! "$branch" =~ ^[0-9]{3}- ]]; then
        echo "ERROR: Not on a feature branch. Current branch: $branch"
        echo "Feature branches should be named like: 001-feature-name"
        return 1
    fi
    return 0
}

# Get feature directory path
get_feature_dir() {
    local repo_root="$1"
    local branch="$2"
    echo "$repo_root/specs/$branch"
}

# Get all feature paths as environment variables
# Usage: eval "$(get_feature_paths_env)"
get_feature_paths_env() {
    local repo_root current_branch has_git feature_dir
    repo_root=$(get_repo_root)
    current_branch=$(get_current_branch)
    
    if test_has_git; then
        has_git="true"
    else
        has_git="false"
    fi
    
    feature_dir=$(get_feature_dir "$repo_root" "$current_branch")
    
    cat <<EOF
REPO_ROOT="$repo_root"
CURRENT_BRANCH="$current_branch"
HAS_GIT="$has_git"
FEATURE_DIR="$feature_dir"
FEATURE_SPEC="$feature_dir/spec.md"
IMPL_PLAN="$feature_dir/plan.md"
TASKS="$feature_dir/tasks.md"
RESEARCH="$feature_dir/research.md"
DATA_MODEL="$feature_dir/data-model.md"
QUICKSTART="$feature_dir/quickstart.md"
CONTRACTS_DIR="$feature_dir/contracts"
EOF
}

# Test if file exists and print status
test_file_exists() {
    local path="$1"
    local description="$2"
    
    if [[ -f "$path" ]]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

# Test if directory has files
test_dir_has_files() {
    local path="$1"
    local description="$2"
    
    if [[ -d "$path" ]] && [[ -n "$(find "$path" -maxdepth 1 -type f 2>/dev/null | head -1)" ]]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}
