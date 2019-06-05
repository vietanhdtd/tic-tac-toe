import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GoogleLogin from 'react-google-login';
import { 
  Button,
  Col, Row , Container
  } from 'react-bootstrap';


  const Square = ({onClick, value}) => 
  <button variant="dark" className="square" onClick={onClick}>
      {value}
  </button>


  class Board extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        squares: Array(9).fill(null),
        xIsNext: true,
        winnerTime: 0,
        highScore: []
      };
      console.log(Array(9).fill(null))
    }

    componentDidMount() {
      this.getHighScore()
    }

    handleClick(i) {
      const squares = this.state.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        squares: squares,
        xIsNext: !this.state.xIsNext,});
        console.log(this.state.squares)
    }

    renderSquare(i) {
      return (<Square  
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
         />)
    }

   async pushDataToSever() {
        let data = new URLSearchParams();
        data.append('player', this.state.highScore.player);
        data.append('score', Math.floor((Date.now() - this.props.startTime)/1000));
        const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
        const response = await fetch(url,
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: data.toString(),
            json: true,
          }
        );
        let success =  await response.json()
        console.log("push",success)
    }

    async getHighScore() {
      const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev/?reverse=true`
      let response = await fetch(url);
      let data = await response.json();
      this.setState({
        highScore: data.items
      })
      console.log("123",this.state.highScore)
    }

    renderHighScore = () => {
      return this.state.highScore.map(({player, score}) => {
            return (<li className="text-white">{player}</li>)
          })
    }


    resetGame = () => {
      return this.setState({
        squares: Array(9).fill(null),
      })
    }


    render() {
      const winner = calculateWinner(this.state.squares);
      let winTime = Math.floor((Date.now() - this.props.startTime)/1000)
      let status, time;
      if (winner === "X" || winner === "O" ) {
      status = `The Winner is: ${winner}`
      time = `Elapsed time: ${winTime}`
      
      this.pushDataToSever()
    } else if (winner === "Draw"){
      status = `${winner}`
      time = `Elapsed time: ${winTime}`
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } 

      return (
        <div>
          <div className="status text-danger"><h4>{status}</h4></div>
          <div className="py-2 text-success"><h5>{time}</h5></div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
          <div>
          <h5 className="text-white pt-3">High Score</h5>
           <ul>
           {this.renderHighScore()}
           </ul>
          </div>
          <Button onClick={() => {this.resetGame(); this.props.onClick()}}>Reset Game</Button>
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        isLogin: false,
        finishGame: false,
        timer: 0,
        start: 0,
      }
    }
    
    componentDidMount() {
    //   // const theTime = this.setState({
    //   //   timer: Math.floor((Date.now() - this.state.start)/1000)
    //   // })
    //  setInterval(() => this.setState({
    //   timer: Math.floor((Date.now() - this.state.start)/1000)
    // }))
    }

    responseGoogle = (response) => {
      console.log(response);
      this.setState({
        isLogin: true,
        name: response.profileObj.name,
        start: Date.now()
      })
      console.log(this.state.start)
    }

    handleClick(){
      return this.setState({ start: Date.now()})
    }

    render() {
      const { name, start, timer } = this.state
      return ( 
        <Container className="game w-100 h-100 row">
            <div className="row ">
              <img 
              src="https://memegenerator.net/img/instances/84577004/tic-tac-toe.jpg"
              style={{width:"auto", height:250}}
            /></div>
           {this.state.isLogin &&
           <Container className="w-50 h-25 d-flex">
             <div className="m-4"><p className="text-white">User Name : <h3>{name}</h3></p></div>
             <br></br>
             <div className="game-board">
            <Board
              startTime={start}
              name={name}
              onClick={() => this.handleClick()}
            />
          </div>
          <div className="game-info">
            <div>{/* status */}</div>
            <ol>{/* TODO */}</ol>
          </div>
           </Container>
          }
          {!this.state.isLogin &&
            <Container className="w-100 h-25 col">
             <Col className="d-flex justify-content-center">
               <GoogleLogin
             clientId="542087890372-hr9j73mp69ivalchpro32lm39a89un5a.apps.googleusercontent.com" //CLIENTID NOT CREATED YET
             buttonText="LOGIN WITH GOOGLE"
             onSuccess={(response) => this.responseGoogle(response)}
             onFailure={this.responseGoogle}
           />
           </Col>
           </Container>
          }
        </Container>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(squares) {
    if (squares.every((square) => square != null) === true)
      return "Draw"
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
        return squares[a];
      }
    }
    return null;
  }