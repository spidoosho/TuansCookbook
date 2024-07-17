import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from "./components/navbar"
function RecipeApp() {
    const [recipes, setRecipes] = useState(0);

    useEffect(() => {
        populateRecipeData();
    }, []);

    const contents = recipes === undefined
        ? <Row><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></Row>
        :
        <Row>
            {recipes.map(recipe =>
                <div>
                    <h1>{recipe.name}</h1>
                    <p>{recipe.description}</p>
                    <table className="table table-striped" aria-labelledby="tableLabel">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recipe.ingredients.map(ingredient =>
                                <tr key={ingredient.name}>
                                    <td>{ingredient.name}</td>
                                    <td>{ingredient.amount}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
        const response = await fetch('recipe');
        const data = await response.json();
        setRecipes(data);
    }
}

export default RecipeApp;