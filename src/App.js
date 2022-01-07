import React, { useState } from "react";
import "./styles.css";

function calculateWinner(quadrados) {
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
		if (
			quadrados[a] &&
			quadrados[a] === quadrados[b] &&
			quadrados[a] === quadrados[c]
		) {
			return { vencedor: quadrados[a], vencedorPosicoes: [a, b, c] };
		}
	}

	return null;
}

function BotaoOrdemHistorico(props) {
	const classe = props.value === props.ordemAtual ? "botao-ativo" : null;

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
	const pHistory = props.history;
	const pStepClicado = props.stepClicado;
	let historico;
	let reverter = props.reverso;

	if (reverter) {
		const historico_reverso = [...pHistory];
		historico_reverso.reverse();
		historico = [...historico_reverso];
	} else {
		historico = [...pHistory];
	}

	return (
		<ol reversed={reverter ? true : null}>
			{historico.map((step, index) => {
				let movimento = index;

				if (reverter) {
					movimento = step.movimento;
				}

				const classe = pStepClicado === movimento ? "botao-ativo" : null;
				const desc = movimento
					? (pStepClicado === movimento ? "Move atual #" : "Go to move #") +
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

const Board = (props) => {
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
			tabuleiro_array[tabuleiro_linha] = [];
		}

		if (i > 0 && i % 3 === 0) {
			tabuleiro_linha++;
			tabuleiro_array[tabuleiro_linha] = [];
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
};

export const Game = (props) => {
	const [history, setHistory] = useState([
		{
			squares: Array(9).fill(null),
			movimento: 0,
			linha: null,
			coluna: null
		}
	]);

	const [stepNumber, setStepNumber] = useState(0);
	const [xIsNext, setXIsNext] = useState(true);
	const [ordemHistorico, setOrdemHistorico] = useState("ASC");

	const handleClick = (i) => {
		const historico = history.slice(0, stepNumber + 1);
		const current = historico[historico.length - 1];
		const quadrados = current.squares.slice();

		if (calculateWinner(quadrados) || quadrados[i]) {
			return;
		}

		quadrados[i] = xIsNext ? "X" : "O";

		setHistory([
			...historico,
			{
				squares: quadrados,
				movimento: historico.length,
				linha: Math.trunc(i / 3) + 1,
				coluna: (i % 3) + 1
			}
		]);

		setStepNumber(historico.length);
		setXIsNext(!xIsNext);
	};

	const jumpTo = (step) => {
		setStepNumber(step);
		setXIsNext(step % 2 === 0);
	};

	const renderHistorico = () => {
		return (
			<Historico
				history={history}
				reverso={reverterHistorico}
				onClick={jumpTo}
				stepClicado={stepNumber}
			/>
		);
	};

	const handleClickOrdemHistorico = (ordem = "ASC") => {
		setOrdemHistorico(ordem);
	};

	const renderBotaoOrdemHistorico = (ordem = "ASC") => {
		const chave = "boh" + ordem.toLowerCase();

		return (
			<BotaoOrdemHistorico
				key={chave}
				value={ordem}
				onClick={() => handleClickOrdemHistorico(ordem)}
			/>
		);
	};

	const current = history[stepNumber];
	const winner = calculateWinner(current.squares);
	let posicoesVencedor = null;

	let status;
	if (winner) {
		posicoesVencedor = winner.vencedorPosicoes;
		status = "Winner: " + winner.vencedor;
	} else {
		status = "Next player: " + (xIsNext ? "X" : "O");
	}

	const reverterHistorico = ordemHistorico === "ASC" ? false : true;

	return (
		<div className="game">
			<div className="game-board">
				<Board
					squares={current.squares}
					//vencedorPosicoes={posicoesVencedor}
					onClick={(i) => handleClick(i)}
				/>
			</div>
			<div className="game-info">
				<div>{status}</div>
				<BotaoOrdemHistorico
					key={"bohasc"}
					value="ASC"
					onClick={() => handleClickOrdemHistorico("ASC")}
					ordemAtual={ordemHistorico}
				/>
				<BotaoOrdemHistorico
					key={"bohdesc"}
					value="DESC"
					onClick={() => handleClickOrdemHistorico("DESC")}
					ordemAtual={ordemHistorico}
				/>

				{renderHistorico()}
			</div>
		</div>
	);
};
