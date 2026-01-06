#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

AGENT_TYPE=""

show_help() {
    cat <<EOF
Usage: ./update-agent-context.sh [AGENT_TYPE]

Update agent context files with information from plan.md

AGENT_TYPE (optional):
  claude, gemini, copilot, cursor-agent, qwen, opencode, codex, windsurf,
  kilocode, auggie, roo, codebuddy, amp, shai, q, bob, qoder

If no agent type is specified, updates all existing agent files.

Examples:
  ./update-agent-context.sh claude
  ./update-agent-context.sh   # Updates all existing agent files
EOF
    exit 0
}

if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
fi

[[ -n "$1" ]] && AGENT_TYPE="$1"

eval "$(get_feature_paths_env)"

NEW_PLAN="$IMPL_PLAN"

CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"
GEMINI_FILE="$REPO_ROOT/GEMINI.md"
COPILOT_FILE="$REPO_ROOT/.github/agents/copilot-instructions.md"
CURSOR_FILE="$REPO_ROOT/.cursor/rules/specify-rules.mdc"
QWEN_FILE="$REPO_ROOT/QWEN.md"
AGENTS_FILE="$REPO_ROOT/AGENTS.md"
WINDSURF_FILE="$REPO_ROOT/.windsurf/rules/specify-rules.md"
KILOCODE_FILE="$REPO_ROOT/.kilocode/rules/specify-rules.md"
AUGGIE_FILE="$REPO_ROOT/.augment/rules/specify-rules.md"
ROO_FILE="$REPO_ROOT/.roo/rules/specify-rules.md"
CODEBUDDY_FILE="$REPO_ROOT/CODEBUDDY.md"
QODER_FILE="$REPO_ROOT/QODER.md"
AMP_FILE="$REPO_ROOT/AGENTS.md"
SHAI_FILE="$REPO_ROOT/SHAI.md"
Q_FILE="$REPO_ROOT/AGENTS.md"
BOB_FILE="$REPO_ROOT/AGENTS.md"

TEMPLATE_FILE="$REPO_ROOT/.specify/templates/agent-file-template.md"

NEW_LANG=""
NEW_FRAMEWORK=""
NEW_DB=""
NEW_PROJECT_TYPE=""

info() { echo "INFO: $1"; }
success() { echo "✓ $1"; }
warn() { echo "WARNING: $1" >&2; }
err() { echo "ERROR: $1" >&2; }

validate_environment() {
    if [[ -z "$CURRENT_BRANCH" ]]; then
        err "Unable to determine current feature"
        if [[ "$HAS_GIT" == "true" ]]; then
            info "Make sure you're on a feature branch"
        else
            info "Set SPECIFY_FEATURE environment variable or create a feature first"
        fi
        exit 1
    fi
    
    if [[ ! -f "$NEW_PLAN" ]]; then
        err "No plan.md found at $NEW_PLAN"
        info "Ensure you are working on a feature with a corresponding spec directory"
        [[ "$HAS_GIT" != "true" ]] && info "Use: export SPECIFY_FEATURE=your-feature-name or create a new feature first"
        exit 1
    fi
    
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        err "Template file not found at $TEMPLATE_FILE"
        info "Run specify init to scaffold .specify/templates, or add agent-file-template.md there."
        exit 1
    fi
}

extract_plan_field() {
    local field_pattern="$1"
    local plan_file="$2"
    
    [[ ! -f "$plan_file" ]] && return
    
    grep -E "^\*\*${field_pattern}\*\*: " "$plan_file" 2>/dev/null | head -1 | sed "s/^\*\*${field_pattern}\*\*: //" | grep -v -E "^(NEEDS CLARIFICATION|N/A)$" || true
}

parse_plan_data() {
    local plan_file="$1"
    
    if [[ ! -f "$plan_file" ]]; then
        err "Plan file not found: $plan_file"
        return 1
    fi
    
    info "Parsing plan data from $plan_file"
    
    NEW_LANG=$(extract_plan_field "Language/Version" "$plan_file")
    NEW_FRAMEWORK=$(extract_plan_field "Primary Dependencies" "$plan_file")
    NEW_DB=$(extract_plan_field "Storage" "$plan_file")
    NEW_PROJECT_TYPE=$(extract_plan_field "Project Type" "$plan_file")
    
    [[ -n "$NEW_LANG" ]] && info "Found language: $NEW_LANG" || warn "No language information found in plan"
    [[ -n "$NEW_FRAMEWORK" ]] && info "Found framework: $NEW_FRAMEWORK"
    [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" ]] && info "Found database: $NEW_DB"
    [[ -n "$NEW_PROJECT_TYPE" ]] && info "Found project type: $NEW_PROJECT_TYPE"
    
    return 0
}

format_technology_stack() {
    local lang="$1"
    local framework="$2"
    local parts=()
    
    [[ -n "$lang" && "$lang" != "NEEDS CLARIFICATION" ]] && parts+=("$lang")
    [[ -n "$framework" && "$framework" != "NEEDS CLARIFICATION" && "$framework" != "N/A" ]] && parts+=("$framework")
    
    if [[ ${#parts[@]} -eq 0 ]]; then
        echo ""
    else
        local IFS=" + "
        echo "${parts[*]}"
    fi
}

get_project_structure() {
    local project_type="$1"
    if [[ "$project_type" =~ web ]]; then
        printf "backend/\nfrontend/\ntests/"
    else
        printf "src/\ntests/"
    fi
}

get_commands_for_language() {
    local lang="$1"
    case "$lang" in
        *Python*) echo "cd src; pytest; ruff check ." ;;
        *Rust*) echo "cargo test; cargo clippy" ;;
        *JavaScript*|*TypeScript*) echo "npm test; npm run lint" ;;
        *) echo "# Add commands for $lang" ;;
    esac
}

get_language_conventions() {
    local lang="$1"
    if [[ -n "$lang" ]]; then
        echo "$lang: Follow standard conventions"
    else
        echo "General: Follow standard conventions"
    fi
}

new_agent_file() {
    local target_file="$1"
    local project_name="$2"
    local date="$3"
    
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        err "Template not found at $TEMPLATE_FILE"
        return 1
    fi
    
    local temp_file
    temp_file=$(mktemp)
    cp "$TEMPLATE_FILE" "$temp_file"
    
    local project_structure commands language_conventions
    project_structure=$(get_project_structure "$NEW_PROJECT_TYPE")
    commands=$(get_commands_for_language "$NEW_LANG")
    language_conventions=$(get_language_conventions "$NEW_LANG")
    
    local tech_stack=""
    if [[ -n "$NEW_LANG" && -n "$NEW_FRAMEWORK" ]]; then
        tech_stack="- $NEW_LANG + $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    elif [[ -n "$NEW_LANG" ]]; then
        tech_stack="- $NEW_LANG ($CURRENT_BRANCH)"
    elif [[ -n "$NEW_FRAMEWORK" ]]; then
        tech_stack="- $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    fi
    
    local recent_changes=""
    if [[ -n "$NEW_LANG" && -n "$NEW_FRAMEWORK" ]]; then
        recent_changes="- ${CURRENT_BRANCH}: Added ${NEW_LANG} + ${NEW_FRAMEWORK}"
    elif [[ -n "$NEW_LANG" ]]; then
        recent_changes="- ${CURRENT_BRANCH}: Added ${NEW_LANG}"
    elif [[ -n "$NEW_FRAMEWORK" ]]; then
        recent_changes="- ${CURRENT_BRANCH}: Added ${NEW_FRAMEWORK}"
    fi
    
    sed -i "s/\[PROJECT NAME\]/$project_name/g" "$temp_file"
    sed -i "s/\[DATE\]/$date/g" "$temp_file"
    sed -i "s/\[EXTRACTED FROM ALL PLAN.MD FILES\]/$tech_stack/g" "$temp_file"
    sed -i "s/\[ACTUAL STRUCTURE FROM PLANS\]/$project_structure/g" "$temp_file"
    sed -i "s/\[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES\]/$commands/g" "$temp_file"
    sed -i "s/\[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE\]/$language_conventions/g" "$temp_file"
    sed -i "s/\[LAST 3 FEATURES AND WHAT THEY ADDED\]/$recent_changes/g" "$temp_file"
    
    local parent_dir
    parent_dir=$(dirname "$target_file")
    mkdir -p "$parent_dir"
    
    mv "$temp_file" "$target_file"
    return 0
}

update_existing_agent_file() {
    local target_file="$1"
    local date="$2"
    
    if [[ ! -f "$target_file" ]]; then
        local project_name
        project_name=$(basename "$REPO_ROOT")
        new_agent_file "$target_file" "$project_name" "$date"
        return $?
    fi
    
    local tech_stack
    tech_stack=$(format_technology_stack "$NEW_LANG" "$NEW_FRAMEWORK")
    
    if [[ -n "$tech_stack" ]] && ! grep -qF "$tech_stack" "$target_file"; then
        sed -i "/^## Active Technologies/a - $tech_stack ($CURRENT_BRANCH)" "$target_file"
    fi
    
    if [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" && "$NEW_DB" != "NEEDS CLARIFICATION" ]] && ! grep -qF "$NEW_DB" "$target_file"; then
        sed -i "/^## Active Technologies/a - $NEW_DB ($CURRENT_BRANCH)" "$target_file"
    fi
    
    local new_change=""
    if [[ -n "$tech_stack" ]]; then
        new_change="- ${CURRENT_BRANCH}: Added ${tech_stack}"
    elif [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" && "$NEW_DB" != "NEEDS CLARIFICATION" ]]; then
        new_change="- ${CURRENT_BRANCH}: Added ${NEW_DB}"
    fi
    
    if [[ -n "$new_change" ]] && ! grep -qF "$new_change" "$target_file"; then
        sed -i "/^## Recent Changes/a $new_change" "$target_file"
    fi
    
    sed -i "s/\*\*Last updated\*\*: [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/**Last updated**: $date/g" "$target_file"
    
    return 0
}

update_agent_file() {
    local target_file="$1"
    local agent_name="$2"
    
    if [[ -z "$target_file" || -z "$agent_name" ]]; then
        err "update_agent_file requires target_file and agent_name"
        return 1
    fi
    
    info "Updating $agent_name context file: $target_file"
    
    local project_name date
    project_name=$(basename "$REPO_ROOT")
    date=$(date +%Y-%m-%d)
    
    local parent_dir
    parent_dir=$(dirname "$target_file")
    mkdir -p "$parent_dir"
    
    if [[ ! -f "$target_file" ]]; then
        if new_agent_file "$target_file" "$project_name" "$date"; then
            success "Created new $agent_name context file"
        else
            err "Failed to create new agent file"
            return 1
        fi
    else
        if update_existing_agent_file "$target_file" "$date"; then
            success "Updated existing $agent_name context file"
        else
            err "Failed to update agent file"
            return 1
        fi
    fi
    
    return 0
}

update_specific_agent() {
    local agent_type="$1"
    
    case "$agent_type" in
        claude)       update_agent_file "$CLAUDE_FILE" "Claude Code" ;;
        gemini)       update_agent_file "$GEMINI_FILE" "Gemini CLI" ;;
        copilot)      update_agent_file "$COPILOT_FILE" "GitHub Copilot" ;;
        cursor-agent) update_agent_file "$CURSOR_FILE" "Cursor IDE" ;;
        qwen)         update_agent_file "$QWEN_FILE" "Qwen Code" ;;
        opencode)     update_agent_file "$AGENTS_FILE" "opencode" ;;
        codex)        update_agent_file "$AGENTS_FILE" "Codex CLI" ;;
        windsurf)     update_agent_file "$WINDSURF_FILE" "Windsurf" ;;
        kilocode)     update_agent_file "$KILOCODE_FILE" "Kilo Code" ;;
        auggie)       update_agent_file "$AUGGIE_FILE" "Auggie CLI" ;;
        roo)          update_agent_file "$ROO_FILE" "Roo Code" ;;
        codebuddy)    update_agent_file "$CODEBUDDY_FILE" "CodeBuddy CLI" ;;
        qoder)        update_agent_file "$QODER_FILE" "Qoder CLI" ;;
        amp)          update_agent_file "$AMP_FILE" "Amp" ;;
        shai)         update_agent_file "$SHAI_FILE" "SHAI" ;;
        q)            update_agent_file "$Q_FILE" "Amazon Q Developer CLI" ;;
        bob)          update_agent_file "$BOB_FILE" "IBM Bob" ;;
        *)
            err "Unknown agent type '$agent_type'"
            err "Expected: claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|kilocode|auggie|roo|codebuddy|amp|shai|q|bob|qoder"
            return 1
            ;;
    esac
}

update_all_existing_agents() {
    local found=false
    local ok=true
    
    [[ -f "$CLAUDE_FILE" ]] && { update_agent_file "$CLAUDE_FILE" "Claude Code" || ok=false; found=true; }
    [[ -f "$GEMINI_FILE" ]] && { update_agent_file "$GEMINI_FILE" "Gemini CLI" || ok=false; found=true; }
    [[ -f "$COPILOT_FILE" ]] && { update_agent_file "$COPILOT_FILE" "GitHub Copilot" || ok=false; found=true; }
    [[ -f "$CURSOR_FILE" ]] && { update_agent_file "$CURSOR_FILE" "Cursor IDE" || ok=false; found=true; }
    [[ -f "$QWEN_FILE" ]] && { update_agent_file "$QWEN_FILE" "Qwen Code" || ok=false; found=true; }
    [[ -f "$AGENTS_FILE" ]] && { update_agent_file "$AGENTS_FILE" "Codex/opencode" || ok=false; found=true; }
    [[ -f "$WINDSURF_FILE" ]] && { update_agent_file "$WINDSURF_FILE" "Windsurf" || ok=false; found=true; }
    [[ -f "$KILOCODE_FILE" ]] && { update_agent_file "$KILOCODE_FILE" "Kilo Code" || ok=false; found=true; }
    [[ -f "$AUGGIE_FILE" ]] && { update_agent_file "$AUGGIE_FILE" "Auggie CLI" || ok=false; found=true; }
    [[ -f "$ROO_FILE" ]] && { update_agent_file "$ROO_FILE" "Roo Code" || ok=false; found=true; }
    [[ -f "$CODEBUDDY_FILE" ]] && { update_agent_file "$CODEBUDDY_FILE" "CodeBuddy CLI" || ok=false; found=true; }
    [[ -f "$QODER_FILE" ]] && { update_agent_file "$QODER_FILE" "Qoder CLI" || ok=false; found=true; }
    [[ -f "$SHAI_FILE" ]] && { update_agent_file "$SHAI_FILE" "SHAI" || ok=false; found=true; }
    
    if [[ "$found" == "false" ]]; then
        info "No existing agent files found, creating default Claude file..."
        update_agent_file "$CLAUDE_FILE" "Claude Code" || ok=false
    fi
    
    [[ "$ok" == "true" ]]
}

print_summary() {
    echo ""
    info "Summary of changes:"
    [[ -n "$NEW_LANG" ]] && echo "  - Added language: $NEW_LANG"
    [[ -n "$NEW_FRAMEWORK" ]] && echo "  - Added framework: $NEW_FRAMEWORK"
    [[ -n "$NEW_DB" && "$NEW_DB" != "N/A" ]] && echo "  - Added database: $NEW_DB"
    echo ""
    info "Usage: ./update-agent-context.sh [claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|kilocode|auggie|roo|codebuddy|amp|shai|q|bob|qoder]"
}

main() {
    validate_environment
    info "=== Updating agent context files for feature $CURRENT_BRANCH ==="
    
    if ! parse_plan_data "$NEW_PLAN"; then
        err "Failed to parse plan data"
        exit 1
    fi
    
    local success=true
    
    if [[ -n "$AGENT_TYPE" ]]; then
        info "Updating specific agent: $AGENT_TYPE"
        update_specific_agent "$AGENT_TYPE" || success=false
    else
        info "No agent specified, updating all existing agent files..."
        update_all_existing_agents || success=false
    fi
    
    print_summary
    
    if [[ "$success" == "true" ]]; then
        success "Agent context update completed successfully"
        exit 0
    else
        err "Agent context update completed with errors"
        exit 1
    fi
}

main
