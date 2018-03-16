import React from 'react';
import ReactDOM from 'react-dom';

//Simple functional Component
function Square(props) {
  return (
    <button className={"square " + (props.value ? "clicked " : '') + (props.winingSquare ? "won" : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}
  
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], position: lines[i]};
    }
  }
}

class Board extends React.Component {
  renderSquare(i, winingSquare) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winingSquare={winingSquare}
      />
    );
  }

  render() {
    const rows = [];
    const length = 3; 
    const winningPosition = this.props.winningPosition || [];
    for (let i = 0; i < length; i++) {
      rows.push(<div className='board-row'>
        {
        Array.from(Array(length).keys()).map(j => {
          return this.renderSquare(3*i+j, winningPosition.includes(3*i+j));
        })
        }
      </div>);
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}
  
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          position: {row: '-', col: '-'}
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          position: {row: Math.trunc(i/3), col: i % 3}
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winData = calculateWinner(current.squares);
    let winner; 
    let winningPosition;
    if (winData) {
       winner = winData.winner;
       winningPosition = winData.position;
    } 

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move  + ' (' + (step.position.row + 1) + ', ' + (+step.position.col + 1) + ')':
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningPosition = {winningPosition}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}
  
ReactDOM.render( 
    <Game />,
    document.getElementById('game')
);
  