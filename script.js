let canvas, context, w, h;
let books, n;
let states = [];
let s = 0;
let lines = `
for i in range(n):
    while stack and i - stack[-1] >= books[i] - books[stack[-1]]:
        stack.pop()
    j = stack[-1] if stack else -1
    limit = books[i] - (i - (j + 1))
    if limit < 0:
        dp.append((books[i] * (books[i] + 1)) // 2)
    else:
        dp.append(((books[i] + limit) * (i-j) // 2) + dp[j])
    stack.append(i)
return max(dp)
`.trim().split('\n');

function onLoad() {
    books = prompt("Enter the puzzle input", "1,2,3,5,6,7,0,1,2,3")
        .split(',')
        .map(x => Number(x.trim()));
    n = books.length;
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    w = canvas.width;
    h = canvas.height;
    solve();
    draw();
    document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowLeft':
                if (s > 0) {
                    s -= 1;
                    draw();
                }
                break;
            case 'ArrowRight':
                if (s < states.length - 1) {
                    s += 1;
                    draw();
                }
                break;
        }
    });
}

function addState(line, i, stack, dp, lineText, j=null) {
    states.push({line, i, stack: [...stack], dp: [...dp], lineText, j});
}

function solve() {
    let n = books.length;
    let dp = [];
    let stack = [];
    for (let i = 0; i < n; i++) {
        addState(0, i, stack, dp, `for i in range(n):  # i=${i}`);
        while (true) {
            if (stack.length === 0) {
                addState(1, i, stack, dp, `${lines[1]}  # stack is empty, which means that all previous columns are large enough for a triangle ending at ${i}`);
            } else if (books[last(stack)] >= books[i] - (i - last(stack))) {
                addState(
                    1, i, stack, dp,
                    `${lines[1]}  # checking ${i} - ${last(stack)} >= ${books[i]} - ${books[last(stack)]}, it being true means that column ${last(stack)} has enough books to join the triangle ending at ${i}`
                );
            } else {
                addState(
                    1, i, stack, dp,
                    `${lines[1]}  # checking ${i} - ${last(stack)} >= ${books[i]} - ${books[last(stack)]}, it being false means that column ${last(stack)} does not have enough books to join the triangle ending at ${i}`
                );
            }
            if (stack.length > 0 && books[last(stack)] >= books[i] - (i - last(stack))) {
                addState(2, i, stack, dp, `${lines[2]}  # popping from stack`);
                stack.pop();
            } else {
                break;
            }
        }
        let j = stack.length ? last(stack) : -1;
        let limit = books[i] - (i - (j + 1));
        addState(4, i, stack, dp, `${lines[4]}  # j=${j}, limit=${limit}`, j);
        if (limit < 0) {
            addState(5, i, stack, dp, `${lines[5]}  # limit = ${limit}, so the triangle continues all the way down to a stack size of zero`, j);
            addState(6, i, stack, dp, `${lines[6]}  # ${(books[i] * (books[i] + 1)) / 2}`, j);
            dp.push((books[i] * (books[i] + 1)) / 2);
        } else {
            if (j === -1) {
                addState(5, i, stack, dp, `${lines[5]}  # limit = ${limit}, so the triangle continues down to a stack size of ${limit}, but we don't add anything extra because j == -1`, j);
                addState(8, i, stack, dp, `${lines[8]}  # ${(books[i] + limit) * (i - j) / 2}`, j);
                dp.push((books[i] + limit) * (i - j) / 2);
            } else {
                addState(5, i, stack, dp, `${lines[5]}  # limit = ${limit}, so the triangle continues down to a stack size of ${limit} and we need to add the solution from column ${j}`, j);
                addState(8, i, stack, dp, `${lines[8]}  # ${(books[i] + limit) * (i - j) / 2} + ${dp[j]}`, j);
                dp.push((books[i] + limit) * (i - j) / 2 + dp[j]);
            }
        }
        stack.push(i);
    }
    addState(11, n, stack, dp, `Algorithm finished`);
    return Math.max(...dp);
}

function last(stack) {
    return stack[stack.length - 1];
}

function draw() {
    console.log("Draw")
    let ss = states[s];
    let heightCount = Math.max(...books) + 5.2
    let widthCount = books.length + 2;
    let height = h / heightCount;
    let width = w / widthCount;
    context.clearRect(0, 0, w, h);
    context.strokeStyle = '#ddd';
    context.fillStyle = '#ddd';
    if (ss.j !== null) {
        context.fillStyle = '#eee';
        context.beginPath();
        context.rect(width * (ss.j + 1.2), 0, width * 0.6, h);
        context.fill();
    }
    for(let y= 0; y < h; y += height) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(w, y);
        context.stroke();
    }
    for (let i = 0; i < books.length; i++) {
        context.strokeStyle = '#000';
        context.beginPath();
        context.rect(width * (i + 1.2), h - height * (books[i] + 0.2), width * 0.6, h);
        context.stroke();
        if (ss.i === i) {
            context.fillStyle = '#fda';
            context.fill();
        } else if (ss.stack.includes(i)) {
            context.fillStyle = '#ada';
            context.fill();
        }

        if (ss.dp[i] !== undefined) {
            context.strokeStyle = '#000';
            context.fillStyle = '#000';
            context.font = "30px Arial"
            context.textAlign = "center"
            context.textBaseline = "bottom"
            context.fillText(ss.dp[i], width * (i + 1.5), h - height * 0.2)
        }
    }
    context.font = "16px Courier new"
    context.textAlign = "left"
    context.textBaseline = "top"
    let fontHeight = parseFloat(context.font) + 10
    for(let i=0; i<lines.length; i++) {
        let text = lines[i];
        if (ss.line === i) {
            text = ss.lineText || text;
            context.fillStyle = '#f00';
        } else {
            context.fillStyle = '#000';
        }
        context.fillText(text, 20, 20 + i * fontHeight)
    }
}
