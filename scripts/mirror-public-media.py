"""Mirror only explicitly listed public marketing images, never private data."""
import hashlib
import json
import pathlib
import re
import uuid
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public-media"
OUT.mkdir(exist_ok=True)
PREFIX = "https://ynkoiuyjevclypumnyes.supabase.co/storage/v1/object/public/"
BUCKETS = {"featured-travel-photos","hotel-photos","cab-photos","group-departure-photos","package-posters","travel-media"}
MAX_BYTES = 10 * 1024 * 1024
def public_catalogue_sources():
    """Read only the same anonymous marketing catalogue visible on the homepage."""
    origin = PREFIX.split("/storage/", 1)[0]
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    key_match = re.search(r'const SUPABASE_KEY\s*=\s*"(sb_publishable_[A-Za-z0-9_-]+)"', page)
    if not key_match:
        raise ValueError("Public catalogue key not found")
    headers = {"apikey": key_match.group(1), "User-Agent": "HOE-Public-Media-Mirror/1.1"}
    def rows(table, columns, filters=None):
        out = []
        for offset in range(0, 5000, 200):
            query = {"select":columns, "limit":"200", "offset":str(offset), **(filters or {})}
            req = urllib.request.Request(origin+"/rest/v1/"+table+"?"+urllib.parse.urlencode(query), headers=headers)
            with urllib.request.urlopen(req, timeout=20) as res:
                batch = json.load(res)
            if not isinstance(batch, list):
                raise ValueError("Unexpected public catalogue response")
            out.extend(batch)
            if len(batch) < 200:
                return out
        raise ValueError("Public catalogue too large; retain previous map")
    found = []
    for table, filters in (
        ("featured_travel_photos", {"is_active":"eq.true"}),
        ("cabs", {"published":"eq.true"}),
        ("group_departures", {"status":"in.(published,full)"}),
        ("destinations", {"is_active":"eq.true"}),
        ("packages", {}),
    ):
        found.extend(r.get("image_url") for r in rows(table,"image_url",filters))
    hotels = rows("hotels","id",{"published":"eq.true"})
    hotel_ids = [str(uuid.UUID(r["id"])) for r in hotels]
    for pos in range(0,len(hotel_ids),30):
        found.extend(r.get("photo_url") for r in rows("hotel_photos","photo_url",{"hotel_id":"in.("+",".join(hotel_ids[pos:pos+30])+")"}))
    return {url for url in found if isinstance(url,str) and url.startswith(PREFIX)}

# Retain existing static copies when an API is temporarily unavailable. Never
# request private data or use privileged credentials; new sources are public only.
sources = set(json.loads((ROOT / "public-media-sources.json").read_text()))
map_file = ROOT / "public-media-map.js"
if map_file.exists():
    match = re.search(r'Object\.freeze\((\{[^\n]*\})\)', map_file.read_text(encoding="utf-8"))
    if match:
        sources.update(json.loads(match.group(1)).keys())
try:
    sources.update(public_catalogue_sources())
except Exception as exc:
    print("Public catalogue refresh unavailable; retaining prior sources:",str(exc))
mapping = {}
for url in sorted(sources):
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
