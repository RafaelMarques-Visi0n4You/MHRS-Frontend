import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();

    const renderLinks = () => {
        switch (tipo_user) {
            case 'administrador':
                return (
                    <footer>
                        <Link to="/blog/admin" class="blog-footer">Blog</Link>
                    </footer>
                )
            case 'colaborador':
                return (
                    <footer>
                        <Link to="/blog" class="blog-footer">Blog</Link>
                    </footer>
                )

            default:
                return null;
        }
    };
    return (
        <div>
            {renderLinks()}
        </div>
    );
}

export default Footer;