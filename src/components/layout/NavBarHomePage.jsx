import { Link } from 'react-router-dom';
import Logo from '../../img/Logo_preto.png';
import './NavBarHomePage.css';

function NavBarHomePage() {
    return (
        <nav className='navBarHome'>
            <Link to="/"><img className="Logo" src={Logo} alt="mhr" /></Link>
            <Link to="/vagas" className="Vagas">Vagas</Link>
            <Link to="/user/registo" className="Registo">Registar</Link>
            <Link to="/user/login" className="IniciarSessao">Iniciar Sessão</Link>
        </nav>
    )

}
export default NavBarHomePage;