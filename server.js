
const express = require('express');
// we'll use morgan to log the HTTP layer
const morgan = require('morgan');
// we'll use body-parser's json() method to 
// parse JSON data sent in requests to this app
const bodyParser = require('body-parser');

// we import the ShoppingList model, which we'll
// interact with in our GET endpoint
const {ShoppingList, Recipes} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some items to ShoppingList
// so there's some data to look at. Note that 
// normally you wouldn't do this. Usually your
// server will simply expose the state of the
// underlying database.
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

// when the root of this route is called with GET, return
// all current ShoppingList items by calling `ShoppingList.get()`
app.get('/shopping-list', (req, res) => {
  res.json(ShoppingList.get());
});

//created recipes for initial rendering
Recipes.create('cake', ['flour', 'eggs', 'milk', 'sugar']);
Recipes.create('waffles', ['waffle mix', 'water']);
Recipes.create('chocolate milk', ['cocoa', 'milk', 'sugar'])

//when user visits /recipes they should GET a return object
//of the current recipes
app.get('/recipes', (req, res) => {
	res.json(Recipes.get());
});

app.post('/recipes', jsonParser, (req, res) => {
  const requiredFields = ['name', 'ingredients'];

  // if(Object.keys(req.body).length !== requiredFields.length) {
  //   return res.status(400).send('Argument length does not match. Expected name and ingredients.');
  // }

  for(let reqField of requiredFields) {
    if(!(reqField in req.body)) {
      // tell the client that the request is bad
      return res.status(400).send(`Missing ${reqField} in request body`);
    }
  }

  res.json(Recipes.create(req.body.name, req.body.ingredients));
});

app.delete('/recipes/:id', (req, res) => {
  Recipes.delete(req.params.id);
  res.status(204).end();
});


app.put('/recipes/:id', jsonParser, (req, res) => {
	const requiredFields = ['name', 'id', 'ingredients'];
	for (let reqField of requiredFields) {
		if(!(reqField in req.body)) {
			const message = `${reqField} needs to be included in the request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.params.id !== req.body.id) {
		const message = `Request path id ${req.params.id} and request body id ${req.params.id} must match`;
		console.error(message);
		return res.status(400).send(message);
	}
	Recipes.update({
		name: req.body.name,
		id: req.params.id,
		ingredients: req.body.ingredients
	});
	res.status(204).end();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
