import MyNavbar from "./components/navbar"
import Container from 'react-bootstrap/Container';

function MainApp() {
    const contents = <h1>Main App</h1>

    return (
        <Container>
            <MyNavbar />
            {contents}
        </Container>
    );
}

export default MainApp;