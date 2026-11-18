"""Refresh the bundled variable fonts as subsetted WOFF2 files.

Development-only; nothing here runs at build time or runtime.

    pip install fonttools brotli
    python scripts/prepare-assets.py            # download from Google Fonts, then subset
    python scripts/prepare-assets.py --local    # re-subset src/fonts/*.ttf you placed there yourself

Both fonts are licensed under the SIL OFL 1.1 without Reserved Font Names,
so subsetting and format conversion are permitted. Licences are bundled.
"""
from pathlib import Path
import sys
import tempfile
import urllib.request

from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "src" / "fonts"
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
FAMILIES = [
    # (path in google/fonts, local name)
    ("manrope/Manrope%5Bwght%5D.ttf", "manrope"),
    ("spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf", "space-grotesk"),
]
# Basic Latin, Latin-1, common extras, general punctuation, currency, arrows.
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2000-206F,U+2074,U+20AC,U+2122,U+2190-21FF,U+2212,U+2215,U+FEFF,U+FFFD"
)


def to_woff2(source: Path, destination: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    font = subset.load_font(str(source), options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    if "fvar" not in font:
        raise ValueError(f"Expected a variable font: {source.name}")
    subset.save_font(font, str(destination), options)
    print(f"{destination.name}: {source.stat().st_size} -> {destination.stat().st_size} bytes")


def main() -> None:
    local = "--local" in sys.argv
    FONTS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for remote, name in FAMILIES:
            if local:
                source = FONTS / f"{name}.ttf"
            else:
                source = Path(tmp) / f"{name}.ttf"
                source.write_bytes(urllib.request.urlopen(GOOGLE_FONTS + remote, timeout=30).read())
                family_dir = remote.split("/")[0]
                licence = urllib.request.urlopen(GOOGLE_FONTS + family_dir + "/OFL.txt", timeout=30).read()
                (FONTS / f"{name}-OFL.txt").write_bytes(licence)
            to_woff2(source, FONTS / f"{name}.woff2")


if __name__ == "__main__":
    main()
