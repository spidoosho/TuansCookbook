import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { useState } from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import Container from "react-bootstrap/Container";
import MyNavbar from "./components/navbar";

function AddRecipeApp() {
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);

  const handleIngredientsChange = (index, event) => {
    let data = [...ingredients];
    data[index] = event.target.value;
    if (index == data.length - 1) {
      data.push("");
    }
    setIngredients(data);
  };

  const handleStepsChange = (index, event) => {
    let data = [...steps];
    data[index] = event.target.value;
    if (index == data.length - 1) {
      data.push("");
    }
    setSteps(data);
  };

  const contents = (
    <div>
      <h1>Add new recipe</h1>
      <Form onSubmit={async (event) => CreateRecipe(event)}>
        <Form.Group className="mb-3" controlId="Recipe">
          <Form.Label>Recipe name</Form.Label>
          <Form.Control type="text" placeholder="Add recipe name" />
        </Form.Group>
        <Row>
          <Col sm={6}>
            <h5>Ingredients</h5>
            <Form.Group className="mb-3" controlId="Ingredients">
              {ingredients.map((num, index) => {
                return (
                  <div key={index}>
                    <Form.Control
                      type="text"
                      placeholder="Add ingredient"
                      onChange={(event) =>
                        handleIngredientsChange(index, event)
                      }
                    />
                  </div>
                );
              })}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <h5>Steps</h5>
            <Form.Group className="mb-3" controlId="Steps">
              {steps.map((num, index) => {
                return (
                  <div key={index}>
                    <Form.Control
                      type="text"
                      placeholder="Add step"
                      onChange={(event) => handleStepsChange(index, event)}
                    />
                  </div>
                );
              })}
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={2}>
            <Form.Group controlId="password">
              <Form.Control
                type="password"
                placeholder="secret"
                inputMode="numeric"
              />
            </Form.Group>
          </Col>
          <Col sm={2}>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );

  return (
    <Container>
      <MyNavbar />
      {contents}
    </Container>
  );

  async function CreateRecipe(event) {
    event.preventDefault();
    alert(`Code: ${import.meta.env.VITE_CODE}`);
    console.log(`Code: ${import.meta.env.VITE_CODE}`);

    if (
      event.target[event.target.length - 2].value !== import.meta.env.VITE_CODE
    ) {
      alert("Wrong code");
      return;
    }

    const dbclient = new DynamoDBClient({
      region: import.meta.env.VITE_DYNAMODB_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_DYNAMODB_SECRET_ACCESS_KEY,
      },
    });

    let recipe = undefined;
    const ingredientsArr = [];
    const stepsArr = [];
    let i = 0;

    if (event.target[i].id === "Recipe") {
      if (event.target[i].value.trim().length != 0) {
        recipe = event.target[0].value;
      }
      i += 1;
    }

    while (event.target[i].id === "Ingredients") {
      if (event.target[i].value.trim().length != 0) {
        ingredientsArr.push(event.target[i].value);
      }
      i += 1;
    }

    while (event.target[i].id === "Steps") {
      if (event.target[i].value.trim().length != 0) {
        console.log(event.target[i].value.trim().length);
        stepsArr.push({
          S: event.target[i].value,
        });
      }
      i += 1;
    }

    if (
      recipe === undefined ||
      ingredientsArr.length === 0 ||
      stepsArr.length === 0
    ) {
      alert("Fill every item");
      return;
    }

    const input = {
      TableName: "Recipes",
      Item: {
        Name: {
          S: recipe,
        },
        Ingredients: {
          SS: ingredientsArr,
        },
        Steps: {
          L: stepsArr,
        },
      },
    };

    await dbclient.send(new PutItemCommand(input));
  }
}

export default AddRecipeApp;
