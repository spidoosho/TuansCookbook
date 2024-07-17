import { useEffect, useState } from 'react';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from "./components/navbar"

function RecipeApp() {
  const [data, setData] = useState(0);

  useEffect(() => {
    async function fetchData() {
      await populateRecipeData();
    }
    fetchData(); 
  }, []);

  const contents = data === undefined ? <Row> undefined </Row> :
    <Row>
      Nazev: {data.Name}
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
    const response = await getRecipes(dbclient)
    setData(response);
  }

  async function getRecipes(dbclient) {
    const recipes = []
    const input = { TableName: 'Recipes' }
    let scan = await dbclient.send(new ScanCommand(input))

    while (scan.LastEvaluatedKey !== undefined) {
      scan.Items.forEach(function (item,) {
        return item
      })

      input.ExclusiveStartKey = scan.LastEvaluatedKey
      scan = await dbclient.send(new ScanCommand(input))
    }

    if (scan.Items !== undefined) {
      scan.Items.forEach(function (item,) {
        return item
      })
    }

    return recipes
  }
}

export default RecipeApp;