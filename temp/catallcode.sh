#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# KONFIGURATION
# -----------------------------------------------------------------------------
PROJECT_DIR="$HOME/WebstormProjects/bannercreator"
SRC_DIR="$PROJECT_DIR/src"
COMP_DIR="$SRC_DIR/components"
LAYOUT_DIR="$COMP_DIR/Layout"
STYLE_DIR="$SRC_DIR/styles"
PUBLIC_DIR="$PROJECT_DIR/public"
TEMP_DIR="$PROJECT_DIR/temp"
BASE_DIR="$PROJECT_DIR"

# -----------------------------------------------------------------------------
# VORAUSSETZUNGEN
# -----------------------------------------------------------------------------
for cmd in fzf eza jq bat date; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required." >&2
    exit 1
  fi
done

# -----------------------------------------------------------------------------
# HILFSFUNKTION: Datei-Inhalt anzeigen (mit Zeilenzahl + Base64-Hide)
# -----------------------------------------------------------------------------
print_contents(){
  local file="$1"
  local lines
  lines=$(wc -l <"$file")
  echo -e "\n\n===== File: $file ($lines lines) ====="
  sed 's/src="data:image\/[^"]*"/src="data:image\/... (base64 hidden)"/g' "$file"
}

# -----------------------------------------------------------------------------
# KATEGORIEN AUSWAHL
# -----------------------------------------------------------------------------
CATS=(
  "Recent Modified Files (last N days):"
  "Project Root:$PROJECT_DIR"
  "Source:$SRC_DIR"
  "Components:$COMP_DIR"
  "Layouts:$LAYOUT_DIR"
  "Styles:$STYLE_DIR"
  "Public:$PUBLIC_DIR"
  "Temp Scripts:$TEMP_DIR"
)
CHOICE=$(printf '%s\n' "${CATS[@]}" \
  | fzf --prompt="Category> " --height=8 --reverse --border)

[[ -n "$CHOICE" ]] || { echo "No category selected."; exit 0; }
ROOTS_SPEC=${CHOICE#*:}

# -----------------------------------------------------------------------------
# MODUS: Kürzlich geändert (N Tage)
# -----------------------------------------------------------------------------
if [[ "$CHOICE" == "Recent Modified Files (last N days):" ]]; then
  read -rp "How many days back? " DAYS
  [[ "$DAYS" =~ ^[0-9]+$ ]] || { echo "Please enter a valid number."; exit 1; }

  TIME_CUTOFF=$(date -v -"${DAYS}"d +%s)  # macOS. Für Linux: date -d "${DAYS} days ago" +%s

  FILES_FILTERED=()
  while IFS= read -r file; do
    # ignorieren
    [[ "$file" == .idea/* ]] && continue
    [[ "$file" == *.config.js ]] && continue
    [[ "$file" == package.json ]] && continue
    [[ "$file" == package-lock.json ]] && continue
    [[ "$file" == postcss.config.cjs ]] && continue
    [[ "$file" == tailwind.config.ts ]] && continue
    [[ "$file" == vite.config.ts ]] && continue
    [[ "$file" == tsconfig*.json ]] && continue
    [[ "$file" == *.DS_Store ]] && continue

    [[ -f "$BASE_DIR/$file" ]] || continue
    full_path="$BASE_DIR/$file"
    mod_epoch=$(stat -f "%m" "$full_path")
    if (( mod_epoch >= TIME_CUTOFF )); then
      mod_human=$(date -r "$mod_epoch" "+%Y-%m-%d %H:%M")
      FILES_FILTERED+=("$mod_human"$'\t'"$full_path")
    fi
  done < <(git -C "$BASE_DIR" ls-files --cached --others --exclude-standard)

  [[ ${#FILES_FILTERED[@]} -eq 0 ]] && { echo "No modified files in the last $DAYS days."; exit 0; }

  SELECTED_RAW=$(printf '%s\n' "${FILES_FILTERED[@]}" \
    | fzf --ansi --multi \
          --delimiter $'\t' --with-nth=2 \
          --bind 'a:select-all,d:deselect-all,o:execute(open {2})+abort' \
          --header $'⏎ = view\ta = all\td = none\to = open in macOS' \
          --preview 'bat --style=plain --color=always --line-range 1:200 {2}' \
          --preview-window=right:40%:wrap)

  [[ -z "$SELECTED_RAW" ]] && { echo "No file selected."; exit 0; }
  echo "$SELECTED_RAW" | while IFS=$'\t' read -r _ full_path; do
    print_contents "$full_path"
  done
  exit 0
fi

# -----------------------------------------------------------------------------
# MODUS: Normale Kategorie-Auswahl
# -----------------------------------------------------------------------------
IFS=',' read -r -a ROOTS <<< "$ROOTS_SPEC"
ALL_LINES=()
for root in "${ROOTS[@]}"; do
  [[ -e $root ]] || continue
  while IFS= read -r -d '' full_path; do
    # ignorieren
    [[ "$full_path" == "$BASE_DIR/.idea/"* ]] && continue
    base=$(basename "$full_path")
    case "$base" in
      *.config.js|package.json|package-lock.json|postcss.config.cjs|tailwind.config.ts|vite.config.ts|tsconfig*.json)
        continue
        ;;
    esac

    rel_path="${full_path#$BASE_DIR/}"
    eza_line=$(eza --icons --color=always --no-user --no-time --no-permissions --no-filesize --oneline "$full_path" 2>/dev/null)
    [[ -n "$eza_line" ]] || continue
    ALL_LINES+=("$rel_path"$'\t'"$eza_line"$'\t'"$full_path")
  done < <(find "$root" -type f \
      ! -path "$BASE_DIR/node_modules/*" \
      ! -path "$BASE_DIR/.git/*" \
      ! -path "$BASE_DIR/.idea/*" \
    -print0)
done

SELECTED_RAW=$(printf '%s\n' "${ALL_LINES[@]}" \
  | fzf --ansi --multi \
        --delimiter $'\t' --with-nth=2 \
        --bind 'a:select-all,d:deselect-all,o:execute(open {3})+abort' \
        --header $'⏎ = view\ta = all\td = none\to = open in macOS' \
        --preview 'bat --style=plain --color=always --line-range 1:200 {3}' \
        --preview-window=right:40%:wrap)

[[ -n "$SELECTED_RAW" ]] || { echo "No files selected."; exit 0; }
echo "$SELECTED_RAW" | while IFS=$'\t' read -r _ _ full_path; do
  print_contents "$full_path"
done