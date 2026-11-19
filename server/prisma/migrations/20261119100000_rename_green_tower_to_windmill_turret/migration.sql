-- The green tower became the windmill turret: rename its serialized type in every stored board.
UPDATE "player_board"
SET "board" = jsonb_set(
    "board",
    '{elements}',
    (
        SELECT jsonb_agg(
            CASE
                WHEN e->>'kind' = 'tower' AND e->>'type' = 'green'
                    THEN jsonb_set(e, '{type}', '"windmill-turret"')
                ELSE e
            END
        )
        FROM jsonb_array_elements("board"->'elements') AS e
    )
)
WHERE "board"->'elements' @> '[{"kind":"tower","type":"green"}]';
