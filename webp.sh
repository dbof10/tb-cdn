mkdir -p crypto2

for file in crypto/*.png; do
  filename=$(basename "$file" .png)
  magick "$file" "crypto2/$filename.webp"
done
