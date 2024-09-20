import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import { notification, FloatButton } from 'antd';
import axios from 'axios';
import './PaginasBlog.css';
import AuthService from '../../auth.service';

export default function Blog() {
    const [publicacoes, setPublicacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        loadPublicacoes();
    }, []);

    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    const loadPublicacoes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/blog/list/validadas');
            setPublicacoes(response.data.publicacoes);
        } catch (error) {
            console.error('Erro ao procurar publicações:', error);
            notification.error({ message: 'Erro ao procurar publicações' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>A carregar...</p>;
    }

    return (
        <div>
            <NavBar />
            <header className="header">
                <div className="content">
                    <h1 className="heading">
                        <span className='no-fill'>Olá, {currentUser.nome_utilizador}!</span>
                        <span className='small'>Bem-vindo ao nosso blog!</span>
                    </h1>
                </div>
            </header>
            <section className="blog-section">
                {publicacoes.length === 0 ? (
                    <p>Nenhuma publicação </p>
                ) : (
                    publicacoes.map((publicacao, index) => (
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
            </section>

            <FloatButton.BackTop />
        </div>
    );
}
