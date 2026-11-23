# Fonts

The game draws text with two fonts, declared in `client/src/index.css`: `text` (`client/public/font/text.ttf`) and `title` (`title.ttf`). `client/public/font/icons.ttf` and `icons.css` layer the pixel icons over both for emoji only, see `docs/emoji-icons.md`.

## Pixel digits

The digits 0-9 of `text.ttf` and `title.ttf` are drawn in the pixel style of x10y12pxDonguriDuel. `client/scripts/merge-digit-font.py` (`pnpm generate:digit-font` in `client/`) replaces those ten glyphs in both files, in place, from `client/scripts/fonts/x10y12pxDonguriDuel.ttf`. It is safe to rerun. Each source pixel becomes a whole number of units (167 in `text`, 194 in `title`, on the 2048 em) so edges stay sharp and the digits are as tall as the old ones; the advance is 6 pixels and the digit sits on the baseline. Change `TARGETS` in the script to resize them. Other characters (`+ - x % . /`) keep their original glyphs.

The icon font is a separate file, so `pnpm generate:icon-font` does not touch the digits.

## Credits and license

x10y12pxDonguriDuel, copyright hicc (https://hicchicc.github.io/00ff/), version 2025-01-10. It is under hicc's own license ("Original", not the OFL): the data generated from the font is free to use, including commercially and in a shipped game, modification and redistribution are allowed, selling the font itself is not, and credit is optional (given here anyway). Check the page above for the current terms.

The original Pixel Game font (1001fonts) was not used: its license forbids modification and commercial use.
