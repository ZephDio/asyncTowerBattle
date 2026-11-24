-- A saved game now holds the seed of its run (runSeed), which the client needs to continue it. The games saved before
-- have none, so they can't be continued: forget them. The players start a new game.
DELETE FROM "current_game";
