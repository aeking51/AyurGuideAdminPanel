#!/bin/bash
set -e

SRC_IMG="$1"

if [ -z "$SRC_IMG" ] || [ ! -f "$SRC_IMG" ]; then
  echo "Usage: $0 <path-to-image-file>"
  exit 1
fi

echo "Processing exact photo: $SRC_IMG"

RES_DIR="/app/applet/app/src/main/res"

# 1. Create a perfectly centered square base image (512x512)
# Determine minimum dimension for square crop
WIDTH=$(identify -format "%w" "$SRC_IMG")
HEIGHT=$(identify -format "%h" "$SRC_IMG")
MIN_DIM=$(( WIDTH < HEIGHT ? WIDTH : HEIGHT ))

echo "Source dimensions: ${WIDTH}x${HEIGHT}, cropping square ${MIN_DIM}x${MIN_DIM} centered"

convert "$SRC_IMG" \
  -gravity center -crop "${MIN_DIM}x${MIN_DIM}+0+0" +repage \
  -resize 512x512 /tmp/processed_logo_square.png

# 2. Extract transparent foreground for adaptive icon (if needed)
# Sample edge background color
BG_COLOR=$(convert /tmp/processed_logo_square.png -depth 8 -format "#%[hex:p{10,10}]" info:)
echo "Detected background color: $BG_COLOR"

# Copy square logo directly to drawables
cp /tmp/processed_logo_square.png "$RES_DIR/drawable/sitaram_luxury_logo.png"
cp /tmp/processed_logo_square.png "$RES_DIR/drawable/sitaram_luxury_logo_fg.png"

# Update adaptive icon background color
cat << EOF > "$RES_DIR/drawable/ic_launcher_background.xml"
<?xml version="1.0" encoding="utf-8"?>
<color xmlns:android="http://schemas.android.com/apk/res/android">$BG_COLOR</color>
EOF

# 3. Generate all mipmap density variants
declare -A SIZES=(
  ["mipmap-mdpi"]=48
  ["mipmap-hdpi"]=72
  ["mipmap-xhdpi"]=96
  ["mipmap-xxhdpi"]=144
  ["mipmap-xxxhdpi"]=192
)

for folder in "${!SIZES[@]}"; do
  sz="${SIZES[$folder]}"
  target_dir="$RES_DIR/$folder"
  mkdir -p "$target_dir"
  
  # Square launcher icon
  convert /tmp/processed_logo_square.png -resize "${sz}x${sz}" "$target_dir/ic_launcher.png"
  
  # Round launcher icon with circular crop
  radius=$((sz / 2))
  convert /tmp/processed_logo_square.png -resize "${sz}x${sz}" \
    \( -size "${sz}x${sz}" xc:black -fill white -draw "circle $radius,$radius $radius,1" \) \
    -alpha off -compose CopyOpacity -composite "$target_dir/ic_launcher_round.png"
    
  echo "Generated $folder (${sz}px)"
done

# 4. Web Favicons
convert /tmp/processed_logo_square.png -define icon:auto-resize=64,48,32,16 /app/applet/public/favicon.ico
convert /tmp/processed_logo_square.png -resize 32x32 /app/applet/public/favicon.png
convert /tmp/processed_logo_square.png -resize 180x180 /app/applet/public/apple-touch-icon.png
mkdir -p /app/applet/public/img
cp /tmp/processed_logo_square.png /app/applet/public/img/sitaram_luxury_logo.png
cp /tmp/processed_logo_square.png /app/applet/public/img/sitaram_luxury_logo_fg.png

# 5. Web Admin Favicons
convert /tmp/processed_logo_square.png -define icon:auto-resize=64,48,32,16 /app/applet/web-admin/favicon.ico
convert /tmp/processed_logo_square.png -resize 32x32 /app/applet/web-admin/favicon.png
mkdir -p /app/applet/web-admin/img
cp /tmp/processed_logo_square.png /app/applet/web-admin/img/sitaram_luxury_logo.png
cp /tmp/processed_logo_square.png /app/applet/web-admin/img/sitaram_luxury_logo_fg.png

echo "SUCCESS: Exact photo successfully applied to all Android icons and website favicons!"
