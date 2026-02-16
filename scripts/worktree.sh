#!/usr/bin/env bash
set -euo pipefail

# --- helpers ---

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
PARENT_DIR="$(dirname "$REPO_ROOT")"

usage() {
	cat <<-EOF
		Usage: $(basename "$0") <command> [args]

		Commands:
		  new  <branch>   Create a worktree, assign a dev-server port, npm install
		  rm   <branch>   Remove a worktree and delete the branch
		  list            List active worktrees with their ports
	EOF
	exit 1
}

# Turn "feat/ui/bar" into "dofusdle-feat-ui-bar"
sanitize() {
	echo "${REPO_NAME}-$(echo "$1" | tr '/' '-')"
}

# Find the lowest available port starting from 5181 by scanning .env.local files
next_port() {
	local used_ports=()

	# Collect VITE_PORT values from sibling worktree directories
	for dir in "$PARENT_DIR"/"${REPO_NAME}"-*/; do
		[ -d "$dir" ] || continue
		local env_file="$dir/.env.local"
		if [ -f "$env_file" ]; then
			local p
			p=$(grep -E '^VITE_PORT=' "$env_file" 2>/dev/null | head -1 | cut -d= -f2)
			[ -n "$p" ] && used_ports+=("$p")
		fi
	done

	local port=5181
	while true; do
		local taken=false
		for p in "${used_ports[@]+"${used_ports[@]}"}"; do
			if [ "$p" = "$port" ]; then
				taken=true
				break
			fi
		done
		if [ "$taken" = false ]; then
			echo "$port"
			return
		fi
		((port++))
	done
}

# --- subcommands ---

cmd_new() {
	local branch="${1:?Branch name required}"
	local dir_name
	dir_name="$(sanitize "$branch")"
	local worktree_path="$PARENT_DIR/$dir_name"

	if [ -d "$worktree_path" ]; then
		echo "Error: directory already exists: $worktree_path" >&2
		exit 1
	fi

	# Create or reuse the branch
	if git show-ref --verify --quiet "refs/heads/$branch"; then
		echo "Branch '$branch' already exists, reusing it."
		git worktree add "$worktree_path" "$branch"
	else
		git worktree add -b "$branch" "$worktree_path"
	fi

	# Assign port
	local port
	port="$(next_port)"
	echo "VITE_PORT=$port" > "$worktree_path/.env.local"

	# Install dependencies
	echo "Installing dependencies..."
	(cd "$worktree_path" && npm install)

	echo ""
	echo "Worktree ready:"
	echo "  Path:   $worktree_path"
	echo "  Branch: $branch"
	echo "  Port:   $port"
	echo ""
	echo "To start working:"
	echo "  cd $worktree_path && claude"
}

cmd_rm() {
	local branch="${1:?Branch name required}"
	local dir_name
	dir_name="$(sanitize "$branch")"
	local worktree_path="$PARENT_DIR/$dir_name"

	git worktree remove "$worktree_path"
	echo "Worktree removed: $worktree_path"

	if ! git branch -d "$branch" 2>/dev/null; then
		echo "Warning: branch '$branch' was not deleted (not fully merged)."
		echo "  Use 'git branch -D $branch' to force-delete it."
	else
		echo "Branch deleted: $branch"
	fi
}

cmd_list() {
	local found=false

	printf "%-30s %-50s %s\n" "BRANCH" "PATH" "PORT"
	printf "%-30s %-50s %s\n" "------" "----" "----"

	while IFS= read -r line; do
		case "$line" in
		"worktree "*)
			wt_path="${line#worktree }"
			;;
		"branch refs/heads/"*)
			wt_branch="${line#branch refs/heads/}"
			;;
		"")
			# End of entry — print if it's a sibling worktree (not the main repo)
			if [ -n "${wt_path:-}" ] && [ -n "${wt_branch:-}" ] && [ "$wt_path" != "$REPO_ROOT" ]; then
				local port="-"
				local env_file="$wt_path/.env.local"
				if [ -f "$env_file" ]; then
					port=$(grep -E '^VITE_PORT=' "$env_file" 2>/dev/null | head -1 | cut -d= -f2)
					[ -z "$port" ] && port="-"
				fi
				printf "%-30s %-50s %s\n" "$wt_branch" "$wt_path" "$port"
				found=true
			fi
			wt_path=""
			wt_branch=""
			;;
		esac
	done < <(git worktree list --porcelain; echo "")

	if [ "$found" = false ]; then
		echo "(no worktrees)"
	fi
}

# --- main ---

case "${1:-}" in
	new)  shift; cmd_new "$@" ;;
	rm)   shift; cmd_rm "$@" ;;
	list) cmd_list ;;
	*)    usage ;;
esac
