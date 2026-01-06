#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

JSON_OUTPUT=false

show_help() {
    cat <<EOF
Usage: ./setup-plan.sh [--json] [--help]
  --json    Output results in JSON format
  --help    Show this help message
EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json)
            JSON_OUTPUT=true
            shift
            ;;
        --help|-h|-Help)
            show_help
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

eval "$(get_feature_paths_env)"

if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
    exit 1
fi

mkdir -p "$FEATURE_DIR"

template="$REPO_ROOT/.specify/templates/plan-template.md"
if [[ -f "$template" ]]; then
    cp "$template" "$IMPL_PLAN"
    echo "Copied plan template to $IMPL_PLAN"
else
    echo "Warning: Plan template not found at $template" >&2
    touch "$IMPL_PLAN"
fi

if [[ "$JSON_OUTPUT" == "true" ]]; then
    cat <<EOF
{"FEATURE_SPEC":"$FEATURE_SPEC","IMPL_PLAN":"$IMPL_PLAN","SPECS_DIR":"$FEATURE_DIR","BRANCH":"$CURRENT_BRANCH","HAS_GIT":$HAS_GIT}
EOF
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "HAS_GIT: $HAS_GIT"
fi
