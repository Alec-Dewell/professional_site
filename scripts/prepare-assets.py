"""Download variable fonts and their licenses once; runtime is self-contained."""
from pathlib import Path
import urllib.request

root = Path(__file__).resolve().parents[1]
destination = root / "src" / "fonts"
destination.mkdir(parents=True, exist_ok=True)
families = [
    ("manrope/Manrope%5Bwght%5D.ttf", "manrope"),
    ("spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf", "space-grotesk"),
]
for family, name in families:
    url = "https://raw.githubusercontent.com/google/fonts/main/ofl/" + family
    data = urllib.request.urlopen(url, timeout=30).read()
    if b"fvar" not in data:
        raise ValueError("Expected a variable font: " + name)
    (destination / (name + ".ttf")).write_bytes(data)
    print(name + ": " + str(len(data)) + " bytes")

for name, path in [("manrope", "manrope"), ("space-grotesk", "spacegrotesk")]:
    license_url = "https://raw.githubusercontent.com/google/fonts/main/ofl/" + path + "/OFL.txt"
    license_text = urllib.request.urlopen(license_url, timeout=30).read()
    (destination / (name + "-OFL.txt")).write_bytes(license_text)
    print(name + ": license bundled")
