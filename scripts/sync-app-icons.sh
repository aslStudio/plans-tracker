#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_dir"
cache_dir=/tmp/plans-tracker-swift-cache
mkdir -p "$cache_dir"
CLANG_MODULE_CACHE_PATH="$cache_dir" swift -module-cache-path "$cache_dir" scripts/generate-app-icon.swift assets/app-icon
for variant in default dark tinted; do
    flat_png=$(mktemp /tmp/plans-tracker-flat.XXXXXX.png)
    ffmpeg -nostdin -loglevel error -y -i "assets/app-icon/$variant.png" -pix_fmt rgb24 "$flat_png"
    mv "$flat_png" "assets/app-icon/$variant.png"
done

cp assets/app-icon/default.png assets/icon.png
cp assets/app-icon/default.png assets/favicon.png
cp assets/app-icon/splash-light.png assets/splash-icon.png
cp assets/app-icon/foreground.png assets/android-icon-foreground.png
sips -z 432 432 assets/app-icon/foreground.png --out assets/android-icon-monochrome.png >/dev/null
sips -z 512 512 assets/app-icon/default.png --out assets/android-icon-background.png >/dev/null

icon_set=ios/planstracker/Images.xcassets/AppIcon.appiconset
cp assets/app-icon/default.png "$icon_set/App-Icon-1024x1024@1x.png"
cp assets/app-icon/dark.png "$icon_set/App-Icon-dark-1024x1024@1x.png"
cp assets/app-icon/tinted.png "$icon_set/App-Icon-tinted-1024x1024@1x.png"

splash_set=ios/planstracker/Images.xcassets/SplashScreenLogo.imageset
for scale in 1 2 3; do
    size=$((180 * scale))
    suffix=
    if [ "$scale" -gt 1 ]; then suffix="@$scale"x; fi
    sips -z "$size" "$size" assets/app-icon/splash-light.png --out "$splash_set/image$suffix.png" >/dev/null
    sips -z "$size" "$size" assets/app-icon/splash-dark.png --out "$splash_set/dark_image$suffix.png" >/dev/null
done

for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    case "$density" in
        mdpi) icon_size=48; splash_size=288 ;;
        hdpi) icon_size=72; splash_size=432 ;;
        xhdpi) icon_size=96; splash_size=576 ;;
        xxhdpi) icon_size=144; splash_size=864 ;;
        xxxhdpi) icon_size=192; splash_size=1152 ;;
    esac
    temp_png=$(mktemp /tmp/plans-tracker-icon.XXXXXX.png)
    sips -z "$icon_size" "$icon_size" assets/app-icon/default.png --out "$temp_png" >/dev/null
    cwebp -quiet -q 90 "$temp_png" -o "android/app/src/main/res/mipmap-$density/ic_launcher.webp"
    sips -z "$icon_size" "$icon_size" assets/app-icon/foreground.png --out "$temp_png" >/dev/null
    cwebp -quiet -q 90 "$temp_png" -o "android/app/src/main/res/mipmap-$density/ic_launcher_foreground.webp"
    sips -z "$splash_size" "$splash_size" assets/app-icon/splash-light.png --out "android/app/src/main/res/drawable-$density/splashscreen_logo.png" >/dev/null
    sips -z "$splash_size" "$splash_size" assets/app-icon/splash-dark.png --out "android/app/src/main/res/drawable-night-$density/splashscreen_logo.png" >/dev/null
    rm "$temp_png"
done
