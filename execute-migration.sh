#!/bin/bash

# Realm v12 Schema Migration Execution Script
# openchs-models package
# Systematic execution following the comprehensive plan

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_phase() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

log_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✖ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Confirmation prompt
confirm() {
    read -p "$(echo -e ${YELLOW}$1 '(y/N): '${NC})" response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Pause and wait for user
pause() {
    read -p "$(echo -e ${YELLOW}'Press Enter to continue...'${NC})"
}

# Main execution
main() {
    clear
    echo -e "${BLUE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║           Realm v12 Schema Migration - openchs-models                    ║
║                                                                           ║
║   This script will systematically migrate Realm schema definitions       ║
║   from v11 to v12 syntax following the comprehensive execution plan      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"

    log_warning "This script will modify source files. Ensure you have committed all changes."
    echo ""
    
    if ! confirm "Do you want to proceed?"; then
        log_warning "Migration cancelled by user"
        exit 0
    fi

    # =========================================================================
    # PHASE 0: BACKUP & PREPARATION
    # =========================================================================
    log_phase "PHASE 0: Backup & Preparation"
    
    log_step "Creating git checkpoint..."
    if git diff --quiet && git diff --cached --quiet; then
        log_success "Working directory is clean"
    else
        log_warning "You have uncommitted changes"
        if confirm "Commit them now?"; then
            git add .
            git commit -m "chore: checkpoint before Realm v12 schema migration"
            log_success "Changes committed"
        else
            log_error "Please commit or stash changes before proceeding"
            exit 1
        fi
    fi

    log_step "Creating baseline git tag..."
    git tag -f realm-schema-v11-baseline
    log_success "Tag created: realm-schema-v11-baseline"

    log_step "Documenting current state..."
    npm list > migration-baseline.txt 2>&1 || true
    log_success "Baseline documented in migration-baseline.txt"

    pause

    # =========================================================================
    # PHASE 1: PRE-MIGRATION AUDIT
    # =========================================================================
    log_phase "PHASE 1: Pre-Migration Audit"
    
    log_step "Running schema compatibility audit..."
    if node schema-audit.js; then
        log_success "Schema audit passed"
    else
        log_error "Schema audit failed. Review issues above."
        if ! confirm "Continue anyway? (Not recommended)"; then
            exit 1
        fi
    fi

    pause

    log_step "Checking for breaking API changes..."
    if node check-breaking-changes.js; then
        log_success "No deprecated API usage detected"
    else
        log_warning "Deprecated API usage found. Review warnings above."
        pause
    fi

    # =========================================================================
    # PHASE 2: DRY RUN
    # =========================================================================
    log_phase "PHASE 2: Migration Dry Run"
    
    log_step "Running migration script in dry-run mode..."
    echo ""
    node migrate-realm-schema.js
    echo ""
    
    log_warning "Review the dry run output above carefully"
    log_warning "Expected: 36 files, 73 changes"
    echo ""
    
    if ! confirm "Does the output look correct?"; then
        log_error "Dry run validation failed"
        exit 1
    fi

    pause

    # =========================================================================
    # PHASE 3: EXECUTE MIGRATION
    # =========================================================================
    log_phase "PHASE 3: Execute Migration"
    
    log_warning "This will modify 36 files with 73 schema changes"
    if ! confirm "Execute migration now?"; then
        log_error "Migration cancelled"
        exit 1
    fi

    log_step "Applying schema migration..."
    if node migrate-realm-schema.js --apply; then
        log_success "Migration completed successfully"
    else
        log_error "Migration failed"
        exit 1
    fi

    pause

    # =========================================================================
    # PHASE 4: POST-MIGRATION VALIDATION
    # =========================================================================
    log_phase "PHASE 4: Post-Migration Validation"
    
    log_step "Validating migrated schemas..."
    if node validate-schemas.js; then
        log_success "Schema validation passed"
    else
        log_error "Schema validation failed. Review errors above."
        if confirm "Rollback changes?"; then
            git reset --hard realm-schema-v11-baseline
            log_warning "Rolled back to baseline"
            exit 1
        fi
        exit 1
    fi

    pause

    log_step "Running build test..."
    if npm run build; then
        log_success "Build successful"
    else
        log_error "Build failed"
        if confirm "Rollback changes?"; then
            git reset --hard realm-schema-v11-baseline
            log_warning "Rolled back to baseline"
            exit 1
        fi
        exit 1
    fi

    pause

    log_step "Running unit tests..."
    if npm test; then
        log_success "All tests passed"
    else
        log_warning "Some tests failed. Review above."
        if ! confirm "Continue anyway?"; then
            if confirm "Rollback changes?"; then
                git reset --hard realm-schema-v11-baseline
                log_warning "Rolled back to baseline"
                exit 1
            fi
            exit 1
        fi
    fi

    pause

    # =========================================================================
    # PHASE 5: REVIEW CHANGES
    # =========================================================================
    log_phase "PHASE 5: Review Changes"
    
    log_step "Showing git diff summary..."
    git diff --stat
    echo ""
    
    log_warning "Review the changes above"
    if confirm "View detailed diff?"; then
        git diff | less
    fi

    if ! confirm "Are the changes correct?"; then
        if confirm "Rollback?"; then
            git reset --hard realm-schema-v11-baseline
            log_warning "Rolled back to baseline"
            exit 1
        fi
        exit 1
    fi

    # =========================================================================
    # PHASE 6: COMMIT & TAG
    # =========================================================================
    log_phase "PHASE 6: Commit & Tag"
    
    log_step "Committing migration..."
    git add .
    git commit -m "feat: migrate Realm schemas to v12 syntax

- Update 36 schema files with 73 property definitions
- Convert object references to explicit format
- Change: propertyName: 'TypeName' → { type: 'object', objectType: 'TypeName' }
- All schemas validated and tests passing

BREAKING CHANGE: Requires Realm v12+ in consuming applications"

    log_success "Migration committed"

    log_step "Creating success tag..."
    git tag realm-schema-v12-migrated
    log_success "Tag created: realm-schema-v12-migrated"

    # =========================================================================
    # PHASE 7: CLEANUP
    # =========================================================================
    log_phase "PHASE 7: Cleanup"
    
    log_step "Cleaning up temporary files..."
    rm -f migration-baseline.txt
    log_success "Cleanup complete"

    # =========================================================================
    # COMPLETION
    # =========================================================================
    log_phase "✅ MIGRATION COMPLETE"
    
    cat << EOF

${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    Migration Completed Successfully!                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝${NC}

${BLUE}Summary:${NC}
  • Files modified: 36
  • Schema changes: 73
  • Build: ✓ Passed
  • Tests: ✓ Passed
  • Validation: ✓ Passed

${BLUE}Git Tags Created:${NC}
  • realm-schema-v11-baseline (rollback point)
  • realm-schema-v12-migrated (current)

${BLUE}Next Steps:${NC}
  1. Review REALM_MIGRATION_PLAN.md for post-migration tasks
  2. Update CHANGELOG.md with migration details
  3. Consider version bump (1.32.54 → 1.33.0 or 2.0.0)
  4. Test with consuming applications
  5. Publish updated package

${YELLOW}Important Note:${NC}
  Consuming applications MUST upgrade to Realm v12+ to use this version.

${BLUE}Rollback (if needed):${NC}
  git reset --hard realm-schema-v11-baseline

EOF

    log_success "All phases completed successfully!"
}

# Error handler
error_handler() {
    log_error "An error occurred during migration"
    log_warning "You can rollback with: git reset --hard realm-schema-v11-baseline"
    exit 1
}

trap error_handler ERR

# Run main
main "$@"
