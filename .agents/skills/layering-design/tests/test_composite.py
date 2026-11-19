"""Synthetic tests: original artwork is never modified."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/composite.py"
spec = importlib.util.spec_from_file_location("compositor", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CompositeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.base, self.overlay, self.output = [root / name for name in
                                               ("base.png", "overlay.png", "preview.png")]
        base = Image.new("RGBA", (8, 8), (180, 120, 60, 255))
        base.putpixel((0, 0), (0, 0, 0, 0))
        base.save(self.base)
        self.original = self.base.read_bytes()
        overlay = Image.new("RGBA", (8, 8))
        overlay.putpixel((2, 2), (20, 100, 30, 180))
        overlay.save(self.overlay)

    def run_composite(self):
        module.composite(self.base, self.overlay, self.output)

    def test_composite_preserves_inputs_and_untouched_pixels(self):
        overlay_bytes = self.overlay.read_bytes()
        self.run_composite()
        self.assertEqual(self.base.read_bytes(), self.original)
        self.assertEqual(self.overlay.read_bytes(), overlay_bytes)
        with Image.open(self.output) as result, Image.open(self.base) as base:
            expected = Image.alpha_composite(base.convert("RGBA"), Image.open(self.overlay).convert("RGBA"))
            self.assertEqual(result.tobytes(), expected.tobytes())
            self.assertEqual(result.getpixel((4, 4)), base.getpixel((4, 4)))

    def test_invalid_layers(self):
        cases = {
            "dimensions": Image.new("RGBA", (4, 4)),
            "empty": Image.new("RGBA", (8, 8)),
            "opaque": Image.new("RGBA", (8, 8), (1, 2, 3, 255)),
            "no alpha": Image.new("RGB", (8, 8)),
        }
        outside = Image.new("RGBA", (8, 8))
        outside.putpixel((0, 0), (1, 2, 3, 255))
        cases["outside silhouette"] = outside
        for name, image in cases.items():
            with self.subTest(name=name):
                image.save(self.overlay)
                with self.assertRaises(ValueError):
                    self.run_composite()
                self.assertFalse(self.output.exists())

    def test_cannot_overwrite_inputs(self):
        for target in (self.base, self.overlay):
            with self.assertRaises(ValueError):
                module.composite(self.base, self.overlay, target)
        self.assertEqual(self.base.read_bytes(), self.original)

    def test_cannot_overwrite_existing_output(self):
        self.output.write_bytes(b"keep")
        with self.assertRaises(ValueError):
            self.run_composite()
        self.assertEqual(self.output.read_bytes(), b"keep")


if __name__ == "__main__":
    unittest.main()
