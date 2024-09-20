import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import AuthService from '../../auth.service';
import { FloatButton, notification } from 'antd';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import './PaginasBlog.css';
import { FaRegUser } from "react-icons/fa";
import { MdOutlineCalendarMonth } from "react-icons/md";

export default function DetalhesPublicacao() {
    const { id_publicacao } = useParams();
    const [publicacao, setPublicacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [descricao, setDescricao] = useState('');
    const [tituloPublicacao, setTituloPublicacao] = useState('');
    const [tipoPublicacao, setTipoPublicacao] = useState('');
    const [autor, setAutor] = useState('');
    const [dataNoticia, setDataNoticia] = useState(null);
    const [visitaData, setVisitaData] = useState({
        dataVisita: null,
        motivoVisita: '',
        duracaoVisita: '',
        localVisita: '',
    });
    const [publicacoesRecentes, setPublicacoesRecentes] = useState([]);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            loadPublicacao(id_publicacao);
            loadPublicacoesRecentes(id_publicacao);
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }
    }, [id_publicacao]);

    const loadPublicacao = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/blog/list/${id_publicacao}`);
            if (response.data.success) {
                const fetchedPublicacao = response.data.publicacao;
                const tipoPublicacao = response.data.tipo_publicacao;
                const user = response.data.user;

                if (!fetchedPublicacao) {
                    throw new Error('Publicação não encontrada');
                }

                setPublicacao(fetchedPublicacao);
                setDescricao(fetchedPublicacao.descricao || '');
                setTituloPublicacao(fetchedPublicacao.titulo_publicacao || '');
                setAutor(user ? user.nome_utilizador : '');
                setTipoPublicacao(tipoPublicacao || '');

                if (tipoPublicacao === 'Notícia') {
                    setDataNoticia(fetchedPublicacao.data_noticia ? moment(fetchedPublicacao.data_noticia) : null);
                } else if (tipoPublicacao === 'Visita') {
                    setVisitaData({
                        dataVisita: fetchedPublicacao.data_visita ? moment(fetchedPublicacao.data_visita) : null,
                        motivoVisita: fetchedPublicacao.motivo_visita || '',
                        duracaoVisita: fetchedPublicacao.duracao_visita || '',
                        localVisita: fetchedPublicacao.local_visita || '',
                    });
                }
            } else {
                notification.error({ message: 'Erro ao encontrar publicação' });
            }
        } catch (error) {
            console.error('Erro ao encontrar publicação:', error);
            notification.error({ message: 'Erro ao encontrar publicação' });
        } finally {
            setLoading(false);
        }
    };

    const loadPublicacoesRecentes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/blog/list/validadas');
            if (response.data.success) {
                const todasPublicacoes = response.data.publicacoes;

                const idPublicacaoAtual = String(id_publicacao);

                const publicacoesFiltradas = todasPublicacoes
                    .filter(pub => String(pub.id_publicacao) !== idPublicacaoAtual);
                const publicacoesOrdenadas = publicacoesFiltradas
                    .sort((a, b) => new Date(b.data) - new Date(a.data));

                const publicacoesMaisRecentes = publicacoesOrdenadas.slice(0, 4);
                setPublicacoesRecentes(publicacoesMaisRecentes);
            } else {
                notification.error({ message: 'Erro ao encontrar publicações relacionadas' });
            }
        } catch (error) {
            console.error('Erro ao encontrar publicações relacionadas:', error);
            notification.error({ message: 'Erro ao encontrar publicações relacionadas' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>A carregar publicação...</div>;
    }

    if (!publicacao) {
        return <div>Publicação não encontrada.</div>;
    }

    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    return (
        <div>
            <NavBar />
            <img
                className="banner"
                src={`http://localhost:8080/${publicacao.imagem}`}
                alt={publicacao.titulo_publicacao || "Visita"}
            />
            <section className="blog-individual">
                <h1>{tituloPublicacao}</h1>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaRegUser style={{ marginRight: '8px' }} />
                        <h6 style={{ margin: 0 }}>{autor}</h6>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <MdOutlineCalendarMonth style={{ marginRight: '8px' }} />
                        <h6 style={{ margin: 0 }}>
                            {tipoPublicacao === 'Notícia' ?
                                (dataNoticia ? dataNoticia.format('DD/MM/YYYY') : 'Data não disponível')
                                : tipoPublicacao === 'Visita' ?
                                    (visitaData.dataVisita ? visitaData.dataVisita.format('DD/MM/YYYY') : 'Data não disponível')
                                    : 'Tipo de publicação não identificado'
                            }
                        </h6>
                    </div>
                </div>
                <p className='descricao'>{descricao}</p>
            </section>
            <section>
                <h2 className='mais-recentes'>Mais recentes</h2>
                <div className="blog-section">
                    {publicacoesRecentes.length === 0 ? (
                        <p>Nenhuma publicação recente</p>
                    ) : (
                        publicacoesRecentes.map((publicacao, index) => (
                            <div key={index} className="blog-card">
                                <img
                                    className="blog-image"
                                    src={`http://localhost:8080/${publicacao.imagem}`}
                                    alt={publicacao.titulo_publicacao || "Visita"}
                                />
                                <h1 className="blog-title">{publicacao.titulo_publicacao || "Visita"}</h1>
                                <p className="blog-overview">{truncateText(publicacao.descricao, 100)}</p>
                                <a href={`/blog/${publicacao.id_publicacao}`} className="btn-detalhes">Detalhes</a>
                            </div>
                        ))
                    )}
                </div>
            </section>
            <FloatButton.BackTop />
        </div>
    );
}
