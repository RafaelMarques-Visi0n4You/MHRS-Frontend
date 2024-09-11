
import './Vagas.css';
import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import { notification, FloatButton, Popover, Checkbox } from 'antd';
import AuthService from '../../auth.service';
import { FaFilter } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

export default function ArquivoVagas() {
    const [vagas, setVagas] = useState([]);
    const [user, setUser] = useState({});
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            LoadVagas();
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
        }
    }, []);



    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    const LoadVagas = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/vaga/list`);
            if (response.data.success) {
                setVagas(response.data.data);
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar vagas!" });
        }
    }

    return (
        <div>
            <NavBar />
            <section className="vagas">
                <h1>Vagas</h1>
                <section className="vaga-section">
                    {vagas.length === 0 ? (
                        <p>Nenhuma vaga </p>
                    ) : (
                        vagas.map((vaga, index) => (
                            <div key={index} className="vaga-card">
                                <img
                                    className="vaga-image"
                                    src={`http://localhost:8080/${vaga.imagem}`}
                                    alt={vaga.titulo_vaga || "Visita"}
                                />
                                <h1 className="vaga-title">{vaga.titulo_vaga || "Visita"}</h1>
                                <p className="vaga-overview">{truncateText(vaga.descricao, 100)}</p>
                                <p><strong>Estado:</strong> {vaga.estado}</p>
                                <a href={`/vagas/${vaga.id_vaga}`} className="btn-detalhes">Detalhes</a>
                            </div>
                        ))
                    )}
                </section>
            </section>
            <FloatButton.BackTop />
        </div>
    );
}
