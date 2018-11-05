var velocidadePlayer = 200;
var puloPlayer = 600;
var players = [];
var musica_jogo;
var bola;
var golsMax = 5;
var golEsq, golDir;
var placar;

var jogo = function() {
    var playerCollisionGroup;
    var worldCollisionGroup;
    var peCollisionGroup;
    var bolaCollisionGroup;
}

jogo.prototype = {
    preload: function()
    {
        //musica de fundo
        game.load.audio('musica_jogo', 'jogo/assets/sons/musica_jogo.mp3');

        //imagem do chão
        game.load.image('chao', 'jogo/assets/chao.png');

        //imagem de fundo
        game.load.image('fundo', 'jogo/assets/fundo.jpg');

        //botão de pausa
        game.load.image('fundoBotaoPausa', 'jogo/assets/fundoBotaoPausa.jpg');
        
        //imagem da bola
        game.load.image('bola', 'jogo/assets/bola.png');

        //imagem dos players
        game.load.image('player1', 'jogo/assets/player1.png');
        game.load.image('player2', 'jogo/assets/player2.png');
        
        //imagem do pé
        game.load.image('pePlayer1', 'jogo/assets/peP1.png');
        game.load.image('pePlayer2', 'jogo/assets/peP2.png');
        
        //imagens dos gols
        game.load.image('golEsq', 'jogo/assets/golEsq.png');
        game.load.image('golDir', 'jogo/assets/golDir.png');
        
        //sons
        game.load.audio('quique', 'jogo/assets/sons/quique.mp3');
        game.load.audio('gol', 'jogo/assets/sons/gol.mp3');
        
        //	Carrega os arquivos de fisica exportados pelo PhysicsEditor
        game.load.physics('fisica', 'jogo/assets/fisica.json');
    },
    
    create: function()
    {
        //sons
        sons["quique"] = game.add.audio('quique');
        sons["musica_jogo"] = game.add.audio('musica_jogo', 1, 1);

        //pausa a musica do menu
        sons["musica_menu"].pause();

        //toca a música de fundo
        sons["musica_jogo"].play();

        //cria o fundo
        var fundo = game.add.sprite(0, game.world._height, 'fundo');
        fundo.anchor.setTo(0, 1);
        fundo.width = game.width;
        fundo.height = game.height;

        //cria o placar
        placar = game.add.text(game.world.centerX, 0, 0 + " - " + 0, {
            font: "65px Arial",
            fill: "#fff",
            align: "center"
        });
        placar.anchor.x = 0.5;
        placar.anchor.y = 0;
        
        //preparar a física
        game.physics.startSystem(Phaser.Physics.P2JS);   
        //configurando a gravidade
        game.physics.p2.gravity.y = 960;
        //controla o quanto a bola quica no chão
        game.physics.p2.restitution = 0.8;
        
        this.criaChao();

        this.criaBola();
        this.criaGol();
        this.criaPlayers();

        //grupos de colisão
        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        worldCollisionGroup = game.physics.p2.createCollisionGroup();
        peCollisionGroup = game.physics.p2.createCollisionGroup();
        bolaCollisionGroup = game.physics.p2.createCollisionGroup();
        golCollisionGroup = game.physics.p2.createCollisionGroup();
        detectorGolCollisionGroup = game.physics.p2.createCollisionGroup();

        //faz com que os objetos com grupos de colisões continuem colidindo com as bordas do jogo
        game.physics.p2.updateBoundsCollisionGroup();

        chao.body.setCollisionGroup(worldCollisionGroup);
        golEsq.body.setCollisionGroup(worldCollisionGroup);
        golDir.body.setCollisionGroup(worldCollisionGroup);
        bola.body.setCollisionGroup(bolaCollisionGroup);
        players.forEach(player => {
            player.corpo.body.setCollisionGroup(playerCollisionGroup);
            player.pe.body.setCollisionGroup(peCollisionGroup); 
        });
        colisaoGolEsq.body.setCollisionGroup(detectorGolCollisionGroup);
        colisaoGolDir.body.setCollisionGroup(detectorGolCollisionGroup);

        bola.body.collides([worldCollisionGroup, playerCollisionGroup, peCollisionGroup, detectorGolCollisionGroup]);
        chao.body.collides([bolaCollisionGroup, playerCollisionGroup]);
        golEsq.body.collides([bolaCollisionGroup, playerCollisionGroup]);
        golDir.body.collides([bolaCollisionGroup, playerCollisionGroup]);
        players.forEach(player => {
            player.corpo.body.collides([bolaCollisionGroup, worldCollisionGroup, playerCollisionGroup]);
            player.pe.body.collides([bolaCollisionGroup, worldCollisionGroup]); 
        });
        colisaoGolEsq.body.collides(bolaCollisionGroup);
        colisaoGolDir.body.collides(bolaCollisionGroup);

        //materiais de contato (essa parte deve vir depois da parte que configura a física e o corpo dos objetos)
        materialPlayers = game.physics.p2.createMaterial('materialPlayers');
        players.forEach(player => {
            player.corpo.body.setMaterial(materialPlayers);
        });

        var materialMundo = game.physics.p2.createMaterial('materialMundo');
        game.physics.p2.setWorldMaterial(materialMundo, true, true, true, true);
        chao.body.setMaterial(materialMundo);
        golEsq.body.setMaterial(materialMundo);
        golDir.body.setMaterial(materialMundo);
        
        var materialContato = game.physics.p2.createContactMaterial(materialPlayers, materialMundo);
        materialContato.restitution = 0; // o player não quica no chão
        materialContato.friction = 0; //não há atrito entre o player e o chão        
    },
    
    update: function()
    {
        players.forEach(player => {
            //movimento do jogador
            if (player.botoes.left.isDown)
                player.corpo.body.moveLeft(velocidadePlayer);
            else if (player.botoes.right.isDown)
                player.corpo.body.moveRight(velocidadePlayer);

            //pulo
            if (player.botoes.up.isDown && player.podePularAgora)
                player.corpo.body.moveUp(puloPlayer);
            
            //verifica se o botão de chutar foi apertado
            if (player.botoes.kick.isDown) {
                if (player.direcaoRotacaoPe == 1 && player.pe.body.rotation >= -(1/2 * Math.PI))
                    player.periodoRotacaoPe += game.time.elapsed * 0.0001;
                else if (player.direcaoRotacaoPe == -1 && player.pe.body.rotation <= (1/2 * Math.PI))
                    player.periodoRotacaoPe -= game.time.elapsed * 0.0001;
            } else {
                if (player.direcaoRotacaoPe == 1 && player.pe.body.rotation < 0)
                    player.periodoRotacaoPe -= game.time.elapsed * 0.0001;
                else if (player.direcaoRotacaoPe == -1 && player.pe.body.rotation > 0)
                    player.periodoRotacaoPe += game.time.elapsed * 0.0001;
            }
            
            //atualiza a posição do pé do jogador
            player.pe.body.x = player.corpo.body.x - (Math.cos(player.periodoRotacaoPe * Math.PI * player.velocidadeChute + (1/2 * Math.PI)) * player.raioPe);
            player.pe.body.y = player.corpo.body.y + (Math.sin(player.periodoRotacaoPe * Math.PI * player.velocidadeChute + (1/2 * Math.PI)) * player.raioPe);
            player.pe.body.rotation = -(player.periodoRotacaoPe * Math.PI * player.velocidadeChute);
        });
    },

    criaChao: function() {
        chao = game.add.sprite(0 , game.world._height, 'chao');
        chao.height += 18;
        chao.width = game.world._width;
        chao.y -= chao.height / 2;
        chao.x += chao.width / 2;
        
        //liga a fisica
        game.physics.p2.enable(chao, false);
        
        chao.body.kinematic = true;
        
    },
    
    criaBola: function() {
        //adicionar a bola
        bola = game.add.sprite(game.world.centerX, game.world.centerY / 2, 'bola');
        bola.scale.setTo(0.5)
        
        //liga a fisica
        game.physics.p2.enable(bola);
        //massa da bola
        bola.body.mass = 1 / 2;
        
        //tamanho da malha de colisao da bola
        bola.body.setCircle(bola.width / 2);
        
        //Checando por colisões
        bola.body.onBeginContact.add(function () {
            sons["quique"].play();
        }, this);
    },
    
    criaGol: function() {
        var tamanhoGols = 1.5;
        
        //adicionar e configurar os sprites dos gols
        golEsq = game.add.sprite(0, 600, 'golEsq');
        golEsq.scale.setTo(tamanhoGols);
        golEsq.x += golEsq.width / 2;
        golEsq.y -= golEsq.height / 2 + chao.height;
        
        golDir = game.add.sprite(800, 600, 'golDir');
        golDir.scale.setTo(tamanhoGols);
        golDir.x -= golDir.width / 2;
        golDir.y -= golDir.height / 2 + chao.height;
        
        //colisão dos gols
        colisaoGolEsq = game.add.sprite(golEsq.x, golEsq.y);
        colisaoGolEsq.sensors = true;
        colisaoGolEsq.height = golEsq.height;
        
        colisaoGolDir = game.add.sprite(golDir.x, golDir.y);
        colisaoGolDir.sensors = true;
        colisaoGolDir.height = golDir.height;
        
        //liga a fisica
        game.physics.p2.enable([golEsq, golDir, colisaoGolEsq, colisaoGolDir]);
        
        //redimensiona a malha de colisão dos gols
        this.resizePolygon('fisica', 'fisica_esq', 'golEsq', tamanhoGols);
        this.resizePolygon('fisica', 'fisica_dir', 'golDir', tamanhoGols);
        
        //configura a fisica
        golEsq.body.clearShapes();
        golEsq.body.loadPolygon('fisica_esq', 'golEsq');
        golEsq.body.kinematic = true;
        
        golDir.body.clearShapes();
        golDir.body.loadPolygon('fisica_dir', 'golDir');
        golDir.body.kinematic = true;
        
        //colisão dos gols
        colisaoGolEsq.body.clearShapes();
        colisaoGolEsq.body.addRectangle(golEsq.width - bola.width, golEsq.height - golEsq.height / 10).sensor = true;
        colisaoGolEsq.body.kinematic = true;
        colisaoGolEsq.body.onBeginContact.add(body => {
            if (body == bola.body)
                this.gol(players[1]);
        }, this);
        
        colisaoGolDir.body.clearShapes();
        colisaoGolDir.body.addRectangle(golDir.width - bola.width, golDir.height - golDir.height / 10).sensor = true;
        colisaoGolDir.body.kinematic = true;
        colisaoGolDir.body.onBeginContact.add(body => {
            if (body == bola.body)
                this.gol(players[0]);
        }, this);
    },
    
    gol: function(player) {
        player.gols++;
        
        
        if (player.gols == golsMax) {
            //seta o placar
            placar.setText(players[0].gols + " - " + players[1].gols);

            this.showMessageBox(player.nome.toUpperCase() + ' VENCEU!', game.width / 2, game.height / 8);

            players[0].gols = 0;
            players[1].gols = 0;

            //som
            var somApito = new Audio('assets/sons/apito.mp3');
            somApito.play();

            game.paused = true;
            
            setTimeout( () => {
                game.paused = false;

                bola.body.x = game.world.centerX;
                bola.body.y = game.world.centerY;
    
                players[0].corpo.body.x = game.world.centerX / 2;
                players[0].corpo.body.y = game.world._height - bola.width - chao.height;
    
                players[1].corpo.body.x = game.world.centerX * 3/2;
                players[1].corpo.body.y = game.world._height - bola.width - chao.height;
    
                bola.body.setZeroRotation();
                bola.body.setZeroVelocity();
                players[0].corpo.body.setZeroVelocity();
                players[1].corpo.body.setZeroVelocity();
    
                this.hideBox();

                game.state.start('menu');
            }, 2500);
            return;
        }
    
        //som da torcida
        var somGol = new Audio('assets/sons/gol.mp3');
        somGol.play();

        //mensagem de gol
        this.showMessageBox("Gol do " + player.nome, game.width / 2, game.height / 8);

        //seta o placar
        placar.setText(players[0].gols + " - " + players[1].gols);

        //pausa o jogo
        game.paused = true;

        //despausa o jogo depois de 2 segundos
        setTimeout(() => {
            game.paused = false;

            //coloca os players e a bola nas suas posições iniciais
            bola.body.x = game.world.centerX;
            bola.body.y = game.world.centerY;

            players[0].corpo.body.x = game.world.centerX / 2;
            players[0].corpo.body.y = game.world._height - bola.width - chao.height;

            players[1].corpo.body.x = game.world.centerX * 3/2;
            players[1].corpo.body.y = game.world._height - bola.width - chao.height;

            bola.body.setZeroRotation();
            bola.body.setZeroVelocity();
            players[0].corpo.body.setZeroVelocity();
            players[1].corpo.body.setZeroVelocity();

            this.hideBox();
        }, 1000); 
    },
    
    criaPlayers: function()
    {
        //reseta o array de players
        players = [];

        //adicionar e configurar os players
        var player1 = {
            nome: "Epaminondas",
            corpo: game.add.sprite(
                game.world.centerX / 2,
                game.world._height - bola.width - chao.height,
                'player1'),
            pe: game.add.sprite(0, 0, 'pePlayer1'),
            periodoRotacaoPe: 0,
            gols: 0,
            podePularAgora: false,
            velocidadeAntesUltimaColisao: [0, 0],
            botoes: game.input.keyboard.createCursorKeys(),
            velocidadeChute: 30,
            direcaoRotacaoPe: 1
        };
        player1.botoes.kick = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        player1.botoes.up = game.input.keyboard.addKey(Phaser.Keyboard.W);
        player1.botoes.down = game.input.keyboard.addKey(Phaser.Keyboard.S);
        player1.botoes.left = game.input.keyboard.addKey(Phaser.Keyboard.A);
        player1.botoes.right = game.input.keyboard.addKey(Phaser.Keyboard.D);
    
        var player2 = {
            nome: "Himineu",
            corpo: game.add.sprite(
                game.world.centerX * 3/2,
                game.world._height - bola.width - chao.height,
                'player2'),
            pe: game.add.sprite(0, 0, 'pePlayer2'),
            periodoRotacaoPe: 0,
            gols: 0,
            podePularAgora: false,
            velocidadeAntesUltimaColisao: [0, 0],
            botoes: game.input.keyboard.createCursorKeys(),
            velocidadeChute: 30,
            direcaoRotacaoPe: -1
        };
        player2.botoes.kick = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    
        players.push(player1);
        players.push(player2);
    
        players.forEach(player => {
            player.corpo.scale.setTo(2);
            player.pe.scale.setTo(2.2);
    
            //configura a distância entre o pé e o jogador
            player.raioPe = player.corpo.height / 2 + player.corpo.height / 10;
    
            //liga a física
            game.physics.p2.enable([player.corpo, player.pe]);
    
            //configura a fisica
            player.corpo.body.setCircle(player.corpo.width / 2);
            player.corpo.body.fixedRotation = true;
    
            player.pe.body.clearShapes();
            player.pe.body.addRectangle(player.pe.width * 1, player.pe.height * 1.2, 0, (player.pe.height * 1.2) / 4);
            player.pe.body.kinematic = true;
            
            //chega se o player pode pular
            player.corpo.body.onBeginContact.add(function(body, bodyB, shapeA, shapeB, contactEquations) {
                if (body) {
                    if (body == chao.body)
                        player.podePularAgora = true;
                    else if (body == bola.body) {
                        player.velocidadeAntesUltimaColisao[0] = player.corpo.body.velocity.x;
                        player.velocidadeAntesUltimaColisao[1] = player.corpo.body.velocity.y;
                    }
                }
            }, this);
            
            player.corpo.body.onEndContact.add(function(body, bodyB, shapeA, shapeB) {
                if (body) {
                    if (body == chao.body)
                        player.podePularAgora = false;
                    else if (body == bola.body) {
                        player.corpo.body.velocity.x = player.velocidadeAntesUltimaColisao[0];
                        player.corpo.body.velocity.y = player.velocidadeAntesUltimaColisao[1];
                    }
                }
            }, this);
            
        });
    },

    showMessageBox(text, w, h) {
    	//just in case the message box already exists
    	//destroy it
        if (this.msgBox) {
            this.msgBox.destroy();
        }
        //make a group to hold all the elements
        var msgBox = game.add.group();
        //make the back of the message box
        var back = game.add.sprite(0, 0, 'fundoBotaoPausa');
        back.tint = 0x0099ff;
        //make a text field
        var text1 = game.add.text(0, 0, text);
        //set the textfeild to wrap if the text is too long
        text1.wordWrap = true;
        //make the width of the wrap 90% of the width 
        //of the message box
        text1.wordWrapWidth = w * .9;
        //
        //
        //set the width and height passed
        //in the parameters
        back.width = w;
        back.height = h;
        //
        //
        //
        //add the elements to the group
        msgBox.add(back);
        msgBox.add(text1);
        
        //set the message box in the center of the screen
        msgBox.x = game.width / 2 - msgBox.width / 2;
        msgBox.y = game.height / 2 - msgBox.height / 2;
        //
        //set the text in the middle of the message box
        text1.x = back.width / 2 - text1.width / 2;
        text1.y = back.height / 2 - text1.height / 2;
        //make a state reference to the messsage box
        this.msgBox = msgBox;
    },
    hideBox() {
    	//destroy the box when the button is pressed
        this.msgBox.destroy();
    },

    //função usada para redimensionar a malha de colisão dos gols
    resizePolygon: function(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
        var newData = [];
        var data = game.cache.getPhysicsData(originalPhysicsKey, shapeKey);
        for (var i = 0; i < data.length; i++) {
            var vertices = [];
            for (var j = 0; j < data[i].shape.length; j += 2) {
                vertices[j] = data[i].shape[j] * scale;
                vertices[j+1] = data[i].shape[j+1] * scale; 
            }
            newData.push({shape : vertices});
        }
        var item = {};
        item[shapeKey] = newData;
        game.load.physics(newPhysicsKey, '', item);
        //
        //debugPolygon(newPhysicsKey, shapeKey);
    }
    
};