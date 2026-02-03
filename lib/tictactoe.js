/**
 * TicTacToe Game Class
 * Gestisce la logica del gioco del tris
 */
export default class TicTacToe {
    constructor(playerX, playerO) {
        this.playerX = playerX
        this.playerO = playerO
        this.currentTurn = playerX
        this.board = Array(9).fill(null)
        this.winner = null
        this.moves = 0
    }

    render() {
        return this.board.map((cell, index) => cell || (index + 1))
    }

    move(player, position) {
        if (this.winner) return false
        if (player !== this.currentTurn) return false
        if (position < 1 || position > 9) return false
        if (this.board[position - 1]) return false
        
        this.board[position - 1] = player === this.playerX ? 'X' : 'O'
        this.moves++
        
        if (this.checkWin()) {
            this.winner = player
        } else if (this.isDraw()) {
            this.winner = 'DRAW'
        } else {
            this.switchTurn()
        }
        
        return true
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[b] === this.board[c]
        })
    }

    isDraw() {
        return this.board.every(cell => cell !== null)
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === this.playerX ? this.playerO : this.playerX
    }

    getAvailablePositions() {
        return this.board
            .map((cell, index) => cell === null ? index + 1 : null)
            .filter(pos => pos !== null)
    }

    isValidMove(position) {
        return position >= 1 && position <= 9 && !this.board[position - 1]
    }

    reset() {
        this.board = Array(9).fill(null)
        this.currentTurn = this.playerX
        this.winner = null
        this.moves = 0
    }
}