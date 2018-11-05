var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('menu', menu);
game.state.add('jogo', jogo);

game.state.start('menu');