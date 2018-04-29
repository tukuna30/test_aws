import React from 'react';
import ReactDOM from 'react-dom';
import '../../../react_src/styles/app.scss';

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
      return { winner: squares[a], position: lines[i] };
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
            return this.renderSquare(3 * i + j, winningPosition.includes(3 * i + j));
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
          position: { row: '-', col: '-' }
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isComputer: false
    };
  }

  getPositionsOf(squares, element) {
    return squares.reduce(function (acc, ele, index) {
      if (ele === element) {
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
    const emptyPositions = this.getPositionsOf(squares, null);

    let winningPosition;
    let xPositions = this.getPositionsOf(squares, 'X');
    let oPositions = this.getPositionsOf(squares, 'O');

    let _getEmptyCorner = () => {
      let corners = [0, 2, 6, 8], emptyCorner;

      corners.forEach((val, i) => {
        if (emptyPositions.indexOf(val) !== -1) {
          if (i === 0 && oPositions.indexOf(8) === -1 || i === 1 && oPositions.indexOf(6) === -1 ||
            i === 2 && oPositions.indexOf(2) === -1 || i === 3 && oPositions.indexOf(0) === -1) {
            emptyCorner = val;
          }
        }
      });
      return emptyCorner;
    };

    let _getBlockingPosition = () => {
      let midPositions = [1, 3, 5, 7], blockingPosition;
      midPositions.forEach((val, i) => {
        if (emptyPositions.indexOf(val) !== -1) {
          if ((i === 0 && oPositions.indexOf(0) !== -1 && oPositions.indexOf(2) !== -1) ||
            (i === 1 && oPositions.indexOf(0) !== -1 && oPositions.indexOf(6) !== -1) ||
            (i === 2 && oPositions.indexOf(2) !== -1 && oPositions.indexOf(8) !== -1) ||
            (i === 3 && oPositions.indexOf(6) !== -1 && oPositions.indexOf(8) !== -1)) {
            blockingPosition = val;
          }
        }
      });
      return blockingPosition;
    };

    let _getWinningPosition = () => {
      let midPositions = [1, 3, 5, 7], winningPosition;
      midPositions.forEach((val, i) => {
        if (emptyPositions.indexOf(val) !== -1) {
          if (i === 0 && xPositions.indexOf(7) !== -1 || i === 1 && xPositions.indexOf(5) !== -1 ||
            i === 2 && xPositions.indexOf(3) !== -1 || i === 3 && xPositions.indexOf(1) !== -1) {
            winningPosition = val;
          }
        }
      });
      return winningPosition;
    };

    if (_getEmptyCorner()) { //maximise winning chance of 'X'
      winningPosition = _getEmptyCorner();
    }
    else if (_getWinningPosition()) { // winning move
      winningPosition = _getWinningPosition();
    }
    else if (_getBlockingPosition()) { //prevent 'O' to win
      winningPosition = _getBlockingPosition();
    } else {
      winningPosition = emptyPositions[0];
    }

    this.handleClick(winningPosition, true);
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
          position: { row: Math.trunc(i / 3), col: i % 3 }
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

  setComputerAsPlayer() {
    this.setState({
      isComputer: true
    });
  }

  resetGame() {
    this.setState({
      history: [
        {
          squares: Array(9).fill(null),
          position: { row: '-', col: '-' }
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
    else if (current.squares.indexOf(null) === -1) {
      matchDrawn = true;
    }

    if (this.state.isComputer) {
      this.handleClick(4, true);
    }

    const moves = history.map((step, move) => {
      if (this.getPositionsOf(step.squares, null).length < 9) {
        let desc = 'Go to move #' + move + ' (' + (step.position.row + 1) + ', ' + (+step.position.col + 1) + ')';
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
          <div style={{fontWegiht: 'bold'}}>Let's play</div>
          <Board
            squares={current.squares}
            winningPosition={winningPosition}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>
            With Computer?
            <button style={{ marginLeft: '5px' }} onClick={() => this.setComputerAsPlayer()} className={this.state.isComputer ? "selected" : ""}>Yes</button>
          </div>
          <div style={{ marginTop: '5px' }}>{status}</div>
          <ol>{moves}</ol>
          <div>{moves.length > 1 ?
            <button style={{ border: '1px solid red' }} onClick={() => this.resetGame()}>Reset Game </button> : ''}
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
