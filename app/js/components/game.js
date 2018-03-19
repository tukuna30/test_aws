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
      xIsNext: true,
      isComputer: false
    };
  }

  getEmptyPositions(squares) {
    return squares.reduce(function(acc, ele, index) {
      if (ele === null) {
        acc.push(index);
      }  
      return acc;
    }, []);
  }

  handleComputerClick() {
    if (!this.state.xIsNext) {
      return;
    }
    const current = this.state.history[this.state.stepNumber];
    const squares = current.squares.slice();
    const emptyPositions = this.getEmptyPositions(squares);

    let WiningPosition = emptyPositions[0];

    this.handleClick(WiningPosition, true);
  }

  handleClick(i, isComputerClick) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i] || 
      this.state.isComputer && this.state.xIsNext && !isComputerClick) {
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

    if (this.state.isComputer && !this.state.xIsNext) {
      setTimeout(() => {
        this.handleComputerClick();
      }, 700);
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      isComputer: this.state.isComputer
    });
    
    setTimeout(() => {
      this.handleComputerClick();
    }, 700);
  }

  setComputerAsPlayer () {
    this.setState({
      isComputer: true
    });
  }

  resetGame() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null),
          position: {row: '-', col: '-'}
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isComputer: false
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winData = calculateWinner(current.squares);
    let winner, matchDrawn; 
    let winningPosition;
    if (winData) {
       winner = winData.winner;
       winningPosition = winData.position;
    } 
    else if (current.squares.indexOf(null) === -1){
      matchDrawn = true;
    }

    if (this.state.isComputer) {
      this.handleClick(4, true);
    }

    const moves = history.map((step, move) => {
      if (this.getEmptyPositions(step.squares).length < 9) {
        let desc = 'Go to move #' + move  + ' (' + (step.position.row + 1) + ', ' + (+step.position.col + 1) + ')';
        return (
          <li key={move}>
            <button className={this.state.stepNumber === move ? "current" : ""} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      }        
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    }
    else if (matchDrawn) {
      status = "Game ended in a Draw!!!"
    } 
    else {
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
          <div>
            With Computer? 
            <button style={{marginLeft: '5px'}} onClick={() => this.setComputerAsPlayer()} className={this.state.isComputer ? "selected" : ""}>Yes</button>
          </div>
          <div style={{marginTop: '5px'}}>{status}</div>
          <ol>{moves}</ol>
          <div>{moves.length > 1 ?
            <button style={{border: '1px solid red'}} onClick={() => this.resetGame()}>Reset Game </button>: ''}
          </div>
        </div>
      </div>
    );
  }
}
  
ReactDOM.render( 
    <Game />,
    document.getElementById('game')
);
  