import React from 'react';
import Knight from './Knight';
import Square from './Square';
import { canMoveKnight, isNoMovesExist } from "../helpers/rules";

export default class Games extends React.Component {
    constructor(props) {
        super(props);
        this.state = { knightPrevPosition: null, knightPosition: [0, 0], totalMoves: 0, conquered: [0], retryCount: 3 };
        this.handleSquareClick = this.handleSquareClick.bind(this);
        this.undoLastStep = this.undoLastStep.bind(this);
        this.resetGame = this.resetGame.bind(this);
    }

    getSquare(i) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const black = (x + y) % 2 === 1;

        const [knightX, knightY] = this.state.knightPosition;
        return (
            <div key={i}
                style={{ width: '12.5%', height: '12.5%' }}
                //onClick={() => this.handleSquareClick(x, y)}
                >
                <Square black={black} dropHandler={this.handleSquareClick} x={x} y={y} knightPosition={this.state.knightPosition} conquered={this.state.conquered.indexOf(i) !== -1}>
                    {x === knightX && y === knightY ? <Knight /> : null}
                </Square>
            </div>
        );
    }

    handleSquareClick(x, y) {
        if (canMoveKnight(this.state.knightPosition, x, y)) {
            let conquered = this.state.conquered;
            let position = y * 8 + x;
            if (conquered.indexOf(position) === -1) {
                conquered = conquered.concat(position);
            }
            
            this.setState({ knightPrevPosition: this.state.knightPosition, knightPosition: [x, y], totalMoves: this.state.totalMoves + 1, conquered: conquered });
            if (isNoMovesExist([x, y], this.state.conquered)) {
                this.setState({isBlocked: true});
            }
        }
    }

    undoLastStep () {
        let conquered = [...this.state.conquered];
        conquered.pop();
        this.setState({knightPosition: this.state.knightPrevPosition, knightPrevPosition: null, retryCount: this.state.retryCount - 1, isBlocked: false, conquered: conquered});
    }

    resetGame () {
        this.setState({knightPrevPosition: null, knightPosition: [0, 0], totalMoves: 0, conquered: [0], retryCount: 3})
    }

    render() {
        const squares = [];
        for (let i = 0; i < 64; i++) {
            squares.push(this.getSquare(i));
        }

        return (
            <div style={{
                width: '350px',
                height: '350px',
                display: 'flex',
                flexWrap: 'wrap',
                border: '1px solid gray',
                marginTop: '20px',
            }}>
                {squares}
                <div style={{margin: '10px  10px 0 0'}}>Try planting a tree, riding the knight on all over the board, without a revisit!!!</div>
                <div style={{margin: '10px  10px 0 0'}}>Total Moves: {this.state.totalMoves}</div>
                {this.state.conquered.length === 64 && <div style={{color: 'green', margin: '10px  10px 0 0'}}>Congratulations, You've covered all!!!</div>}
                {this.state.knightPrevPosition && (this.state.retryCount > 0) && <button style={{margin: '10px  10px 0 0', background: '#f4d078'}} onClick={this.undoLastStep}>Undo Last Move</button>}
                {(this.state.retryCount > 0 && this.state.isBlocked)  && <div style={{color: 'red', margin: '10px 10px 0 10px'}}>You're blocked</div>}
                {(this.state.retryCount <= 0 && this.state.isBlocked)  && <div style={{color: 'red', margin: '10px 10px 0 10px'}}>You've lost the game!!!</div>}
                {(this.state.totalMoves > 0) && <button style={{margin: '10px  10px 0 0', background: '#f4d078'}} onClick={this.resetGame}>Reset Game</button>}
            </div>
        );
    }
}