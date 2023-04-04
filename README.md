# stashaway

This application is a simple REST API with just a single PUT method which holds the solution to the task given.

## Getting started

To run the solution:

- change the directory to '/stashaway' and run 'tsc' in the shell. This will compile the typescript files and generate the javascript files
- change the directory to '/stashaway/dist' and run 'node app.js' to start the application.
- Trigger a PUT request to the web server 'deposit' endpoint (e.g. https://stashaway.minghaochai.repl.co/deposit) with the following sample request body:

"depositPlans":
[
{
"id": "DP1",
"type": 0,
"portfolios": [
{
"portfolioId": "high",
"allocationAmount": 10000
},
{
"portfolioId": "retire",
"allocationAmount": 500
}
]
},
{
"id": "DP2",
"type": 1,
"portfolios": [
{
"portfolioId": "high",
"allocationAmount": 0
},
{
"portfolioId": "retire",
"allocationAmount": 100
}
]
}
],
"fundDeposits": [
{
"amountDeposited": 10500
},
{
"amountDeposited": 100
}
]
