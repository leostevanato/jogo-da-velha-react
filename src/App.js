import React, { useState } from "react";
import "./styles.css";

function BotaoOrdemHistorico(props) {
	const classe = props.value == props.ordemAtual ? "botao-ativo" : null;

	return (
		<button className={classe} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

function Square(props) {
	//const classeVencedor = props.vencedorPosicoes.includes(props.value)? " posicao-vencedor" : null;

	return (
		//<button className={`square${classeVencedor}`} onClick={props.onClick}>
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);
}

function Historico(props) {
	const history = props.history;
	const stepClicado = props.stepClicado;
	let historico;
	let reverter = props.reverso;

	if (reverter) {
		const historico_reverso = [...history];
		historico_reverso.reverse();
		historico = [...historico_reverso];
	} else {
		historico = [...history];
	}

	return (
		<ol>
			{historico.map((step, index) => {
				let movimento = index;

				if (reverter) {
					movimento = step.movimento;
				}

				const classe = stepClicado == movimento ? "botao-ativo" : null;
				const desc = movimento
					? (stepClicado == movimento ? "Move atual #" : "Go to move #") +
					  movimento +
					  " (" +
					  step.linha +
					  " | " +
					  step.coluna +
					  ")"
					: "Go to game start";

				return (
					<li key={`${step.linha}${step.coluna}`}>
						<button className={classe} onClick={() => props.onClick(movimento)}>
							{desc}
						</button>
					</li>
				);
			})}
		</ol>
	);
}

function Board(props) {
	function renderSquare(i) {
		return (
			<Square
				key={i}
				value={props.squares[i]}
				//vencedorPosicoes={props.posicoesVencedor}
				onClick={() => props.onClick(i)}
			/>
		);
	}

	let tabuleiro_array = [];
	let tabuleiro_linha = 0;

	for (let i = 0; i < props.squares.length; i++) {
		if (i === 0) {
			tabuleiro_array[tabuleiro_linha] = new Array();
		}

		if (i > 0 && i % 3 === 0) {
			tabuleiro_linha++;
			tabuleiro_array[tabuleiro_linha] = new Array();
		}

		tabuleiro_array[tabuleiro_linha].push(i);
	}

	return (
		<div>
			{tabuleiro_array.map((valorLinha, indexLinha) => (
				<div key={indexLinha} className="board-row">
					{tabuleiro_array[indexLinha].map((valorColuna, indexColuna) =>
						renderSquare(valorColuna)
					)}
				</div>
			))}
		</div>
	);
}

export class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					movimento: 0,
					linha: null,
					coluna: null
				}
			],
			stepNumber: 0,
			xIsNext: true,
			ordemHistorico: "ASC"
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		//console.log("C: "+ JSON.stringify(current));

		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		squares[i] = this.state.xIsNext ? "X" : "O";

		this.setState({
			history: history.concat([
				{
					squares: squares,
					//ordem: ordem,
					movimento: history.length,
					linha: parseInt(i / 3) + 1,
					coluna: (i % 3) + 1
				}
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	jumpTo = (step) => {
		this.setState({
			stepNumber: step,
			xIsNext: step % 2 === 0
		});
	};

	renderHistorico(history, reverso = false) {
		return (
			<Historico
				history={history}
				reverso={reverso}
				onClick={this.jumpTo}
				stepClicado={this.state.stepNumber}
			/>
		);
	}

	handleClickOrdemHistorico(ordem = "ASC") {
		this.setState({ ordemHistorico: ordem });
	}

	renderBotaoOrdemHistorico(ordem = "ASC") {
		const chave = "boh" + ordem.toLowerCase();

		return (
			<BotaoOrdemHistorico
				key={chave}
				value={ordem}
				onClick={() => this.handleClickOrdemHistorico(ordem)}
			/>
		);
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);
		let posicoesVencedor = null;
		//console.log(this.state.stepNumber);
		//console.log(this.state);
		//console.log(winner);

		let status;
		if (winner) {
			posicoesVencedor = winner.vencedorPosicoes;
			status = "Winner: " + winner.vencedor;
		} else {
			status = "Next player: " + (this.state.xIsNext ? "X" : "O");
		}

		const reverterHistorico =
			this.state.ordemHistorico === "ASC" ? false : true;

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						//vencedorPosicoes={posicoesVencedor}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<BotaoOrdemHistorico
						key={"bohasc"}
						value="ASC"
						onClick={() => this.handleClickOrdemHistorico("ASC")}
						ordemAtual={this.state.ordemHistorico}
					/>
					<BotaoOrdemHistorico
						key={"bohdesc"}
						value="DESC"
						onClick={() => this.handleClickOrdemHistorico("DESC")}
						ordemAtual={this.state.ordemHistorico}
					/>

					{this.renderHistorico(history, reverterHistorico)}
				</div>
			</div>
		);
	}
}

// ========================================

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
			//console.log(a, b, c);

			return { vencedor: squares[a], vencedorPosicoes: [a, b, c] };
		}
	}
	return null;
}
