var text;
var btnJogar;
var sons  = [];
var instrucoes = 
"Bem vindo ao \"HEAD SOCCER 1.0\"\n" +
"Ganha o jogador que fizer 5 pontos.\n\n" +
"Controles do jogador da esquerda: " +
"A(esquerda), D(direita), W(pulo), ESPACO(chute)\n\n" +
"Controles do jogador da direita: " +
"Setas(esquerda, direita e pulo) e M(chute)."
;
var background;

var menu = {
    preload: function() {
        //carreca as imagens dos botões
        game.load.image('fundoCaixaMensagem', 'jogo/assets/fundo_caixa_mensagem.png');
        game.load.image('btnOk', 'jogo/assets/btn_ok.png');
        game.load.image('background', 'jogo/assets/background.png');
        game.load.spritesheet('btnPrincipais', 'jogo/assets/btn_principais.png', 160, 40);

        //musica de fundo
        game.load.audio('musica_menu', 'jogo/assets/sons/musica_menu.mp3');
    },

    create: function() {
        //se estiver voltando ao meno depois de jogar, parar o som do jogo
        if (sons["musica_jogo"] != undefined)
            sons["musica_jogo"].stop();

        //música de fundo
        sons["musica_menu"] = game.add.audio('musica_menu', 1, 1);
        sons["musica_menu"].play();

        //background
        background = game.add.tileSprite(
            game.width / 70,
            game.height / 70, 
            game.width - game.width / 70 * 2,
            game.height - game.width / 70 * 2, 'background');

        //botão de jogar
        btnJogar = game.add.button(game.world.centerX, game.world.centerY, 'btnPrincipais', function() {
            game.state.start('jogo');
        }, this, 1, 0);
        btnJogar.anchor.setTo(0.5, 0.5);
        btnJogar.y -= btnJogar.height;

        //botão de instruções
        btnInstrucoes = game.add.button(game.world.centerX, game.world.centerY, 'btnPrincipais', function() {
            this.showMessageBox(instrucoes, 
            game.width - 60,
            game.height - 60);
        }, this, 3, 2);
        btnInstrucoes.anchor.setTo(0.5, 0.5);
        btnInstrucoes.y += btnInstrucoes.height;
    },

    showMessageBox(text, w, h) {
    	//se a tela já existe, ela deve ser destruida
        if (this.msgBox) {
            this.msgBox.destroy();
        }

        //grupo para guardar todos os elementos
        var msgBox = game.add.group();
        //fundo da caixa de mensagem
        var back = game.add.sprite(0, 0, "fundoCaixaMensagem");
        //botão ok
        var botaoOk = game.add.sprite(0, 0, "btnOk");
        //campo de texto
        var text1 = game.add.text(0, 0, text);
        //faz o texto descer a linha se for muito grande
        text1.wordWrap = true;
        //largura maxima do texto é 90% do tamanho da caixa de mesagem
        text1.wordWrapWidth = w * .95;

        //configura o tamanho da caixa de mensagem
        back.width = w;
        back.height = h;

        //adiciona os elementos ao grupo
        msgBox.add(back);
        msgBox.add(botaoOk);
        msgBox.add(text1);

        //centraliza o botão de ok horizontamente e posiciona ele na parte inferior da caixa de mensagem
        botaoOk.x = back.width / 2 - botaoOk.width / 2;
        botaoOk.y = back.height - botaoOk.height;

        //enable the button for input
        botaoOk.inputEnabled = true;

        //destrói a caixa de mensagem quando o botão é clicado
        botaoOk.events.onInputDown.add(this.hideBox, this);

        //centraliza a caixa de mensagem no centro da tela
        msgBox.x = game.width / 2 - msgBox.width / 2;
        console.log(msgBox.width);
        msgBox.y = game.height / 2 - msgBox.height / 2;

        //centraliza o texto no centro da caixa de mensagem
        text1.x = back.width / 2 - text1.width / 2;
        text1.y = back.height / 2 - text1.height / 2;

        //make a state reference to the messsage box
        this.msgBox = msgBox;
    },
    hideBox() {
    	//destroy the box when the button is pressed
        this.msgBox.destroy();
    },
};


