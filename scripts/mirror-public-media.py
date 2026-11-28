"""Mirror only explicitly listed public marketing images, never private data."""
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public-media"
OUT.mkdir(exist_ok=True)
PREFIX = "https://ynkoiuyjevclypumnyes.supabase.co/storage/v1/object/public/"
BUCKETS = {"featured-travel-photos","hotel-photos","cab-photos","group-departure-photos","package-posters","travel-media"}
MAX_BYTES = 10 * 1024 * 1024
mapping = {}
for url in json.loads((ROOT / "public-media-sources.json").read_text()):
    if not isinstance(url,str) or not url.startswith(PREFIX):
        raise ValueError("Unexpected source")
    parsed = urllib.parse.urlsplit(url)
    rel = urllib.parse.unquote(parsed.path).split("/storage/v1/object/public/",1)[1]
    bucket = rel.split("/",1)[0]
    ext = pathlib.PurePosixPath(rel).suffix.lower()
    if parsed.query or parsed.fragment or bucket not in BUCKETS or ext not in {".jpg",".jpeg",".png",".webp",".avif",".gif"} or ".." in rel.split("/"):
        print("Skip unsupported public image",url)
        continue
    name = hashlib.sha256(url.encode()).hexdigest()[:32] + ext
    target = OUT / name
    try:
        if not target.exists():
            req = urllib.request.Request(url,headers={"User-Agent":"HOE-Public-Media-Mirror/1.0"})
            with urllib.request.urlopen(req,timeout=20) as response:
                if response.geturl() != url or not response.headers.get_content_type().startswith("image/"):
                    raise ValueError("Source is not an expected image")
                data = response.read(MAX_BYTES+1)
            if not data or len(data)>MAX_BYTES:
                raise ValueError("Unexpected image size")
            target.write_bytes(data)
        mapping[url] = "/public-media/" + name
    except Exception as err:
        print("Fallback to original source:",url,str(err))
if not mapping:
    raise RuntimeError("No public photos mirrored; retain original deployment")
(ROOT / "public-media-map.js").write_text(
    "/* Generated static photo lookup. */\nwindow.HOE_PUBLIC_MEDIA = Object.freeze(" +
    json.dumps(mapping,ensure_ascii=True,sort_keys=True) +
    ");\nwindow.hoePublicMedia = value => window.HOE_PUBLIC_MEDIA[value] || value;\n",
    encoding="utf-8"
)
print(f"Static images ready: {len(mapping)}")
