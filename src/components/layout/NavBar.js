import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../../img/Logo.png';
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { Dropdown } from 'react-bootstrap';
import './NavBar.css';
import AuthService from '../auth.service';
import axios from 'axios';
import { notification } from 'antd';
const baseUrl = "http://localhost:8080";

const NavBar = () => {
    const currentUser = AuthService.getCurrentUser();

    const tipo_user = currentUser?.tipo_user?.trim().toLowerCase();
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);


    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };


    useEffect(() => {
        LoadNotificacoes();
    }, []);

    const LoadNotificacoes = async () => {
        try {
            const res = await axios.get(`${baseUrl}/notificacoes/list`);

            if (res.data.success) {
                setNotificacoes(res.data);

            } else {
                notification.error({ message: "Erro ao carregar notificações" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }


    switch (tipo_user) {
        case 'administrador':
            return (
                <nav className="nav-after-login">
                    <a href="/blog"><img className="Logo" src={Logo} alt="mhr" /></a>
                    <div>
                        <ul id="navbar" className={clicked ? "#navbar active" : "#navbar"}>
                            <Dropdown id='calendario'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='calendario'>Calendário</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="calendario-menu" href="/calendario">Calendário</Dropdown.Item>
                                    <Dropdown.Item id="calendario-menu" href="/ferias">Marcar Férias</Dropdown.Item>
                                    <Dropdown.Item id="calendario-menu" href="/faltas">Marcar Faltas</Dropdown.Item>

                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown id='vagas'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='vagas'>Vagas</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="vagas-menu" href="/vagas">Vagas</Dropdown.Item>
                                    <Dropdown.Item id="vagas-menu" href="/vagas/arquivo">Arquivo de Vagas</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown id='projetos'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='projetos'>Projetos</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="projetos-menu" href="/projetos/atuais">Projetos Atuais</Dropdown.Item>
                                    <Dropdown.Item id="projetos-menu" href="/projetos/desenvolvidos">Arquivo de Projetos</Dropdown.Item>
                                    <Dropdown.Item id="projetos-menu" href="/arquivoIdeias">Arquivo de Ideias</Dropdown.Item>
                                    <Dropdown.Item id="projetos-menu" href="/programaIdeias">Programa de Ideias</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <li><a href="/despesas" id='despesas'>Despesas</a></li>
                            <Dropdown id='blog'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='blog'>Blog</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="blog-menu" href="/blog">Blog</Dropdown.Item>
                                    <Dropdown.Item id="blog-menu" href="/blog/minhasPublicacoes">As Minhas Publicações</Dropdown.Item>
                                    <Dropdown.Item id="blog-menu" href="/blog/admin/gerirPublicacoes">Validar Publicações</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                        </ul>
                    </div>
                    <div className='nav-bar-icons'>
                        <Dropdown>
                            <Dropdown.Toggle as={'div'} className='nav-bar-icon'>
                                <IoMdNotificationsOutline size={30} color="black" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>


                                <Dropdown.Item id="notificacoes-menu" href="/ferias">
                                    Pedidos de Férias Pendentes ({notificacoes.ferias})
                                </Dropdown.Item>
                                <Dropdown.Item id="notificacoes-menu" href="/faltas">
                                    Pedidos de Faltas Pendentes ({notificacoes.faltas})
                                </Dropdown.Item>
                                <Dropdown.Item id="notificacoes-menu" href="/vagas/minhasCandidaturas">
                                    Vagas com candidaturas em análise ({notificacoes.vagas})
                                </Dropdown.Item>
                                <Dropdown.Item Item id="notificacoes-menu" href="/projetos/atuais">
                                    Sugestões de Ideias Pendentes ({notificacoes.ideias})
                                </Dropdown.Item>
                                <Dropdown.Item id="notificacoes-menu" href="/despesas">
                                    Pedidos de Reembolsos Pendentes ({notificacoes.despesas})
                                </Dropdown.Item>
                                <Dropdown.Item id="notificacoes-menu" href="/blog/admin/gerirPublicacoes">
                                    Publicações por avaliar ({notificacoes.publicacoes})
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle as={'div'} className='nav-bar-icon'>
                                <IoPersonOutline size={30} color="black" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item id="perfil-menu" href="/Perfil">Perfil</Dropdown.Item>
                                <Dropdown.Item id="perfil-menu" onClick={handleLogout}>Sair</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='navbar-menor' onClick={() => setClicked(!clicked)}>
                        <i id="menu" className={clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
                    </div>
                </nav>
            );
        case 'colaborador':
            return (
                <nav className="nav-after-login">
                    <a href="/blog"><img className="Logo" src={Logo} alt="mhr" /></a>
                    <div>
                        <ul id="navbar" className={clicked ? "#navbar active" : "#navbar"}>
                            <Dropdown id='calendario'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='calendario'>Calendário</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="calendario-menu" href="/calendario">O meu calendário</Dropdown.Item>
                                    <Dropdown.Item id="calendario-menu" href="/ferias">Marcar Férias</Dropdown.Item>
                                    <Dropdown.Item id="calendario-menu" href="/faltas">Marcar Faltas</Dropdown.Item>

                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown id='vagas'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='vagas'>Vagas</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="vagas-menu" href="/vagas">Vagas</Dropdown.Item>
                                    <Dropdown.Item id="vagas-menu" href="/vagas/minhasCandidaturas">As Minhas Candidaturas</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown id='projetos'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='projetos'>Projetos</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="projetos-menu" href="/projetos/atuais">Projetos Atuais</Dropdown.Item>
                                    <Dropdown.Item id="projetos-menu" href="/projetos/desenvolvidos">Arquivo de Projetos</Dropdown.Item>
                                    <Dropdown.Item id="projetos-menu" href="/arquivoIdeias">Arquivo de Ideias</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <li><a href="/despesas" id='despesas'>Despesas</a></li>


                            <Dropdown id='blog'>
                                <Dropdown.Toggle as={'li'}>
                                    <a id='blog'>Blog</a>
                                </Dropdown.Toggle>
                                <Dropdown.Menu >
                                    <Dropdown.Item id="blog-menu" href="/blog/">Blog</Dropdown.Item>
                                    <Dropdown.Item id="blog-menu" href="/blog/minhasPublicacoes">As Minhas Publicações</Dropdown.Item>
                                </Dropdown.Menu>

                            </Dropdown>

                        </ul>
                    </div>
                    <div className='nav-bar-icons'>
                        <Dropdown>
                            <Dropdown.Toggle as={'div'} className='nav-bar-icon'>
                                <IoPersonOutline size={30} color="black" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item id="perfil-menu" href="/Perfil">Perfil</Dropdown.Item>
                                <Dropdown.Item id="perfil-menu" onClick={handleLogout}>Sair</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='navbar-menor' onClick={() => setClicked(!clicked)}>
                        <i id="menu" className={clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
                    </div>
                </nav>
            );
        default:
            return (
                <nav className="nav-after-login">
                    {currentUser ?
                        <>
                            <a href="/"><img className="Logo" src={Logo} alt="mhr" /></a>
                            <Dropdown>
                                <Dropdown.Toggle as={'div'} className='nav-bar-icon'>
                                    <IoPersonOutline size={30} color="black" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item id="perfil-menu" onClick={handleLogout}>Sair</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown></>
                        : <a href="/"><img className="Logo" src={Logo} alt="mhr" /></a>}
                </nav>
            );
    }
};



export default NavBar;
