
export function canMoveKnight(currentPos, toX, toY) {
    const [x, y] = currentPos;
    const dx = toX - x;
    const dy = toY - y;

    return (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2);
}
export function isNoMovesExist(currentPos, covered) {
    let possibleMoves = [];
    let xPos = currentPos[0];
    let yPos = currentPos[1];

    if (xPos + 2 < 8) {
        if (yPos + 1 < 8) {
            possibleMoves.push((yPos + 1) * 8 + (xPos + 2));
        }
        if (yPos - 1 >= 0) {
            possibleMoves.push((yPos - 1) * 8 + (xPos + 2));
        }
    }

    if (xPos - 2 >= 0) {
        if (yPos + 1 < 8) {
            possibleMoves.push((yPos + 1) * 8 + (xPos - 2));
        }
        if (yPos - 1 >= 0) {
            possibleMoves.push((yPos - 1) * 8 + (xPos - 2));
        }
    }

    if (yPos + 2 < 8) {
        if (xPos + 1 < 8) {
            possibleMoves.push((yPos + 2) * 8 + (xPos + 1));
        }
        if (xPos - 1 >= 0) {
            possibleMoves.push((yPos + 2) * 8 + (xPos - 1));
        }
    }

    if (yPos - 2 >= 0) {
        if (xPos + 1 < 8) {
            possibleMoves.push((yPos - 2) * 8 + (xPos + 1));
        }
        if (xPos - 1 >= 0) {
            possibleMoves.push((yPos - 2) * 8 + (xPos - 1));
        }
    }

    for (let i = 0; i < possibleMoves.length; i++) {
        if (covered.indexOf(possibleMoves[i]) === -1) {
            return false;
        }
    }
    return true;
}