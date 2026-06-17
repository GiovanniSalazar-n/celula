export const EDITOR_LANGUAGE_V2_EXAMPLES = {
  helperAttack: `def cell(health, nearby):
    if isEnemy("n"):
        return "an"
    return "d"`,
  loopExpansion: `def cell(health, nearby):
    for direction in emptyDirections():
        return "r" + direction
    return "d"`,
  boundedRange: `def cell(health, nearby):
    score = 0
    for i in range(0, 3):
        score = score + i
    if score > 2:
        return "d"
    return "mn"`,
} as const;
