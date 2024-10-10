const express = require('express');
const natural = require('natural');
const path = require('path');

const app = express();

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Use middleware to handle form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tokenizer function using 'natural'
const tokenizer = new natural.WordTokenizer();

// Store previous inputs (for demo purposes, stored in memory)
let previousSentences = [];

// Home route to take user input
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tokenize, Plot and Predict</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center space-y-6">
            <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 class="text-3xl font-bold mb-6 text-center animate-bounce">Tokenize, Plot & Predict</h1>
                <p class="text-gray-600 mb-4 text-center">Enter a sentence below to see its tokens, visualize the results, and predict the next token length.</p>
                <form action="/tokenize" method="post" class="space-y-4">
                    <label class="block text-gray-700 font-semibold">Enter a sentence:</label>
                    <input type="text" name="sentence" class="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your sentence here" required />
                    <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out">
                        Tokenize, Plot & Predict
                    </button>
                    <a href="/" class="text-gray-500 text-center block mt-2">Reset</a>
                </form>
            </div>

            <!-- Previous Inputs Section -->
            <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-6">
                <h2 class="text-xl font-semibold mb-4 text-center">Previous Inputs</h2>
                <ul class="list-disc list-inside text-gray-700">
                    ${previousSentences.length > 0 
                        ? previousSentences.map(sentence => `<li>${sentence}</li>`).join('') 
                        : '<p class="text-gray-500 text-center">No previous inputs yet.</p>'}
                </ul>
            </div>
        </body>
        </html>
    `);
});

// Route to handle tokenization and plotting
app.post('/tokenize', (req, res) => {
    const sentence = req.body.sentence;
    const tokens = tokenizer.tokenize(sentence);

    // Store the sentence in the previous input list
    previousSentences.push(sentence);
    if (previousSentences.length > 5) previousSentences.shift();  // Keep only the last 5 inputs

    // Create data for 3D plot
    const x = [];
    const y = [];
    const z = [];

    // Generate random data for each token and prepare arrays for plotting
    tokens.forEach((token, index) => {
        x.push(index); // Token index as 'x'
        y.push(token.length);  // Token length as 'y'
        z.push(Math.random() * 10);  // Random 'z' value
    });

    // Calculate the prediction: Average token length as a simple "prediction"
    const avgTokenLength = tokens.reduce((acc, token) => acc + token.length, 0) / tokens.length;
    const predictedTokenLength = avgTokenLength.toFixed(2); // Limit prediction to 2 decimal places

    // Serve the HTML with embedded plot and styling
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tokenize, Plot and Predict</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center space-y-6">
            <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-3xl">
                <h1 class="text-2xl font-bold mb-4 text-center animate-pulse">3D Token Plot</h1>
                <p class="text-center mb-4 text-gray-700">Tokens: <strong>${tokens.join(', ')}</strong></p>
                <p class="text-center mb-6 text-gray-700">Prediction: The predicted next token length is: <strong>${predictedTokenLength}</strong> characters</p>
                <div id="plot" class="h-96"></div>
            </div>

            <a href="/" class="text-blue-500 hover:text-blue-700 font-semibold underline">Try another sentence</a>

            <script>
                const trace = {
                    x: ${JSON.stringify(x)},
                    y: ${JSON.stringify(y)},
                    z: ${JSON.stringify(z)},
                    mode: 'markers+text',  // Display markers and text
                    marker: {
                        size: 12,
                        line: {
                            color: 'rgba(217, 217, 217, 0.14)',
                            width: 0.5
                        },
                        opacity: 0.8
                    },
                    text: ${JSON.stringify(tokens)}, // Labels for each token
                    textposition: 'top center',  // Position of the text relative to the points
                    type: 'scatter3d'
                };

                const layout = {
                    title: '3D Token Plot with Labels',
                    autosize: true,
                    scene: {
                        xaxis: { title: 'Token Index' },
                        yaxis: { title: 'Token Length' },
                        zaxis: { title: 'Random Z' }
                    }
                };

                const data = [trace];
                Plotly.newPlot('plot', data, layout);
            </script>
        </body>
        </html>
    `);
});

// Start the server
const port = 3001;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
