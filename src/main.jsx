import Container from 'react-bootstrap/Container';
import MyNavbar from "./components/navbar"

function MainApp() {
    const contents = <h1>Main Page - Tuan&apos;s Cookbook </h1>

    return (
        <Container>
            <MyNavbar/>
            {contents}
        </Container>
    );
}

export default MainApp;