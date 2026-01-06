#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

JSON_OUTPUT=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

show_help() {
    cat <<EOF
Usage: check-prerequisites.sh [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json            Output in JSON format
  --require-tasks   Require tasks.md to exist (for implementation phase)
  --include-tasks   Include tasks.md in AVAILABLE_DOCS list
  --paths-only      Only output path variables (no prerequisite validation)
  --help, -h        Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  ./check-prerequisites.sh --json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  ./check-prerequisites.sh --json --require-tasks --include-tasks
  
  # Get feature paths only (no validation)
  ./check-prerequisites.sh --paths-only

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json)
            JSON_OUTPUT=true
            shift
            ;;
        --require-tasks|-RequireTasks)
            REQUIRE_TASKS=true
            shift
            ;;
        --include-tasks|-IncludeTasks)
            INCLUDE_TASKS=true
            shift
            ;;
        --paths-only|-PathsOnly)
            PATHS_ONLY=true
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

if [[ "$PATHS_ONLY" == "true" ]]; then
    if [[ "$JSON_OUTPUT" == "true" ]]; then
        cat <<EOF
{"REPO_ROOT":"$REPO_ROOT","BRANCH":"$CURRENT_BRANCH","FEATURE_DIR":"$FEATURE_DIR","FEATURE_SPEC":"$FEATURE_SPEC","IMPL_PLAN":"$IMPL_PLAN","TASKS":"$TASKS"}
EOF
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR"
    echo "Run /speckit.specify first to create the feature structure."
    exit 1
fi

if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR"
    echo "Run /speckit.plan first to create the implementation plan."
    exit 1
fi

if [[ "$REQUIRE_TASKS" == "true" && ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR"
    echo "Run /speckit.tasks first to create the task list."
    exit 1
fi

docs=()

[[ -f "$RESEARCH" ]] && docs+=("research.md")
[[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")

if [[ -d "$CONTRACTS_DIR" ]] && [[ -n "$(find "$CONTRACTS_DIR" -maxdepth 1 -type f 2>/dev/null | head -1)" ]]; then
    docs+=("contracts/")
fi

[[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")

if [[ "$INCLUDE_TASKS" == "true" && -f "$TASKS" ]]; then
    docs+=("tasks.md")
fi

if [[ "$JSON_OUTPUT" == "true" ]]; then
    docs_json=$(printf '%s\n' "${docs[@]}" | jq -R . | jq -s .)
    echo "{\"FEATURE_DIR\":\"$FEATURE_DIR\",\"AVAILABLE_DOCS\":$docs_json}"
else
    echo "FEATURE_DIR:$FEATURE_DIR"
    echo "AVAILABLE_DOCS:"
    
    test_file_exists "$RESEARCH" "research.md" || true
    test_file_exists "$DATA_MODEL" "data-model.md" || true
    test_dir_has_files "$CONTRACTS_DIR" "contracts/" || true
    test_file_exists "$QUICKSTART" "quickstart.md" || true
    
    if [[ "$INCLUDE_TASKS" == "true" ]]; then
        test_file_exists "$TASKS" "tasks.md" || true
    fi
fi
