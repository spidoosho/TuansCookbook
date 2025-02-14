import {DynamoDBClient, GetItemCommand} from '@aws-sdk/client-dynamodb'
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

import Container from 'react-bootstrap/Container';
import MyNavbar from "./components/navbar"

function RecipeApp() {
    const [recipe, setRecipe] = useState(undefined);
    const {name} = useParams();

    useEffect(() => {
        async function fetchData() {
            const dbClient = new DynamoDBClient({
                region: import.meta.env.VITE_DYNAMODB_REGION,
                credentials: {
                    accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID,
                    secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY
                }
            })
            const response = await getRecipes(dbClient, name)
            setRecipe(response);
        }

        if (recipe === undefined || recipe.Name.S !== name) {
            fetchData().then();
        }
    }, [name, recipe]);

    const contents = recipe === undefined ? <Row>Wait for data to load</Row> :
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
                        {recipe.Steps.L.map((step, i) =>
                            <ListGroup.Item key={i}>{step.S}</ListGroup.Item>
                        )}
                    </ListGroup>
                </Col>
            </Row>
            <hr/>
        </div>

    return (
        <Container>
            <MyNavbar/>
            {contents}
        </Container>
    );

    async function getRecipes(dbClient, name) {
        const input = {
            "Key": {
                "Name": {
                    "S": name
                }
            },
            "TableName": "Recipes"
        };

        const response = await dbClient.send(new GetItemCommand(input))
        return response.Item
    }
}

export default RecipeApp;