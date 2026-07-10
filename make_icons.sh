#!/bin/bash
set -e

SRC="/home/jparker/.gemini/antigravity/brain/80300b36-eff6-42aa-93ea-723eba143b61/timeline_icon_full_1783308137066.jpg"
DEST="/home/jparker/Documents/Timeline/public"

magick "$SRC" -resize 192x192 "$DEST/icon-192.png"
magick "$SRC" -resize 512x512 "$DEST/icon-512.png"
magick "$SRC" -resize 192x192 "$DEST/icon-maskable-192.png"
magick "$SRC" -resize 512x512 "$DEST/icon-maskable-512.png"
magick "$SRC" -resize 180x180 "$DEST/apple-touch-icon.png"
magick "$SRC" -resize 32x32 "$DEST/icon.png"

# Extract 700x700 center of the logo for splash screen
magick "$SRC" -gravity center -crop 700x700+0+0 +repage tmp_logo.png

magick -size 1080x1920 xc:"#07122E" \
  tmp_logo.png -gravity center -geometry +0-250 -composite \
  -font "/usr/share/fonts/liberation/LiberationMono-Bold.ttf" -pointsize 130 -fill white -gravity center -annotate +0+250 "timeline" \
  -font "/usr/share/fonts/TTF/Roboto-Regular.ttf" -pointsize 60 -fill white -annotate +0+450 "CHRONO-PUZZLES" \
  -font "/usr/share/fonts/TTF/Roboto-Regular.ttf" -pointsize 45 -fill "#A0AABF" -annotate +0+530 "DAILY SEQUENCING" \
  -font "/usr/share/fonts/TTF/Roboto-Regular.ttf" -pointsize 28 -fill "#A0AABF" -gravity South -annotate +0+80 "© MMXXVI. Timeline. PWA." \
  "$DEST/splash.png"

rm tmp_logo.png
echo "Done"
