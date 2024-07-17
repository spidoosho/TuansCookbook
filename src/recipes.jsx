import { useEffect, useState } from 'react';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from "./components/navbar"

function RecipeApp() {
  const [recipes, setData] = useState(0);

  useEffect(() => {
    async function fetchData() {
      await populateRecipeData();
    }
    if(recipes === 0) {
      fetchData();
      console.log(JSON.stringify(recipes))
    }
  }, []);

  const contents = recipes === 0 ? <Row> Please wait until data is loaded </Row> :
  <Row>
  {recipes.map(recipe =>
      <div key={recipe.Name.S}>
          <h2>{recipe.Name.S}</h2>
          <h4>Ingredients</h4>
          {recipe.Ingredients.SS.map(ingredient =>
              <ul key={ingredient}>
                  <li>{ingredient}</li>
              </ul>
          )}
          <h4>Steps</h4>
          {recipe.Steps.SS.map(step =>
              <ul key={step}>
                  <li>{step}</li>
              </ul>
          )}

      </div>
  )}
</Row>

  return (
    <Container>
      <MyNavbar />
      <h1 id="tableLabel">All recipes</h1>
      {contents}
    </Container>
  );

  async function populateRecipeData() {
    const dbclient = new DynamoDBClient({ region: import.meta.env.VITE_DYNAMODB_REGION, credentials: { accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID, secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY } })
    let response = []
    response = await getRecipes(dbclient)
    setData(response);
  }

  async function getRecipes(dbclient) {
    const recipes = []
    const input = { TableName: 'Recipes' }
    let scan = await dbclient.send(new ScanCommand(input))

    while (scan.LastEvaluatedKey !== undefined) {
      scan.Items.forEach(function (item,) {
        recipes.push(item)
      })

      input.ExclusiveStartKey = scan.LastEvaluatedKey
      scan = await dbclient.send(new ScanCommand(input))
    }

    if (scan.Items !== undefined) {
      scan.Items.forEach(function (item,) {
        recipes.push(item)
      })
    }

    return recipes
  }
}

export default RecipeApp;