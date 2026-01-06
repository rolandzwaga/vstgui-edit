#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

JSON_OUTPUT=false
SHORT_NAME=""
NUMBER=0
FEATURE_DESCRIPTION=""

show_help() {
    cat <<EOF
Usage: ./create-new-feature.sh [OPTIONS] <feature description>

Options:
  --json              Output in JSON format
  --short-name <name> Provide a custom short name (2-4 words) for the branch
  --number N          Specify branch number manually (overrides auto-detection)
  --help, -h          Show this help message

Examples:
  ./create-new-feature.sh 'Add user authentication system' --short-name 'user-auth'
  ./create-new-feature.sh 'Implement OAuth2 integration for API'
EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json)
            JSON_OUTPUT=true
            shift
            ;;
        --short-name|-ShortName)
            SHORT_NAME="$2"
            shift 2
            ;;
        --number|-Number)
            NUMBER="$2"
            shift 2
            ;;
        --help|-h|-Help)
            show_help
            ;;
        -*)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
        *)
            if [[ -z "$FEATURE_DESCRIPTION" ]]; then
                FEATURE_DESCRIPTION="$1"
            else
                FEATURE_DESCRIPTION="$FEATURE_DESCRIPTION $1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$FEATURE_DESCRIPTION" ]]; then
    echo "Usage: ./create-new-feature.sh [OPTIONS] <feature description>" >&2
    exit 1
fi

find_repository_root() {
    local current="$1"
    local markers=(".git" ".specify")
    
    while [[ "$current" != "/" ]]; do
        for marker in "${markers[@]}"; do
            if [[ -e "$current/$marker" ]]; then
                echo "$current"
                return 0
            fi
        done
        current="$(dirname "$current")"
    done
    return 1
}

get_highest_number_from_specs() {
    local specs_dir="$1"
    local highest=0
    
    if [[ -d "$specs_dir" ]]; then
        for dir in "$specs_dir"/*/; do
            if [[ -d "$dir" ]]; then
                local name
                name=$(basename "$dir")
                if [[ "$name" =~ ^([0-9]+) ]]; then
                    local num=$((10#${BASH_REMATCH[1]}))
                    ((num > highest)) && highest=$num
                fi
            fi
        done
    fi
    echo "$highest"
}

get_highest_number_from_branches() {
    local highest=0
    
    if git branch -a 2>/dev/null | while read -r branch; do
        branch="${branch#\* }"
        branch="${branch##*/}"
        if [[ "$branch" =~ ^([0-9]+)- ]]; then
            local num=$((10#${BASH_REMATCH[1]}))
            ((num > highest)) && highest=$num
        fi
    done; then
        :
    fi
    
    local branches
    branches=$(git branch -a 2>/dev/null || true)
    while IFS= read -r branch; do
        branch="${branch#\* }"
        branch="${branch##*/}"
        branch="${branch#remotes/*/}"
        if [[ "$branch" =~ ^([0-9]+)- ]]; then
            local num=$((10#${BASH_REMATCH[1]}))
            ((num > highest)) && highest=$num
        fi
    done <<< "$branches"
    
    echo "$highest"
}

get_next_branch_number() {
    local specs_dir="$1"
    
    git fetch --all --prune 2>/dev/null || true
    
    local highest_branch highest_spec max_num
    highest_branch=$(get_highest_number_from_branches)
    highest_spec=$(get_highest_number_from_specs "$specs_dir")
    
    if ((highest_branch > highest_spec)); then
        max_num=$highest_branch
    else
        max_num=$highest_spec
    fi
    
    echo $((max_num + 1))
}

convert_to_clean_branch_name() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

get_branch_name() {
    local description="$1"
    local stop_words="i a an the to for of in on at by with from is are was were be been being have has had do does did will would should could can may might must shall this that these those my your our their want need add get set"
    
    local clean_name
    clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/ /g')
    
    local meaningful_words=()
    for word in $clean_name; do
        local is_stop=false
        for stop in $stop_words; do
            if [[ "$word" == "$stop" ]]; then
                is_stop=true
                break
            fi
        done
        
        if [[ "$is_stop" == "false" && ${#word} -ge 3 ]]; then
            meaningful_words+=("$word")
        fi
    done
    
    if [[ ${#meaningful_words[@]} -gt 0 ]]; then
        local max_words=3
        ((${#meaningful_words[@]} == 4)) && max_words=4
        local result="${meaningful_words[*]:0:$max_words}"
        echo "${result// /-}"
    else
        convert_to_clean_branch_name "$description" | cut -d'-' -f1-3
    fi
}

fallback_root=$(find_repository_root "$SCRIPT_DIR")
if [[ -z "$fallback_root" ]]; then
    echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
    exit 1
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) && has_git=true || { repo_root="$fallback_root"; has_git=false; }

cd "$repo_root"

specs_dir="$repo_root/specs"
mkdir -p "$specs_dir"

if [[ -n "$SHORT_NAME" ]]; then
    branch_suffix=$(convert_to_clean_branch_name "$SHORT_NAME")
else
    branch_suffix=$(get_branch_name "$FEATURE_DESCRIPTION")
fi

if [[ "$NUMBER" -eq 0 ]]; then
    if [[ "$has_git" == "true" ]]; then
        NUMBER=$(get_next_branch_number "$specs_dir")
    else
        NUMBER=$(($(get_highest_number_from_specs "$specs_dir") + 1))
    fi
fi

feature_num=$(printf "%03d" "$NUMBER")
branch_name="$feature_num-$branch_suffix"

max_branch_length=244
if [[ ${#branch_name} -gt $max_branch_length ]]; then
    max_suffix_length=$((max_branch_length - 4))
    truncated_suffix="${branch_suffix:0:$max_suffix_length}"
    truncated_suffix="${truncated_suffix%-}"
    
    echo "[specify] Branch name exceeded GitHub's 244-byte limit" >&2
    echo "[specify] Original: $branch_name (${#branch_name} bytes)" >&2
    branch_name="$feature_num-$truncated_suffix"
    echo "[specify] Truncated to: $branch_name (${#branch_name} bytes)" >&2
fi

if [[ "$has_git" == "true" ]]; then
    git checkout -b "$branch_name" 2>/dev/null || echo "Warning: Failed to create git branch: $branch_name" >&2
else
    echo "[specify] Warning: Git repository not detected; skipped branch creation for $branch_name" >&2
fi

feature_dir="$specs_dir/$branch_name"
mkdir -p "$feature_dir"

template="$repo_root/.specify/templates/spec-template.md"
spec_file="$feature_dir/spec.md"
if [[ -f "$template" ]]; then
    cp "$template" "$spec_file"
else
    touch "$spec_file"
fi

export SPECIFY_FEATURE="$branch_name"

if [[ "$JSON_OUTPUT" == "true" ]]; then
    cat <<EOF
{"BRANCH_NAME":"$branch_name","SPEC_FILE":"$spec_file","FEATURE_NUM":"$feature_num","HAS_GIT":$has_git}
EOF
else
    echo "BRANCH_NAME: $branch_name"
    echo "SPEC_FILE: $spec_file"
    echo "FEATURE_NUM: $feature_num"
    echo "HAS_GIT: $has_git"
    echo "SPECIFY_FEATURE environment variable set to: $branch_name"
fi
