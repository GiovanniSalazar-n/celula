use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

const BOARD_ROWS: i32 = 100;
const BOARD_COLS: i32 = 200;
const DEFAULT_TURN_LIMIT: i32 = 5000;
const INITIAL_HEALTH: i32 = 100;
const MAX_HEALTH: i32 = 100;
const REST_HEAL: i32 = 3;
const EAT_DAMAGE: i32 = 5;
const INITIAL_AGE: i32 = 1;
const REPRODUCE_MIN_HEALTH: i32 = 50;
const REPRODUCE_MAX_AGE_EXCLUSIVE: i32 = 55;

const DIRECTIONS: [&str; 8] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const CELL_KEYS: [&str; 4] = ["health", "age", "row", "col"];
const ENVIRONMENT_KEYS: [&str; 22] = [
    "n",
    "s",
    "e",
    "w",
    "ne",
    "nw",
    "se",
    "sw",
    "team_health",
    "turn",
    "rows",
    "cols",
    "has_adjacent_ally",
    "has_adjacent_enemy",
    "enemy_count",
    "occupied_count",
    "empty_count",
    "first_enemy_direction",
    "north_occupied_count",
    "south_occupied_count",
    "east_occupied_count",
    "west_occupied_count",
];

#[wasm_bindgen]
pub fn validate_strategy_json(code: &str) -> Result<String, JsValue> {
    let result = validate_strategy(code);
    serde_json::to_string(&result).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn start_match_json(input_json: &str, seed: u32) -> Result<String, JsValue> {
    let input: MatchStartInput =
        serde_json::from_str(input_json).map_err(|error| JsValue::from_str(&error.to_string()))?;
    let result = start_match(input, seed);
    serde_json::to_string(&result).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn advance_simulation_json(state_json: &str, steps: u32) -> Result<String, JsValue> {
    let mut state: SimulationState =
        serde_json::from_str(state_json).map_err(|error| JsValue::from_str(&error.to_string()))?;
    let safe_steps = steps.max(1);

    for _ in 0..safe_steps {
        state = run_turn(state);
        if state.result.is_some() {
            break;
        }
    }

    serde_json::to_string(&state).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn end_simulation_early_json(state_json: &str) -> Result<String, JsValue> {
    let mut state: SimulationState =
        serde_json::from_str(state_json).map_err(|error| JsValue::from_str(&error.to_string()))?;

    if state.result.is_none() {
        state.result = Some(evaluate_manual_stop(&state.config.teams, &state.cells, state.current_turn));
        state.logs.push(TurnLog {
            turn: state.current_turn,
            log_type: "result".to_string(),
            message: format!("Match was ended early on turn {}.", state.current_turn),
            team_id: None,
            cell_id: None,
        });
    }

    state.status = "finished".to_string();
    serde_json::to_string(&state).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MatchStartInput {
    players: [PlayerSubmission; 2],
    turn_limit: Option<i32>,
}

#[derive(Clone, Debug, Deserialize)]
struct PlayerSubmission {
    name: String,
    color: String,
    code: String,
}

#[derive(Clone, Debug)]
struct StartMatchResult {
    match_: Option<SimulationState>,
    errors: Vec<String>,
}

impl Serialize for StartMatchResult {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("StartMatchResult", 2)?;
        state.serialize_field("match", &self.match_)?;
        state.serialize_field("errors", &self.errors)?;
        state.end()
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct SimulationState {
    status: String,
    locked: bool,
    config: MatchConfig,
    board: BoardState,
    cells: Vec<Cell>,
    current_turn: i32,
    logs: Vec<TurnLog>,
    result: Option<GameResult>,
    next_cell_id: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct MatchConfig {
    teams: [PlayerDefinition; 2],
    turn_limit: i32,
    board_rows: i32,
    board_cols: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct PlayerDefinition {
    id: i32,
    name: String,
    color: String,
    code: String,
    validation: ValidationResult,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidationResult {
    is_valid: bool,
    errors: Vec<String>,
    normalized_code: Option<String>,
    program: Option<StrategyProgram>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct StrategyProgram {
    body: Vec<Statement>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
enum Statement {
    #[serde(rename = "return")]
    Return { value: String },
    #[serde(rename = "if")]
    If {
        condition: Expression,
        consequent: Vec<Statement>,
        #[serde(skip_serializing_if = "Option::is_none")]
        alternate: Option<Vec<Statement>>,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
enum Expression {
    #[serde(rename = "literal")]
    Literal { value: LiteralValue },
    #[serde(rename = "lookup")]
    Lookup { source: String, key: String },
    #[serde(rename = "unary")]
    Unary {
        operator: String,
        expression: Box<Expression>,
    },
    #[serde(rename = "binary")]
    Binary {
        operator: String,
        left: Box<Expression>,
        right: Box<Expression>,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(untagged)]
enum LiteralValue {
    String(String),
    Number(i32),
    Bool(bool),
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct BoardState {
    rows: i32,
    cols: i32,
    occupancy: Vec<Option<String>>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Cell {
    id: String,
    team_id: i32,
    team_name: String,
    team_color: String,
    position: BoardPosition,
    health: i32,
    age: i32,
    alive: bool,
    creation_turn: i32,
    created_during_current_turn: bool,
    last_action: String,
    last_action_status: String,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
struct BoardPosition {
    row: i32,
    col: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct TurnLog {
    turn: i32,
    #[serde(rename = "type")]
    log_type: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    team_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    cell_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct GameResult {
    winner: Winner,
    reason: String,
    final_turn: i32,
    team_summaries: [TeamSummary; 2],
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(untagged)]
enum Winner {
    Team(i32),
    Draw(String),
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct TeamSummary {
    id: i32,
    name: String,
    color: String,
    living_cells: i32,
    total_health: i32,
    average_vitality: i32,
}

#[derive(Clone, Debug)]
struct Environment {
    neighbors: HashMap<String, String>,
    team_health: i32,
    turn: i32,
    rows: i32,
    cols: i32,
    has_adjacent_ally: bool,
    has_adjacent_enemy: bool,
    enemy_count: i32,
    occupied_count: i32,
    empty_count: i32,
    first_enemy_direction: String,
    north_occupied_count: i32,
    south_occupied_count: i32,
    east_occupied_count: i32,
    west_occupied_count: i32,
}

#[derive(Clone, Debug)]
struct ParsedAction {
    kind: ActionKind,
    direction: Option<String>,
    code: String,
}

#[derive(Clone, Debug, PartialEq)]
enum ActionKind {
    Rest,
    Move,
    Eat,
    Reproduce,
}

#[derive(Clone, Debug, PartialEq)]
enum RuntimeValue {
    String(String),
    Number(i32),
    Bool(bool),
}

#[derive(Clone, Debug)]
struct ActionFailure {
    team_id: i32,
    team_name: String,
    action_code: String,
    reason: String,
    count: i32,
}

#[derive(Clone, Debug)]
struct PreparedLine {
    line_number: usize,
    indent: usize,
    text: String,
}

#[derive(Clone, Debug)]
struct ParseBlockResult {
    statements: Vec<Statement>,
    next_index: usize,
}

#[derive(Clone, Debug)]
struct Token {
    token_type: TokenType,
    value: String,
}

#[derive(Clone, Debug, PartialEq)]
enum TokenType {
    Identifier,
    String,
    Number,
    Operator,
    Paren,
}

fn start_match(input: MatchStartInput, seed: u32) -> StartMatchResult {
    let errors = validate_match_setup(&input.players);
    if !errors.is_empty() {
        return StartMatchResult {
            match_: None,
            errors,
        };
    }

    let validation_one = validate_strategy(&input.players[0].code);
    let validation_two = validate_strategy(&input.players[1].code);

    let teams = [
        PlayerDefinition {
            id: 1,
            name: input.players[0].name.trim().to_string(),
            color: input.players[0].color.clone(),
            code: validation_one
                .normalized_code
                .clone()
                .unwrap_or_else(|| input.players[0].code.clone()),
            validation: validation_one,
        },
        PlayerDefinition {
            id: 2,
            name: input.players[1].name.trim().to_string(),
            color: input.players[1].color.clone(),
            code: validation_two
                .normalized_code
                .clone()
                .unwrap_or_else(|| input.players[1].code.clone()),
            validation: validation_two,
        },
    ];

    let mut rng = Lcg::new(seed);
    let cells = create_initial_cells(&teams, &mut rng);
    let board = build_board_from_cells(BOARD_ROWS, BOARD_COLS, &cells);

    StartMatchResult {
        match_: Some(SimulationState {
            status: "paused".to_string(),
            locked: true,
            config: MatchConfig {
                teams: teams.clone(),
                turn_limit: input.turn_limit.unwrap_or(DEFAULT_TURN_LIMIT),
                board_rows: BOARD_ROWS,
                board_cols: BOARD_COLS,
            },
            board,
            cells,
            current_turn: 1,
            logs: vec![TurnLog {
                turn: 0,
                log_type: "system".to_string(),
                message: format!("{} and {} deployed to the board.", teams[0].name, teams[1].name),
                team_id: None,
                cell_id: None,
            }],
            result: None,
            next_cell_id: 3,
        }),
        errors: vec![],
    }
}

fn validate_match_setup(players: &[PlayerSubmission; 2]) -> Vec<String> {
    let mut issues = Vec::new();
    let player_one_name = players[0].name.trim();
    let player_two_name = players[1].name.trim();

    if player_one_name.is_empty() {
        issues.push("Player 1 needs a team name.".to_string());
    }

    if player_two_name.is_empty() {
        issues.push("Player 2 needs a team name.".to_string());
    }

    if !player_one_name.is_empty()
        && !player_two_name.is_empty()
        && player_one_name.eq_ignore_ascii_case(player_two_name)
    {
        issues.push("Team names must be different.".to_string());
    }

    if !validate_strategy(&players[0].code).is_valid {
        issues.push("Player 1 strategy is invalid.".to_string());
    }

    if !validate_strategy(&players[1].code).is_valid {
        issues.push("Player 2 strategy is invalid.".to_string());
    }

    issues
}

fn validate_strategy(code: &str) -> ValidationResult {
    if code.trim().is_empty() {
        return invalid_validation("Code editor is empty.");
    }

    let normalized_code = normalize_code(code);
    let parsed = parse_strategy(&normalized_code);

    match parsed {
        Ok(program) => {
            let sample_cell = sample_cell();
            let sample_environment = sample_environment();
            let sample_action = execute_strategy(&program, &sample_cell, &sample_environment);

            if !sample_action
                .as_ref()
                .is_some_and(|action| parse_action_code(action).is_some())
            {
                return invalid_validation("Validation test context did not return a valid action code.");
            }

            ValidationResult {
                is_valid: true,
                errors: vec![],
                normalized_code: Some(normalized_code),
                program: Some(program),
            }
        }
        Err(error) => invalid_validation(&error),
    }
}

fn invalid_validation(message: &str) -> ValidationResult {
    ValidationResult {
        is_valid: false,
        errors: vec![message.to_string()],
        normalized_code: None,
        program: None,
    }
}

fn normalize_code(code: &str) -> String {
    code.replace("\r\n", "\n").replace('\t', "    ")
}

fn parse_strategy(normalized_code: &str) -> Result<StrategyProgram, String> {
    let lines = prepare_lines(normalized_code);
    if lines.is_empty() {
        return Err("Code editor is empty.".to_string());
    }

    if contains_forbidden_pattern(normalized_code) {
        return Err("Only the MVP subset is allowed. Loops, imports, and dangerous features are blocked.".to_string());
    }

    if lines[0].text != "def action(cell, environment):" {
        return Err("The function must be exactly `def action(cell, environment):`.".to_string());
    }

    let parsed = parse_block(&lines, 1, 4)?;
    if parsed.next_index != lines.len() {
        return Err(format!("Unexpected statement on line {}.", lines[parsed.next_index].line_number));
    }

    if parsed.statements.is_empty() {
        return Err("The function body must contain at least one return path.".to_string());
    }

    Ok(StrategyProgram {
        body: parsed.statements,
    })
}

fn contains_forbidden_pattern(source: &str) -> bool {
    if source.contains("__") {
        return true;
    }

    let forbidden = [
        "for", "while", "import", "from", "exec", "eval", "open", "class", "lambda", "try", "except", "with",
        "match", "case",
    ];
    let mut current = String::new();

    for character in source.chars() {
        if character.is_ascii_alphanumeric() || character == '_' {
            current.push(character);
            continue;
        }

        if forbidden.contains(&current.as_str()) {
            return true;
        }
        current.clear();
    }

    forbidden.contains(&current.as_str())
}

fn prepare_lines(code: &str) -> Vec<PreparedLine> {
    code.lines()
        .enumerate()
        .filter_map(|(index, raw_line)| {
            let without_comment = strip_comment(raw_line);
            let trimmed_end = without_comment.trim_end();
            let text = trimmed_end.trim().to_string();
            if text.is_empty() {
                return None;
            }

            let indent = trimmed_end
                .chars()
                .take_while(|character| character.is_whitespace())
                .count();

            Some(PreparedLine {
                line_number: index + 1,
                indent,
                text,
            })
        })
        .collect()
}

fn strip_comment(line: &str) -> String {
    let mut in_string = false;
    let mut quote = '\0';
    let mut escaped = false;

    for (index, character) in line.char_indices() {
        if escaped {
            escaped = false;
            continue;
        }

        if character == '\\' {
            escaped = true;
            continue;
        }

        if in_string {
            if character == quote {
                in_string = false;
                quote = '\0';
            }
            continue;
        }

        if character == '"' || character == '\'' {
            in_string = true;
            quote = character;
            continue;
        }

        if character == '#' {
            return line[..index].to_string();
        }
    }

    line.to_string()
}

fn parse_block(lines: &[PreparedLine], start_index: usize, expected_indent: usize) -> Result<ParseBlockResult, String> {
    let mut statements = Vec::new();
    let mut index = start_index;

    while index < lines.len() {
        let line = &lines[index];

        if line.indent < expected_indent {
            break;
        }

        if line.indent != expected_indent {
            return Err(format!("Unexpected indentation on line {}.", line.line_number));
        }

        if line.text.starts_with("if ") {
            let (statement, next_index) = parse_if_statement(lines, index, expected_indent)?;
            statements.push(statement);
            index = next_index;
            continue;
        }

        if line.text == "else:" {
            break;
        }

        if line.text.starts_with("return ") {
            statements.push(parse_return_statement(&line.text, line.line_number)?);
            index += 1;
            continue;
        }

        return Err(format!(
            "Unsupported statement on line {}. Only if/else and return are allowed.",
            line.line_number
        ));
    }

    Ok(ParseBlockResult {
        statements,
        next_index: index,
    })
}

fn parse_if_statement(
    lines: &[PreparedLine],
    start_index: usize,
    expected_indent: usize,
) -> Result<(Statement, usize), String> {
    let line = &lines[start_index];
    if !line.text.ends_with(':') {
        return Err(format!("If statement on line {} must end with a colon.", line.line_number));
    }

    let condition_text = line.text[3..line.text.len() - 1].trim();
    let condition = parse_expression(condition_text, line.line_number)?;
    let consequent = parse_block(lines, start_index + 1, expected_indent + 4)?;
    if consequent.statements.is_empty() {
        return Err(format!("If block on line {} must contain a return path.", line.line_number));
    }

    if let Some(next_line) = lines.get(consequent.next_index) {
        if next_line.indent == expected_indent && next_line.text == "else:" {
            let alternate = parse_block(lines, consequent.next_index + 1, expected_indent + 4)?;
            if alternate.statements.is_empty() {
                return Err(format!(
                    "Else block on line {} must contain a return path.",
                    next_line.line_number
                ));
            }

            return Ok((
                Statement::If {
                    condition,
                    consequent: consequent.statements,
                    alternate: Some(alternate.statements),
                },
                alternate.next_index,
            ));
        }
    }

    Ok((
        Statement::If {
            condition,
            consequent: consequent.statements,
            alternate: None,
        },
        consequent.next_index,
    ))
}

fn parse_return_statement(text: &str, line_number: usize) -> Result<Statement, String> {
    let literal_text = text["return ".len()..].trim();
    let value = parse_string_literal(literal_text, line_number)?;

    if parse_action_code(&value).is_none() {
        return Err(format!(
            "Return value on line {} must be a valid action code literal.",
            line_number
        ));
    }

    Ok(Statement::Return { value })
}

fn parse_string_literal(value: &str, line_number: usize) -> Result<String, String> {
    if value.len() < 2 {
        return Err(format!("Return value on line {} must be a string literal.", line_number));
    }

    let quote = value.chars().next().unwrap_or('\0');
    if (quote != '"' && quote != '\'') || !value.ends_with(quote) {
        return Err(format!("Line {} must use a quoted string literal.", line_number));
    }

    let body = &value[1..value.len() - 1];
    Ok(body.replace("\\\"", "\"").replace("\\'", "'").replace("\\\\", "\\"))
}

fn parse_expression(source: &str, line_number: usize) -> Result<Expression, String> {
    let tokens = tokenize(source, line_number)?;
    let mut parser = ExpressionParser {
        tokens,
        index: 0,
        line_number,
    };
    let expression = parser.parse_or()?;

    if parser.index != parser.tokens.len() {
        return Err(format!("Unsupported expression tail on line {}.", line_number));
    }

    Ok(expression)
}

struct ExpressionParser {
    tokens: Vec<Token>,
    index: usize,
    line_number: usize,
}

impl ExpressionParser {
    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.index)
    }

    fn consume(&mut self, expected_value: Option<&str>) -> Result<Token, String> {
        let token = self
            .tokens
            .get(self.index)
            .cloned()
            .ok_or_else(|| format!("Unexpected end of expression on line {}.", self.line_number))?;

        if let Some(expected) = expected_value {
            if token.value != expected {
                return Err(format!("Expected `{}` on line {}.", expected, self.line_number));
            }
        }

        self.index += 1;
        Ok(token)
    }

    fn parse_or(&mut self) -> Result<Expression, String> {
        let mut expression = self.parse_and()?;
        while self.peek().is_some_and(|token| token.value == "or") {
            self.consume(Some("or"))?;
            expression = Expression::Binary {
                operator: "or".to_string(),
                left: Box::new(expression),
                right: Box::new(self.parse_and()?),
            };
        }
        Ok(expression)
    }

    fn parse_and(&mut self) -> Result<Expression, String> {
        let mut expression = self.parse_not()?;
        while self.peek().is_some_and(|token| token.value == "and") {
            self.consume(Some("and"))?;
            expression = Expression::Binary {
                operator: "and".to_string(),
                left: Box::new(expression),
                right: Box::new(self.parse_not()?),
            };
        }
        Ok(expression)
    }

    fn parse_not(&mut self) -> Result<Expression, String> {
        if self.peek().is_some_and(|token| token.value == "not") {
            self.consume(Some("not"))?;
            return Ok(Expression::Unary {
                operator: "not".to_string(),
                expression: Box::new(self.parse_not()?),
            });
        }

        self.parse_comparison()
    }

    fn parse_comparison(&mut self) -> Result<Expression, String> {
        let left = self.parse_primary()?;
        let operator = self.peek().map(|token| token.value.clone());

        if let Some(operator) = operator {
            if ["==", "!=", "<", "<=", ">", ">="].contains(&operator.as_str()) {
                self.consume(Some(&operator))?;
                return Ok(Expression::Binary {
                    operator,
                    left: Box::new(left),
                    right: Box::new(self.parse_primary()?),
                });
            }
        }

        Ok(left)
    }

    fn parse_primary(&mut self) -> Result<Expression, String> {
        let token = self
            .peek()
            .cloned()
            .ok_or_else(|| format!("Unexpected end of expression on line {}.", self.line_number))?;

        if token.token_type == TokenType::Paren && token.value == "(" {
            self.consume(Some("("))?;
            let expression = self.parse_or()?;
            self.consume(Some(")"))?;
            return Ok(expression);
        }

        if token.token_type == TokenType::Number {
            self.consume(None)?;
            return Ok(Expression::Literal {
                value: LiteralValue::Number(token.value.parse::<i32>().unwrap_or(0)),
            });
        }

        if token.token_type == TokenType::String {
            self.consume(None)?;
            return Ok(Expression::Literal {
                value: LiteralValue::String(token.value),
            });
        }

        if token.token_type == TokenType::Identifier {
            if token.value == "True" || token.value == "False" {
                self.consume(None)?;
                return Ok(Expression::Literal {
                    value: LiteralValue::Bool(token.value == "True"),
                });
            }

            if token.value != "cell" && token.value != "environment" {
                return Err(format!(
                    "Only `cell[\"...\"]` and `environment[\"...\"]` lookups are allowed on line {}.",
                    self.line_number
                ));
            }

            let source = self.consume(None)?.value;
            self.consume(Some("["))?;
            let key_token = self.consume(None)?;
            if key_token.token_type != TokenType::String {
                return Err(format!("Lookup keys must be string literals on line {}.", self.line_number));
            }
            self.consume(Some("]"))?;

            let allowed = if source == "cell" {
                CELL_KEYS.contains(&key_token.value.as_str())
            } else {
                ENVIRONMENT_KEYS.contains(&key_token.value.as_str())
            };

            if !allowed {
                return Err(format!(
                    "Lookup key \"{}\" is not allowed on line {}.",
                    key_token.value, self.line_number
                ));
            }

            return Ok(Expression::Lookup {
                source,
                key: key_token.value,
            });
        }

        Err(format!("Unsupported expression on line {}.", self.line_number))
    }
}

fn tokenize(source: &str, line_number: usize) -> Result<Vec<Token>, String> {
    let chars: Vec<char> = source.chars().collect();
    let mut tokens = Vec::new();
    let mut index = 0;

    while index < chars.len() {
        let character = chars[index];

        if character.is_whitespace() {
            index += 1;
            continue;
        }

        if index + 1 < chars.len() {
            let two = format!("{}{}", chars[index], chars[index + 1]);
            if ["==", "!=", "<=", ">="].contains(&two.as_str()) {
                tokens.push(Token {
                    token_type: TokenType::Operator,
                    value: two,
                });
                index += 2;
                continue;
            }
        }

        if ['<', '>', '[', ']'].contains(&character) {
            tokens.push(Token {
                token_type: TokenType::Operator,
                value: character.to_string(),
            });
            index += 1;
            continue;
        }

        if character == '(' || character == ')' {
            tokens.push(Token {
                token_type: TokenType::Paren,
                value: character.to_string(),
            });
            index += 1;
            continue;
        }

        if character == '"' || character == '\'' {
            let end = find_string_end(&chars, index, character)
                .ok_or_else(|| format!("Unterminated string literal on line {}.", line_number))?;
            let literal: String = chars[index..=end].iter().collect();
            tokens.push(Token {
                token_type: TokenType::String,
                value: parse_string_literal(&literal, line_number)?,
            });
            index = end + 1;
            continue;
        }

        if character.is_ascii_digit() {
            let start = index;
            while index < chars.len() && chars[index].is_ascii_digit() {
                index += 1;
            }
            tokens.push(Token {
                token_type: TokenType::Number,
                value: chars[start..index].iter().collect(),
            });
            continue;
        }

        if character.is_ascii_alphabetic() || character == '_' {
            let start = index;
            while index < chars.len() && (chars[index].is_ascii_alphanumeric() || chars[index] == '_') {
                index += 1;
            }
            tokens.push(Token {
                token_type: TokenType::Identifier,
                value: chars[start..index].iter().collect(),
            });
            continue;
        }

        return Err(format!("Unexpected token `{}` on line {}.", character, line_number));
    }

    Ok(tokens)
}

fn find_string_end(chars: &[char], start_index: usize, quote: char) -> Option<usize> {
    let mut escaped = false;

    for (index, character) in chars.iter().enumerate().skip(start_index + 1) {
        if escaped {
            escaped = false;
            continue;
        }
        if *character == '\\' {
            escaped = true;
            continue;
        }
        if *character == quote {
            return Some(index);
        }
    }

    None
}

struct Lcg {
    seed: u32,
}

impl Lcg {
    fn new(seed: u32) -> Self {
        Self {
            seed: if seed == 0 { 1 } else { seed },
        }
    }

    fn next_f64(&mut self) -> f64 {
        self.seed = self.seed.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
        self.seed as f64 / u32::MAX as f64
    }
}

fn create_initial_cells(teams: &[PlayerDefinition; 2], rng: &mut Lcg) -> Vec<Cell> {
    let mut board = BoardState {
        rows: BOARD_ROWS,
        cols: BOARD_COLS,
        occupancy: vec![None; (BOARD_ROWS * BOARD_COLS) as usize],
    };
    let mut cells = Vec::new();

    for (index, team) in teams.iter().enumerate() {
        let mut row;
        let mut col;

        loop {
            row = (rng.next_f64() * BOARD_ROWS as f64).floor() as i32;
            col = (rng.next_f64() * BOARD_COLS as f64).floor() as i32;
            if get_cell_id(&board, row, col).is_none() {
                break;
            }
        }

        let cell = Cell {
            id: format!("cell-{}", index + 1),
            team_id: team.id,
            team_name: team.name.clone(),
            team_color: team.color.clone(),
            position: BoardPosition { row, col },
            health: INITIAL_HEALTH,
            age: INITIAL_AGE,
            alive: true,
            creation_turn: 0,
            created_during_current_turn: false,
            last_action: "none".to_string(),
            last_action_status: "none".to_string(),
        };

        set_cell(&mut board, row, col, Some(cell.id.clone()));
        cells.push(cell);
    }

    cells
}

fn build_board_from_cells(rows: i32, cols: i32, cells: &[Cell]) -> BoardState {
    let mut board = BoardState {
        rows,
        cols,
        occupancy: vec![None; (rows * cols) as usize],
    };

    for cell in cells {
        if cell.alive {
            set_cell(
                &mut board,
                cell.position.row,
                cell.position.col,
                Some(cell.id.clone()),
            );
        }
    }

    board
}

fn sample_cell() -> Cell {
    Cell {
        id: "sample".to_string(),
        team_id: 1,
        team_name: "Sample".to_string(),
        team_color: "#fff".to_string(),
        position: BoardPosition { row: 10, col: 10 },
        health: 100,
        age: 1,
        alive: true,
        creation_turn: 0,
        created_during_current_turn: false,
        last_action: "none".to_string(),
        last_action_status: "none".to_string(),
    }
}

fn sample_environment() -> Environment {
    let mut neighbors = HashMap::new();
    neighbors.insert("n".to_string(), "empty".to_string());
    neighbors.insert("s".to_string(), "enemy".to_string());
    neighbors.insert("e".to_string(), "allied".to_string());
    neighbors.insert("w".to_string(), "outside".to_string());
    neighbors.insert("ne".to_string(), "empty".to_string());
    neighbors.insert("nw".to_string(), "outside".to_string());
    neighbors.insert("se".to_string(), "enemy".to_string());
    neighbors.insert("sw".to_string(), "allied".to_string());

    Environment {
        neighbors,
        team_health: 100,
        turn: 1,
        rows: BOARD_ROWS,
        cols: BOARD_COLS,
        has_adjacent_ally: true,
        has_adjacent_enemy: true,
        enemy_count: 2,
        occupied_count: 4,
        empty_count: 4,
        first_enemy_direction: "s".to_string(),
        north_occupied_count: 1,
        south_occupied_count: 2,
        east_occupied_count: 1,
        west_occupied_count: 0,
    }
}

fn run_turn(mut state: SimulationState) -> SimulationState {
    if state.result.is_some() {
        state.status = "finished".to_string();
        return state;
    }

    let turn = state.current_turn;
    let mut cells = state.cells.clone();
    let mut board = state.board.clone();
    let mut cells_by_id = build_cells_by_id(&cells);
    let ordered_ids = build_turn_order(&cells);
    let mut team_health = calculate_team_health(&cells);
    let mut failures: HashMap<String, ActionFailure> = HashMap::new();
    let mut next_cell_id = state.next_cell_id;
    let team_programs = [
        state.config.teams[0].validation.program.clone(),
        state.config.teams[1].validation.program.clone(),
    ];

    for cell_id in ordered_ids {
        let Some(cell_index) = cells_by_id.get(&cell_id).copied() else {
            continue;
        };
        if !cells[cell_index].alive {
            continue;
        }

        let team_index = if cells[cell_index].team_id == state.config.teams[0].id {
            0
        } else {
            1
        };

        let Some(program) = &team_programs[team_index] else {
            cells[cell_index].last_action = "invalid".to_string();
            cells[cell_index].last_action_status = "invalid".to_string();
            state.logs.push(TurnLog {
                turn,
                log_type: "error".to_string(),
                message: format!("{} has no validated strategy. The cell lost its action.", cells[cell_index].team_name),
                team_id: Some(cells[cell_index].team_id),
                cell_id: Some(cells[cell_index].id.clone()),
            });
            continue;
        };

        let environment = build_environment(
            &state,
            &board,
            &cells,
            &cells_by_id,
            cell_index,
            *team_health.get(&cells[cell_index].team_id).unwrap_or(&0),
        );
        let action = execute_strategy(program, &cells[cell_index], &environment);

        let Some(action_code) = action else {
            cells[cell_index].last_action = "invalid".to_string();
            cells[cell_index].last_action_status = "error".to_string();
            state.logs.push(TurnLog {
                turn,
                log_type: "error".to_string(),
                message: format!(
                    "{} produced a runtime error at ({}, {}). The cell lost its action.",
                    cells[cell_index].team_name, cells[cell_index].position.row, cells[cell_index].position.col
                ),
                team_id: Some(cells[cell_index].team_id),
                cell_id: Some(cells[cell_index].id.clone()),
            });
            continue;
        };

        let Some(parsed_action) = parse_action_code(&action_code) else {
            cells[cell_index].last_action = action_code.clone();
            cells[cell_index].last_action_status = "invalid".to_string();
            state.logs.push(TurnLog {
                turn,
                log_type: "error".to_string(),
                message: format!(
                    "{} returned \"{}\", which is not a valid action code.",
                    cells[cell_index].team_name, action_code
                ),
                team_id: Some(cells[cell_index].team_id),
                cell_id: Some(cells[cell_index].id.clone()),
            });
            continue;
        };

        cells[cell_index].last_action = parsed_action.code.clone();
        let acting_health_before = cells[cell_index].health;
        let target_index_before = if parsed_action.kind == ActionKind::Eat {
            resolve_target_index(&board, &cells_by_id, &cells[cell_index], parsed_action.direction.as_deref().unwrap_or(""))
        } else {
            None
        };
        let target_health_before = target_index_before.map(|index| cells[index].health).unwrap_or(0);

        let failure_reason = resolve_action(
            &mut board,
            &mut cells,
            &mut cells_by_id,
            cell_index,
            &parsed_action,
            turn,
            &mut next_cell_id,
        );

        if let Some(reason) = failure_reason {
            record_action_failure(&mut failures, &cells[cell_index], &parsed_action.code, &reason);
        }

        if parsed_action.kind == ActionKind::Rest {
            let entry = team_health.entry(cells[cell_index].team_id).or_insert(0);
            *entry += cells[cell_index].health - acting_health_before;
        }

        if let Some(target_index) = target_index_before {
            let entry = team_health.entry(cells[target_index].team_id).or_insert(0);
            *entry += cells[target_index].health - target_health_before;
        }
    }

    for failure in failures.values() {
        state.logs.push(TurnLog {
            turn,
            log_type: "action_failure".to_string(),
            message: format!(
                "{} had {} blocked {} for {}: {}",
                failure.team_name,
                failure.count,
                if failure.count == 1 { "action" } else { "actions" },
                failure.action_code,
                failure.reason
            ),
            team_id: Some(failure.team_id),
            cell_id: None,
        });
    }

    let mut living_cells = Vec::with_capacity(cells.len());
    for mut cell in cells {
        if !cell.alive {
            continue;
        }
        cell.age += 1;
        cell.created_during_current_turn = false;
        living_cells.push(cell);
    }

    let result = evaluate_result(&state.config.teams, &living_cells, turn, state.config.turn_limit);
    if let Some(result_value) = &result {
        state.logs.push(TurnLog {
            turn,
            log_type: "result".to_string(),
            message: if matches!(result_value.winner, Winner::Draw(_)) {
                format!("Match ended in a draw on turn {}.", turn)
            } else {
                let winner_name = result_value
                    .team_summaries
                    .iter()
                    .find(|summary| matches!(result_value.winner, Winner::Team(id) if id == summary.id))
                    .map(|summary| summary.name.clone())
                    .unwrap_or_else(|| "A team".to_string());
                format!("{} won on turn {}.", winner_name, turn)
            },
            team_id: None,
            cell_id: None,
        });
    }

    state.status = if result.is_some() {
        "finished".to_string()
    } else {
        state.status
    };
    state.board = board;
    state.cells = living_cells;
    state.current_turn = if result.is_some() { turn } else { turn + 1 };
    state.result = result;
    state.next_cell_id = next_cell_id;
    state
}

fn build_cells_by_id(cells: &[Cell]) -> HashMap<String, usize> {
    cells
        .iter()
        .enumerate()
        .map(|(index, cell)| (cell.id.clone(), index))
        .collect()
}

fn build_turn_order(cells: &[Cell]) -> Vec<String> {
    let mut ordered: Vec<&Cell> = cells.iter().filter(|cell| cell.alive).collect();
    ordered.sort_by(|left, right| {
        left.age
            .cmp(&right.age)
            .then(left.creation_turn.cmp(&right.creation_turn))
            .then(left.position.row.cmp(&right.position.row))
            .then(left.position.col.cmp(&right.position.col))
    });
    ordered.into_iter().map(|cell| cell.id.clone()).collect()
}

fn calculate_team_health(cells: &[Cell]) -> HashMap<i32, i32> {
    let mut totals = HashMap::new();
    for cell in cells {
        if cell.alive {
            *totals.entry(cell.team_id).or_insert(0) += cell.health;
        }
    }
    totals
}

fn build_environment(
    state: &SimulationState,
    board: &BoardState,
    cells: &[Cell],
    cells_by_id: &HashMap<String, usize>,
    cell_index: usize,
    team_health: i32,
) -> Environment {
    let cell = &cells[cell_index];
    let mut neighbors = HashMap::new();
    let mut has_adjacent_ally = false;
    let mut has_adjacent_enemy = false;
    let mut enemy_count = 0;
    let mut occupied_count = 0;
    let mut empty_count = 0;
    let mut first_enemy_direction = "none".to_string();
    let mut north_occupied_count = 0;
    let mut south_occupied_count = 0;
    let mut east_occupied_count = 0;
    let mut west_occupied_count = 0;

    for direction in DIRECTIONS {
        let (row_delta, col_delta) = direction_delta(direction);
        let row = cell.position.row + row_delta;
        let col = cell.position.col + col_delta;
        let mut neighbor = "outside".to_string();

        if is_inside(board, row, col) {
            if let Some(occupant_id) = get_cell_id(board, row, col) {
                if let Some(occupant_index) = cells_by_id.get(occupant_id) {
                    neighbor = if cells[*occupant_index].team_id == cell.team_id {
                        "allied".to_string()
                    } else {
                        "enemy".to_string()
                    };
                }
            } else {
                neighbor = "empty".to_string();
            }
        }

        if neighbor == "allied" {
            has_adjacent_ally = true;
            occupied_count += 1;
        } else if neighbor == "enemy" {
            has_adjacent_enemy = true;
            enemy_count += 1;
            occupied_count += 1;
            if first_enemy_direction == "none" {
                first_enemy_direction = direction.to_string();
            }
        } else if neighbor == "empty" {
            empty_count += 1;
        }

        if neighbor != "empty" && neighbor != "outside" {
            if matches!(direction, "nw" | "n" | "ne") {
                north_occupied_count += 1;
            }
            if matches!(direction, "sw" | "s" | "se") {
                south_occupied_count += 1;
            }
            if matches!(direction, "ne" | "e" | "se") {
                east_occupied_count += 1;
            }
            if matches!(direction, "nw" | "w" | "sw") {
                west_occupied_count += 1;
            }
        }

        neighbors.insert(direction.to_string(), neighbor);
    }

    Environment {
        neighbors,
        team_health,
        turn: state.current_turn,
        rows: state.config.board_rows,
        cols: state.config.board_cols,
        has_adjacent_ally,
        has_adjacent_enemy,
        enemy_count,
        occupied_count,
        empty_count,
        first_enemy_direction,
        north_occupied_count,
        south_occupied_count,
        east_occupied_count,
        west_occupied_count,
    }
}

fn execute_strategy(program: &StrategyProgram, cell: &Cell, environment: &Environment) -> Option<String> {
    execute_statements(&program.body, cell, environment)
}

fn execute_statements(statements: &[Statement], cell: &Cell, environment: &Environment) -> Option<String> {
    for statement in statements {
        if let Some(action) = execute_statement(statement, cell, environment) {
            return Some(action);
        }
    }
    None
}

fn execute_statement(statement: &Statement, cell: &Cell, environment: &Environment) -> Option<String> {
    match statement {
        Statement::Return { value } => Some(value.clone()),
        Statement::If {
            condition,
            consequent,
            alternate,
        } => {
            if to_bool(&evaluate_expression(condition, cell, environment)) {
                execute_statements(consequent, cell, environment)
            } else {
                alternate
                    .as_ref()
                    .and_then(|statements| execute_statements(statements, cell, environment))
            }
        }
    }
}

fn evaluate_expression(expression: &Expression, cell: &Cell, environment: &Environment) -> RuntimeValue {
    match expression {
        Expression::Literal { value } => match value {
            LiteralValue::String(value) => RuntimeValue::String(value.clone()),
            LiteralValue::Number(value) => RuntimeValue::Number(*value),
            LiteralValue::Bool(value) => RuntimeValue::Bool(*value),
        },
        Expression::Lookup { source, key } => lookup_value(source, key, cell, environment),
        Expression::Unary { expression, .. } => RuntimeValue::Bool(!to_bool(&evaluate_expression(expression, cell, environment))),
        Expression::Binary {
            operator,
            left,
            right,
        } => evaluate_binary(operator, left, right, cell, environment),
    }
}

fn evaluate_binary(
    operator: &str,
    left: &Expression,
    right: &Expression,
    cell: &Cell,
    environment: &Environment,
) -> RuntimeValue {
    let left_value = evaluate_expression(left, cell, environment);
    let right_value = evaluate_expression(right, cell, environment);

    RuntimeValue::Bool(match operator {
        "and" => to_bool(&left_value) && to_bool(&right_value),
        "or" => to_bool(&left_value) || to_bool(&right_value),
        "==" => left_value == right_value,
        "!=" => left_value != right_value,
        "<" => to_number(&left_value) < to_number(&right_value),
        "<=" => to_number(&left_value) <= to_number(&right_value),
        ">" => to_number(&left_value) > to_number(&right_value),
        ">=" => to_number(&left_value) >= to_number(&right_value),
        _ => false,
    })
}

fn lookup_value(source: &str, key: &str, cell: &Cell, environment: &Environment) -> RuntimeValue {
    if source == "cell" {
        return RuntimeValue::Number(match key {
            "health" => cell.health,
            "age" => cell.age,
            "row" => cell.position.row,
            "col" => cell.position.col,
            _ => 0,
        });
    }

    match key {
        "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" => RuntimeValue::String(
            environment
                .neighbors
                .get(key)
                .cloned()
                .unwrap_or_else(|| "outside".to_string()),
        ),
        "team_health" => RuntimeValue::Number(environment.team_health),
        "turn" => RuntimeValue::Number(environment.turn),
        "rows" => RuntimeValue::Number(environment.rows),
        "cols" => RuntimeValue::Number(environment.cols),
        "has_adjacent_ally" => RuntimeValue::Bool(environment.has_adjacent_ally),
        "has_adjacent_enemy" => RuntimeValue::Bool(environment.has_adjacent_enemy),
        "enemy_count" => RuntimeValue::Number(environment.enemy_count),
        "occupied_count" => RuntimeValue::Number(environment.occupied_count),
        "empty_count" => RuntimeValue::Number(environment.empty_count),
        "first_enemy_direction" => RuntimeValue::String(environment.first_enemy_direction.clone()),
        "north_occupied_count" => RuntimeValue::Number(environment.north_occupied_count),
        "south_occupied_count" => RuntimeValue::Number(environment.south_occupied_count),
        "east_occupied_count" => RuntimeValue::Number(environment.east_occupied_count),
        "west_occupied_count" => RuntimeValue::Number(environment.west_occupied_count),
        _ => RuntimeValue::String(String::new()),
    }
}

fn to_bool(value: &RuntimeValue) -> bool {
    match value {
        RuntimeValue::Bool(value) => *value,
        RuntimeValue::Number(value) => *value != 0,
        RuntimeValue::String(value) => !value.is_empty(),
    }
}

fn to_number(value: &RuntimeValue) -> i32 {
    match value {
        RuntimeValue::Number(value) => *value,
        RuntimeValue::Bool(value) => i32::from(*value),
        RuntimeValue::String(value) => value.parse().unwrap_or(0),
    }
}

fn parse_action_code(value: &str) -> Option<ParsedAction> {
    if value == "d" {
        return Some(ParsedAction {
            kind: ActionKind::Rest,
            direction: None,
            code: value.to_string(),
        });
    }

    if value.len() < 2 {
        return None;
    }

    let (prefix, direction) = value.split_at(1);
    if !DIRECTIONS.contains(&direction) {
        return None;
    }

    let kind = match prefix {
        "m" => ActionKind::Move,
        "a" => ActionKind::Eat,
        "r" => ActionKind::Reproduce,
        _ => return None,
    };

    Some(ParsedAction {
        kind,
        direction: Some(direction.to_string()),
        code: value.to_string(),
    })
}

fn resolve_action(
    board: &mut BoardState,
    cells: &mut Vec<Cell>,
    cells_by_id: &mut HashMap<String, usize>,
    cell_index: usize,
    action: &ParsedAction,
    turn: i32,
    next_cell_id: &mut i32,
) -> Option<String> {
    if !cells[cell_index].alive {
        return Some("cell is no longer alive.".to_string());
    }

    if action.kind == ActionKind::Rest {
        cells[cell_index].health = MAX_HEALTH.min(cells[cell_index].health + REST_HEAL);
        cells[cell_index].last_action_status = "success".to_string();
        return None;
    }

    let direction = action.direction.as_deref().unwrap_or("");
    let (row_delta, col_delta) = direction_delta(direction);
    let target_row = cells[cell_index].position.row + row_delta;
    let target_col = cells[cell_index].position.col + col_delta;

    if !is_inside(board, target_row, target_col) {
        cells[cell_index].last_action_status = "failed".to_string();
        return Some("target is outside the board.".to_string());
    }

    let occupant_index = get_cell_id(board, target_row, target_col)
        .and_then(|id| cells_by_id.get(id).copied());

    if action.kind == ActionKind::Move {
        if occupant_index.is_some() {
            cells[cell_index].last_action_status = "failed".to_string();
            return Some("destination is occupied.".to_string());
        }

        let from = cells[cell_index].position;
        clear_cell(board, from.row, from.col);
        set_cell(board, target_row, target_col, Some(cells[cell_index].id.clone()));
        cells[cell_index].position = BoardPosition {
            row: target_row,
            col: target_col,
        };
        cells[cell_index].last_action_status = "success".to_string();
        return None;
    }

    if action.kind == ActionKind::Eat {
        let Some(target_index) = occupant_index else {
            cells[cell_index].last_action_status = "failed".to_string();
            return Some("target square is empty.".to_string());
        };

        if !cells[target_index].alive {
            cells[cell_index].last_action_status = "failed".to_string();
            return Some("target is not alive.".to_string());
        }

        if cells[target_index].team_id == cells[cell_index].team_id {
            cells[cell_index].last_action_status = "failed".to_string();
            return Some("target belongs to the same team.".to_string());
        }

        cells[target_index].health = 0.max(cells[target_index].health - EAT_DAMAGE);
        if cells[target_index].health == 0 {
            cells[target_index].alive = false;
            clear_cell(board, cells[target_index].position.row, cells[target_index].position.col);
        }
        cells[cell_index].last_action_status = "success".to_string();
        return None;
    }

    if cells[cell_index].health < REPRODUCE_MIN_HEALTH {
        cells[cell_index].last_action_status = "failed".to_string();
        return Some(format!("reproduction requires at least {} health.", REPRODUCE_MIN_HEALTH));
    }

    if cells[cell_index].age >= REPRODUCE_MAX_AGE_EXCLUSIVE {
        cells[cell_index].last_action_status = "failed".to_string();
        return Some(format!(
            "reproduction requires age below {}.",
            REPRODUCE_MAX_AGE_EXCLUSIVE
        ));
    }

    if occupant_index.is_some() {
        cells[cell_index].last_action_status = "failed".to_string();
        return Some("destination is occupied.".to_string());
    }

    let child_health = cells[cell_index].health / 2;
    cells[cell_index].health -= child_health;
    cells[cell_index].last_action_status = "success".to_string();

    let child_id = format!("cell-{}", *next_cell_id);
    *next_cell_id += 1;
    let child = Cell {
        id: child_id.clone(),
        team_id: cells[cell_index].team_id,
        team_name: cells[cell_index].team_name.clone(),
        team_color: cells[cell_index].team_color.clone(),
        position: BoardPosition {
            row: target_row,
            col: target_col,
        },
        health: child_health,
        age: INITIAL_AGE,
        alive: true,
        creation_turn: turn,
        created_during_current_turn: true,
        last_action: "born".to_string(),
        last_action_status: "none".to_string(),
    };

    cells.push(child);
    cells_by_id.insert(child_id.clone(), cells.len() - 1);
    set_cell(board, target_row, target_col, Some(child_id));
    None
}

fn resolve_target_index(
    board: &BoardState,
    cells_by_id: &HashMap<String, usize>,
    cell: &Cell,
    direction: &str,
) -> Option<usize> {
    let (row_delta, col_delta) = direction_delta(direction);
    let row = cell.position.row + row_delta;
    let col = cell.position.col + col_delta;
    get_cell_id(board, row, col).and_then(|id| cells_by_id.get(id).copied())
}

fn record_action_failure(
    failures: &mut HashMap<String, ActionFailure>,
    cell: &Cell,
    action_code: &str,
    reason: &str,
) {
    let key = format!("{}:{}:{}", cell.team_id, action_code, reason);
    if let Some(existing) = failures.get_mut(&key) {
        existing.count += 1;
        return;
    }

    failures.insert(
        key,
        ActionFailure {
            team_id: cell.team_id,
            team_name: cell.team_name.clone(),
            action_code: action_code.to_string(),
            reason: reason.to_string(),
            count: 1,
        },
    );
}

fn evaluate_result(teams: &[PlayerDefinition; 2], cells: &[Cell], turn: i32, turn_limit: i32) -> Option<GameResult> {
    let summaries = summarize_teams(teams, cells);
    let team_one = &summaries[0];
    let team_two = &summaries[1];

    if team_one.living_cells == 0 && team_two.living_cells == 0 {
        return Some(GameResult {
            winner: Winner::Draw("draw".to_string()),
            reason: "double_elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        });
    }

    if team_one.living_cells == 0 {
        return Some(GameResult {
            winner: Winner::Team(team_two.id),
            reason: "elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        });
    }

    if team_two.living_cells == 0 {
        return Some(GameResult {
            winner: Winner::Team(team_one.id),
            reason: "elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        });
    }

    if turn < turn_limit {
        return None;
    }

    Some(resolve_winner_by_score(summaries, turn, "turn_limit"))
}

fn evaluate_manual_stop(teams: &[PlayerDefinition; 2], cells: &[Cell], turn: i32) -> GameResult {
    let summaries = summarize_teams(teams, cells);
    let team_one = &summaries[0];
    let team_two = &summaries[1];

    if team_one.living_cells == 0 && team_two.living_cells == 0 {
        return GameResult {
            winner: Winner::Draw("draw".to_string()),
            reason: "double_elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        };
    }

    if team_one.living_cells == 0 {
        return GameResult {
            winner: Winner::Team(team_two.id),
            reason: "elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        };
    }

    if team_two.living_cells == 0 {
        return GameResult {
            winner: Winner::Team(team_one.id),
            reason: "elimination".to_string(),
            final_turn: turn,
            team_summaries: summaries,
        };
    }

    resolve_winner_by_score(summaries, turn, "manual_stop")
}

fn summarize_teams(teams: &[PlayerDefinition; 2], cells: &[Cell]) -> [TeamSummary; 2] {
    teams.clone().map(|team| {
        let living: Vec<&Cell> = cells
            .iter()
            .filter(|cell| cell.alive && cell.team_id == team.id)
            .collect();
        let total_health = living.iter().map(|cell| cell.health).sum::<i32>();
        TeamSummary {
            id: team.id,
            name: team.name,
            color: team.color,
            living_cells: living.len() as i32,
            total_health,
            average_vitality: if living.is_empty() {
                0
            } else {
                ((total_health as f64) / (living.len() as f64)).round() as i32
            },
        }
    })
}

fn resolve_winner_by_score(summaries: [TeamSummary; 2], turn: i32, reason: &str) -> GameResult {
    let team_one = &summaries[0];
    let team_two = &summaries[1];

    let winner = if team_one.living_cells != team_two.living_cells {
        if team_one.living_cells > team_two.living_cells {
            Winner::Team(team_one.id)
        } else {
            Winner::Team(team_two.id)
        }
    } else if team_one.total_health != team_two.total_health {
        if team_one.total_health > team_two.total_health {
            Winner::Team(team_one.id)
        } else {
            Winner::Team(team_two.id)
        }
    } else {
        Winner::Draw("draw".to_string())
    };

    GameResult {
        winner,
        reason: reason.to_string(),
        final_turn: turn,
        team_summaries: summaries,
    }
}

fn direction_delta(direction: &str) -> (i32, i32) {
    match direction {
        "n" => (-1, 0),
        "s" => (1, 0),
        "e" => (0, 1),
        "w" => (0, -1),
        "ne" => (-1, 1),
        "nw" => (-1, -1),
        "se" => (1, 1),
        "sw" => (1, -1),
        _ => (0, 0),
    }
}

fn is_inside(board: &BoardState, row: i32, col: i32) -> bool {
    row >= 0 && row < board.rows && col >= 0 && col < board.cols
}

fn board_index(board: &BoardState, row: i32, col: i32) -> usize {
    (row * board.cols + col) as usize
}

fn get_cell_id(board: &BoardState, row: i32, col: i32) -> Option<&String> {
    if !is_inside(board, row, col) {
        return None;
    }
    board.occupancy.get(board_index(board, row, col))?.as_ref()
}

fn set_cell(board: &mut BoardState, row: i32, col: i32, value: Option<String>) {
    let index = board_index(board, row, col);
    if let Some(slot) = board.occupancy.get_mut(index) {
        *slot = value;
    }
}

fn clear_cell(board: &mut BoardState, row: i32, col: i32) {
    set_cell(board, row, col, None);
}

#[allow(dead_code)]
fn occupied_ids(board: &BoardState) -> HashSet<String> {
    board.occupancy.iter().flatten().cloned().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn strategy(action: &str) -> StrategyProgram {
        StrategyProgram {
            body: vec![Statement::Return {
                value: action.to_string(),
            }],
        }
    }

    fn player(id: i32, name: &str, action: &str) -> PlayerDefinition {
        PlayerDefinition {
            id,
            name: name.to_string(),
            color: "#fff".to_string(),
            code: String::new(),
            validation: ValidationResult {
                is_valid: true,
                errors: vec![],
                normalized_code: None,
                program: Some(strategy(action)),
            },
        }
    }

    fn board(rows: i32, cols: i32, cells: &[Cell]) -> BoardState {
        let mut board = BoardState {
            rows,
            cols,
            occupancy: vec![None; (rows * cols) as usize],
        };
        for cell in cells {
            if cell.alive {
                set_cell(&mut board, cell.position.row, cell.position.col, Some(cell.id.clone()));
            }
        }
        board
    }

    fn cell(id: &str, team_id: i32, row: i32, col: i32) -> Cell {
        Cell {
            id: id.to_string(),
            team_id,
            team_name: format!("Team {}", team_id),
            team_color: "#fff".to_string(),
            position: BoardPosition { row, col },
            health: 100,
            age: 1,
            alive: true,
            creation_turn: 0,
            created_during_current_turn: false,
            last_action: "none".to_string(),
            last_action_status: "none".to_string(),
        }
    }

    #[test]
    fn validates_and_parses_strategy_code() {
        let validation = validate_strategy(
            "def action(cell, environment):\n    if environment[\"n\"] == \"enemy\":\n        return \"an\"\n    return \"d\"",
        );

        assert!(validation.is_valid);
        let program = validation.program.unwrap();
        assert!(matches!(program.body[0], Statement::If { .. }));
    }

    #[test]
    fn reproduces_without_newborn_acting_until_next_turn() {
        let cells = vec![cell("a", 1, 2, 2), cell("b", 2, 4, 4)];
        let state = SimulationState {
            status: "paused".to_string(),
            locked: true,
            config: MatchConfig {
                teams: [player(1, "Alpha", "re"), player(2, "Beta", "d")],
                turn_limit: 10,
                board_rows: 5,
                board_cols: 5,
            },
            board: board(5, 5, &cells),
            cells,
            current_turn: 1,
            logs: vec![],
            result: None,
            next_cell_id: 3,
        };

        let next = run_turn(state);
        assert_eq!(next.cells.len(), 3);
        let child = next.cells.iter().find(|cell| cell.id == "cell-3").unwrap();
        assert_eq!(child.last_action, "born");
        assert_eq!(child.age, 2);
    }

    #[test]
    fn resolves_elimination() {
        let mut enemy = cell("b", 2, 2, 3);
        enemy.health = 5;
        let cells = vec![cell("a", 1, 2, 2), enemy];
        let state = SimulationState {
            status: "paused".to_string(),
            locked: true,
            config: MatchConfig {
                teams: [player(1, "Alpha", "ae"), player(2, "Beta", "d")],
                turn_limit: 10,
                board_rows: 5,
                board_cols: 5,
            },
            board: board(5, 5, &cells),
            cells,
            current_turn: 1,
            logs: vec![],
            result: None,
            next_cell_id: 3,
        };

        let next = run_turn(state);
        assert_eq!(next.cells.len(), 1);
        assert!(matches!(next.result.unwrap().winner, Winner::Team(1)));
    }
}
