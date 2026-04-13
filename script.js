// --- MODELAGEM E FUNÇÕES AUXILIARES ---

// Conta pares de rainhas se atacando (0 é a solução ideal)
function contarAtaques(tabuleiro) {
    let ataques = 0;
    for (let i = 0; i < tabuleiro.length; i++) {
        for (let j = i + 1; j < tabuleiro.length; j++) {
            // Verifica mesma linha
            if (tabuleiro[i] === tabuleiro[j]) ataques++;
            // Verifica mesma diagonal
            const diffLinha = Math.abs(tabuleiro[i] - tabuleiro[j]);
            const diffColuna = Math.abs(i - j);
            if (diffLinha === diffColuna) ataques++;
        }
    }
    return ataques;
}

// Gera um array de 8 posições aleatórias (índice = coluna, valor = linha)
function gerarTabuleiroAleatorio() {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 8));
}


// --- 1. SUBIDA DE ENCOSTA (HILL CLIMBING) COM REINÍCIO ---

function hillClimbingComReinicio() {
    let reinicios = 0;
    let movimentosTotais = 0;

    while (true) {
        reinicios++;
        let atual = gerarTabuleiroAleatorio();
        let ataquesAtuais = contarAtaques(atual);

        let progredindo = true;
        while (progredindo) {
            progredindo = false;
            let melhorVizinho = [...atual];
            let melhorAtaques = ataquesAtuais;

            // Explora todos os vizinhos possíveis movendo uma rainha por coluna
            for (let col = 0; col < 8; col++) {
                for (let linha = 0; linha < 8; linha++) {
                    if (atual[col] === linha) continue;
                    
                    let vizinho = [...atual];
                    vizinho[col] = linha;
                    let ataquesVizinho = contarAtaques(vizinho);

                    if (ataquesVizinho < melhorAtaques) {
                        melhorAtaques = ataquesVizinho;
                        melhorVizinho = vizinho;
                        progredindo = true;
                    }
                }
            }
            
            atual = melhorVizinho;
            ataquesAtuais = melhorAtaques;
            movimentosTotais++;

            // Se achou a solução global, retorna
            if (ataquesAtuais === 0) {
                return { solucao: atual, ataques: 0, iteracoes: `Resolvido com ${reinicios} reinícios aleatórios e ${movimentosTotais} movimentos` };
            }
        }
        // Se saiu do while(progredindo) com ataques > 0, atingiu um mínimo local. O while(true) forçará o reinício.
    }
}


// --- 2. TÊMPERA SIMULADA (SIMULATED ANNEALING) ---

function temperaSimulada() {
    let temp = 100;
    const taxaResfriamento = 0.99;
    let atual = gerarTabuleiroAleatorio();
    let ataquesAtuais = contarAtaques(atual);
    let iteracoes = 0;

    // Roda até a temperatura esfriar ou encontrar a solução perfeita
    while (temp > 0.01 && ataquesAtuais > 0) {
        iteracoes++;
        
        // Gera um vizinho aleatório
        let proximo = [...atual];
        proximo[Math.floor(Math.random() * 8)] = Math.floor(Math.random() * 8);
        let ataquesProximo = contarAtaques(proximo);

        // Variação de energia (se for > 0, o próximo estado é melhor)
        let deltaE = ataquesAtuais - ataquesProximo; 

        // Aceita se for melhor, OU aceita piores com probabilidade baseada na temperatura
        if (deltaE > 0 || Math.random() < Math.exp(deltaE / temp)) {
            atual = proximo;
            ataquesAtuais = ataquesProximo;
        }
        
        temp *= taxaResfriamento;
    }
    
    return { solucao: atual, ataques: ataquesAtuais, iteracoes: `${iteracoes} iterações executadas` };
}


// --- 3. ALGORITMO GENÉTICO ---

function algoritmoGenetico() {
    const tamanhoPop = 100;
    const taxaMutacao = 0.1;
    let populacao = Array.from({ length: tamanhoPop }, gerarTabuleiroAleatorio);
    let limiteGeracoes = 1000;

    for (let geracao = 0; geracao < limiteGeracoes; geracao++) {
        // Avaliação (Fitness): Ordena do com menos ataques para o com mais ataques
        populacao.sort((a, b) => contarAtaques(a) - contarAtaques(b));
        
        if (contarAtaques(populacao[0]) === 0) {
            return { solucao: populacao[0], ataques: 0, iteracoes: `${geracao} gerações evoluídas` };
        }

        // Nova geração começa com os dois melhores da anterior (Elitismo)
        let novaPopulacao = [populacao[0], populacao[1]]; 

        while (novaPopulacao.length < tamanhoPop) {
            // Seleção: Pega aleatoriamente entre os 20 melhores
            let pai1 = populacao[Math.floor(Math.random() * 20)];
            let pai2 = populacao[Math.floor(Math.random() * 20)];

            // Crossover: Ponto de corte aleatório
            let ponto = Math.floor(Math.random() * 8);
            let filho = [...pai1.slice(0, ponto), ...pai2.slice(ponto)];

            // Mutação
            if (Math.random() < taxaMutacao) {
                filho[Math.floor(Math.random() * 8)] = Math.floor(Math.random() * 8);
            }
            
            novaPopulacao.push(filho);
        }
        populacao = novaPopulacao;
    }
    
    // Se não encontrou em 1000 gerações, retorna o melhor que conseguiu
    populacao.sort((a, b) => contarAtaques(a) - contarAtaques(b));
    return { solucao: populacao[0], ataques: contarAtaques(populacao[0]), iteracoes: `Limite de ${limiteGeracoes} gerações atingido` };
}


// --- INTEGRAÇÃO COM O HTML (DOM) ---

function desenharTabuleiro(tabuleiro) {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Limpa o tabuleiro anterior

    for (let linha = 0; linha < 8; linha++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Padrão de cores do xadrez
            if ((linha + col) % 2 === 0) {
                cell.classList.add('white');
            } else {
                cell.classList.add('black');
            }
            
            // Se o valor da coluna atual bate com a linha do loop, desenha a rainha
            if (tabuleiro[col] === linha) {
                cell.innerHTML = '♛'; 
                cell.classList.add('queen');
            }
            
            board.appendChild(cell);
        }
    }
}

function exibirResultados(nomeAlgoritmo, resultado) {
    document.getElementById('algoName').innerText = nomeAlgoritmo;
    document.getElementById('ataques').innerText = resultado.ataques;
    document.getElementById('iteracoes').innerText = resultado.iteracoes;
    desenharTabuleiro(resultado.solucao);
}

// Funções acionadas pelos botões
function executarHillClimbing() {
    const res = hillClimbingComReinicio();
    exibirResultados("Subida de Encosta (Reinício Aleatório)", res);
}

function executarTemperaSimulada() {
    const res = temperaSimulada();
    exibirResultados("Têmpera Simulada", res);
}

function executarAlgoritmoGenetico() {
    const res = algoritmoGenetico();
    exibirResultados("Algoritmo Genético", res);
}

// Inicia a tela com um tabuleiro vazio ou aleatório
window.onload = () => {
    desenharTabuleiro(gerarTabuleiroAleatorio());
};