// Função para criar os campos de entrada da matriz A
function createMatrixA(size) {
    var matrixA = document.getElementById('matrix-a');
    matrixA.innerHTML = '<h2>Matriz A</h2>';

    for (var i = 0; i < size; i++) {
        var row = document.createElement('div');

        for (var j = 0; j < size; j++) {
            var input = document.createElement('input');
            input.type = 'number';
            row.appendChild(input);
        }

        matrixA.appendChild(row);
    }
}

// Função para criar os campos de entrada da matriz B
function createMatrixB(size) {
    var matrixB = document.getElementById('matrix-b');
    matrixB.innerHTML = '<h2>Matriz B</h2>';

    for (var i = 0; i < size; i++) {
        var input = document.createElement('input');
        input.type = 'number';
        matrixB.appendChild(input);
    }
}

// Função para obter os valores da matriz A
function getMatrixA(size) {
    var matrixA = [];
    var inputs = document.querySelectorAll('#matrix-a input');

    for (var i = 0; i < inputs.length; i += size) {
        var row = [];

        for (var j = 0; j < size; j++) {
            row.push(parseFloat(inputs[i + j].value));
        }

        matrixA.push(row);
    }

    return matrixA;
}

// Função para obter os valores da matriz B
function getMatrixB(size) {
    var matrixB = [];
    var inputs = document.querySelectorAll('#matrix-b input');

    for (var i = 0; i < inputs.length; i++) {
        matrixB.push(parseFloat(inputs[i].value));
    }

    return matrixB;
}

// Função para exibir os passos da resolução
function displaySteps(steps) {
    var stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '<h2>Passo a Passo</h2>';

    for (var i = 0; i < steps.length; i++) {
        var step = document.createElement('p');
        step.textContent = steps[i];
        stepsDiv.appendChild(step);
    }
}

// Função para calcular o sistema linear
function calculate() {
    var method = document.getElementById('method').value;
    var size = parseInt(document.getElementById('size').value);
    var matrixA = getMatrixA(size);
    var matrixB = getMatrixB(size);
    var epsilon = parseFloat(document.getElementById('epsilon').value);

    var solution;
    var steps;

    if (method === 'gauss') {
        var result = gauss(matrixA, matrixB);
        solution = result.solution;
        steps = result.steps;
    } else if (method === 'gauss-seidel') {
        var result = gaussSeidel(matrixA, matrixB, epsilon);
        solution = result.solution;
        steps = result.steps;
    } else if (method === 'lu') {
        var result = solveLU(matrixA, matrixB);
        solution = result.solution;
        steps = result.steps;
    }

    displaySteps(steps);
    displaySolution(solution);
}

// Função para formatar a solução limitando os números decimais e exibir como x1, x2 e x3
function formatSolution(solution) {
    var formattedSolution = solution.map(function(num, index) {
        return 'X' + (index + 1) + ': ' + num.toFixed(2);
    });

    return formattedSolution.join('\n');
}

// Função para exibir a solução
function displaySolution(solution) {
    var solutionDiv = document.getElementById('solution');
    solutionDiv.innerHTML = '<h2>Solução</h2>';
    var solutionText = document.createElement('p');
    solutionText.textContent = formatSolution(solution);
    solutionDiv.appendChild(solutionText);
}

// Event listener para atualizar as matrizes quando o tamanho é alterado
document.getElementById('size').addEventListener('change', function () {
    var size = parseInt(this.value);
    createMatrixA(size);
    createMatrixB(size);
});

// Event listener para calcular o sistema linear
document.getElementById('calculate-btn').addEventListener('click', calculate);

function gauss(matrixA, matrixB) {
    var size = matrixA.length;
    var steps = [];

    // Eliminação de Gauss
    for (var i = 0; i < size - 1; i++) {
        // Pivô atual
        var pivot = matrixA[i][i];
        steps.push('Passo ' + (i + 1) + ':');
        steps.push('- Pivô = ' + pivot.toFixed(4));

        // Percorre as linhas abaixo do pivô
        for (var j = i + 1; j < size; j++) {
            // Fator para zerar o elemento abaixo do pivô
            var factor = matrixA[j][i] / pivot;

            // Modifica a linha j
            for (var k = i; k < size; k++) {
                matrixA[j][k] -= factor * matrixA[i][k];
            }
            matrixB[j] -= factor * matrixB[i];

            // Adiciona a modificação da linha ao passo atual
            var modifiedRow = 'Linha ' + (j + 1) + ' = Linha ' + (j + 1) + ' - ' + factor.toFixed(4) + ' * Linha ' + (i + 1);
            steps.push('    - ' + modifiedRow);
        }
    }

    // Substituição regressiva
    var solution = new Array(size).fill(0);

    for (var i = size - 1; i >= 0; i--) {
        var sum = 0;

        for (var j = i + 1; j < size; j++) {
            sum += matrixA[i][j] * solution[j];
        }

        solution[i] = (matrixB[i] - sum) / matrixA[i][i];
    }

    steps.push('Solução:');
    for (var i = 0; i < size; i++) {
        steps.push('x' + (i + 1) + ': ' + solution[i].toFixed(4));
    }

    return { solution: solution, steps: steps };
}

function gaussSeidel(matrixA, matrixB, epsilon) {
    var size = matrixA.length;
    var maxIterations = 10; // Número máximo de iterações
    var steps = [];

    // Inicialização da solução
    var solution = new Array(size).fill(0);

    // Iterações
    var iteration = 0;
    var error = epsilon + 1;

    while (iteration < maxIterations && error > epsilon) {
        error = 0;

        for (var i = 0; i < size; i++) {
            var prevSolution = solution[i];
            var sum = 0;

            for (var j = 0; j < size; j++) {
                if (j !== i) {
                    sum += matrixA[i][j] * solution[j];
                }
            }

            solution[i] = (matrixB[i] - sum) / matrixA[i][i];
            error += Math.abs(solution[i] - prevSolution);
        }

        iteration++;

        // Adiciona o estado atual ao passo a passo
        steps.push('Iteração ' + iteration + ':');
        for (var i = 0; i < size; i++) {
            steps.push('    x' + (i + 1) + ': ' + solution[i].toFixed(5));
        }

        steps.push('    Erro: ' + error.toFixed(5));
    }

    steps.push('Solução:');
    for (var i = 0; i < size; i++) {
        steps.push('x' + (i + 1) + ': ' + solution[i].toFixed(5));
    }

    return { solution: solution, steps: steps };
}

// Função para resolver o sistema linear usando o método LU
function solveLU(matrixA, matrixB) {
    var size = matrixA.length;
    var steps = [];

    // Fatoração LU
    var L = new Array(size).fill(0).map(() => new Array(size).fill(0));
    var U = new Array(size).fill(0).map(() => new Array(size).fill(0));
    var P = new Array(size).fill(0).map((_, i) => i);

    for (var i = 0; i < size; i++) {
        L[i][i] = 1;

        for (var j = i; j < size; j++) {
            var sum = 0;

            for (var k = 0; k < i; k++) {
                sum += L[i][k] * U[k][j];
            }

            U[i][j] = matrixA[i][j] - sum;
        }

        for (var j = i + 1; j < size; j++) {
            var sum = 0;

            for (var k = 0; k < i; k++) {
                sum += L[j][k] * U[k][i];
            }

            L[j][i] = (matrixA[j][i] - sum) / U[i][i];
        }
    }

    steps.push('Passo 1: Fatoração LU');
    steps.push('- Matriz L:');
    steps.push(L.map(row => '[' + row.map(num => num.toFixed(1)).join(', ') + ']').join('\n'));
    steps.push('- Matriz U:');
    steps.push('\n' + U.map(row => '\n[' + row.map(num => num.toFixed(1)).join(', ') + ']\n'));

    // Substituição progressiva (Ly = B)
    var y = new Array(size).fill(0);

    for (var i = 0; i < size; i++) {
        var sum = 0;

        for (var j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }

        y[i] = (matrixB[P[i]] - sum) / L[i][i];
    }

    // Substituição regressiva (Ux = y)
    var solution = new Array(size).fill(0);

    for (var i = size - 1; i >= 0; i--) {
        var sum = 0;

        for (var j = i + 1; j < size; j++) {
            sum += U[i][j] * solution[j];
        }

        solution[i] = (y[i] - sum) / U[i][i];
    }

    steps.push('Passo 2: Substituição progressiva (Ly = B)');
    steps.push('- Vetor y:');
    steps.push('[' + y.map(num => num.toFixed(5)).join(',\t') + ']');

    steps.push('Passo 3: Substituição regressiva (Ux = y)');
    steps.push('- Solução:');
    steps.push(solution.map(num =>'[' + num.toFixed(5) + ']').join('\n'));

    return { solution: solution, steps: steps };
}


