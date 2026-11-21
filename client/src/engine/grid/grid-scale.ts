export const STANDARD_CELL_SIZE = 4.9;
// Visual dimensions in cells. The elf cabin sits below the middle of its upright sprite.
// Dwarf door centres are near rows 130 and 204 of the 224px sprite.
// Lift their midpoint to the board seam so they land half a cell on either side.
export const DWARF_CASTLE_LAYOUT = { width: 2.75, height: 3, overlap: 0.25, lift: 0.74 };
export const ELF_CASTLE_LAYOUT = { width: 3, height: 3, overlap: 0.5, lift: 0.7 };
