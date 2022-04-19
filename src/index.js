import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      style={props.highlightSquare ? {background: 'red'} : {}} 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const highlightSquare = this.props.winnerLine?.some(squareId => squareId === i);
    return (
      <Square
        key={i}
        highlightSquare={highlightSquare}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let squaresToRender = [];
    for(let i = 0; i < 3; i++) {
      let row = [];
      for(let j = 0; j < 3; j++) {
        row.push(this.renderSquare(3 * i + j));
      }
      squaresToRender.push(
        <div
          key={i}
          className="bord-row"
        >
          {row}
        </div>
      );
    }

    return (
      <div>
        {squaresToRender}
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
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      ascendingMoves: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState(
      {
        history: history.concat([{
          squares: squares,
        }, ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      }
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    let moves = history.map((step, move) => {
      let description;
      if (move > 0) {
        const diff = step.squares.reduce((previous, current, currentIndex) => previous = current !== history[move - 1].squares[currentIndex] ? currentIndex : previous, 0)
        const location = '(' + String(Math.floor((diff) / 3 + 1)) + ', ' + String(Math.floor((diff) % 3 + 1)) + ')'
        description = 'Go to move #' + move + '(row, col) = ' + location
      } else {
        description = 'Go to game start';
      }
      const isSelected = (move === this.state.stepNumber);
      return (
        <li key={move}>
          <button id="step-button" style={isSelected ? {'fontWeight': 'bold'} : {}} onClick={() => this.jumpTo(move)}>{description}</button>
        </li>
      )
    });

    if (!this.state.ascendingMoves) moves = moves.slice().reverse();

    const winnerInfo = calculateWinner(current.squares);
    let status;
    if (winnerInfo) {
      if (winnerInfo.winner) {
        status = 'Winner:' + winnerInfo.winner;
      } else if (winnerInfo.draw) {
        status = 'Draw';
      }
    } else{
      status = 'Next player:' + (this.state.xIsNext ? 'X' : 'O');      
    }

    const toggleOrder = (
      <button
        onClick={() => this.setState({ascendingMoves: !this.state.ascendingMoves})}
      >
        {this.state.ascendingMoves ? 'asc': 'desc'}
      </button>
    );

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winnerLine={winnerInfo?.line}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{toggleOrder}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], line: lines[i]};
    }
  }
  if (!squares.some(square => square === null)) return {draw: true};
  return null;
}
