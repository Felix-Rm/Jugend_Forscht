dur=$(ffprobe -i $1 -show_entries format=duration -v quiet -of csv="p=0")
sec=${dur%.*}
echo "$sec"
trim=$((sec - $3))
echo "$trim"
ffmpeg -t $trim -i $1 $2
