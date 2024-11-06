import {useEffect, useState} from 'react';
import {DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb'
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MyNavbar from "./components/navbar"

function MainApp() {
    const [recipes, setData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const dbClient = new DynamoDBClient({
                region: import.meta.env.VITE_DYNAMODB_REGION,
                credentials: {
                    accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY
                }
            })

            const response = await getRecipes(dbClient)
            setData(response);
        }

        if (recipes === null) {
            fetchData().then();
        }

    }, [recipes]);

    const contents = recipes === null ? <Row> Please wait until data is loaded </Row> :
        <div>
            {recipes.map(recipe =>
                <div key={recipe.Name.S}>
                    <h1>{recipe.Name.S}</h1>
                    <Row>
                        <Col sm={6}>
                            <h5>Ingredients</h5>
                            <ListGroup>
                                {recipe.Ingredients.SS.map(ingredient =>
                                    <ListGroup.Item key={ingredient}>{ingredient}</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Col>
                        <Col sm={6}>
                            <h5>Steps</h5>
                            <ListGroup numbered>
                                {recipe.Steps.L.sort().map((ingredient, i) =>
                                    <ListGroup.Item key={i}>{ingredient.S}</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Col>
                    </Row>
                    <hr/>
                </div>
            )}
        </div>

    return (
        <Container>
            <MyNavbar/>
            {contents}
        </Container>
    );

    async function getRecipes(dbClient) {
        const recipes = []
        const input = {TableName: 'Recipes'}
        let scan = await dbClient.send(new ScanCommand(input))

        while (scan.LastEvaluatedKey !== undefined) {
            scan.Items.forEach(function (item,) {
                recipes.push(item)
            })

            input.ExclusiveStartKey = scan.LastEvaluatedKey
            scan = await dbClient.send(new ScanCommand(input))
        }

        if (scan.Items !== undefined) {
            scan.Items.forEach(function (item,) {
                recipes.push(item)
            })
        }

        return recipes
    }
}

export default MainApp;