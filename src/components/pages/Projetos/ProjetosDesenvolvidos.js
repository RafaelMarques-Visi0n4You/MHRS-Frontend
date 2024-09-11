import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { notification, FloatButton } from 'antd';
import moment from 'moment';
import { MdOutlineCalendarMonth } from "react-icons/md";
import NavBar from '../../layout/NavBar';
import './PaginasProjetos.css';
import AuthService from '../../auth.service';
import { FaRegUser } from 'react-icons/fa';
const baseUrl = "http://localhost:8080";

export default function Projetos() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [projetosDesenvolvidos, setProjetosDesenvolvidos] = useState([]);
    const [projetosDesenvolvidosUser, setProjetosDesenvolvidosUser] = useState([]);
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);

    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (tipo_user === 'administrador') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                loadProjetosDesenvolvidos();
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
            }
        }
        else if (tipo_user === 'colaborador') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                loadProjetosDesenvolvidosUser(currentUser.id)
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
            }
        }
    }, []);

    const loadProjetosDesenvolvidos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/projeto/listDesenvolvidos`);
            if (res.data.success) {
                setProjetosDesenvolvidos(res.data.projetos);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projetos!" });
        }
    };

    
    const loadProjetosDesenvolvidosUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/projeto/listProjetosConcluidos/${currentUser.id}`);
            if (res.data.success) {
                setProjetosDesenvolvidosUser(res.data.projetos);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projetos!" });
        } finally {
            setLoading(false);
        }
    };
    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    switch (tipo_user) {
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className='projetos'>
                        <h1>Projetos Desenvolvidos</h1>
                    </section>
                    <section className='projetos-lista'>
                        {projetosDesenvolvidos.length === 0 ? (
                            <p>Nenhum projeto concluído </p>
                        ) : (
                            projetosDesenvolvidos.map((projeto, index) => (
                                <div key={index} className="projetos-card">
                                    <img
                                        className="projetos-image"
                                        src={`http://localhost:8080/${projeto.imagem}`}
                                    />
                                    <h1>{projeto.titulo_projeto || "Visita"}</h1>
                                    <p>{truncateText(projeto.descricao, 100)}</p>
                                    <p style={{ 'display': 'flex', alignItems: 'center' }}>
                                        <FaRegUser style={{ marginRight: '8px' }} /> Responsável: {projeto.responsavel}</p>
                                    <p style={{ 'display': 'flex', alignItems: 'center' }}>
                                    <MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de criação: {moment(projeto.data_atribuicao).format('DD-MM-YYYY')}</p>
                                    <a href={`/projetosConcluidos/${projeto.id_projeto}`} className="btn-detalhes">Detalhes</a>
                                </div>
                            ))
                        )}
                    </section>

                    <FloatButton.BackTop visibilityHeight={0} shape="circle" />

                </div>
            );
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className='projetos'>
                        <h1>Projetos Desenvolvidos</h1>
                    </section>
                    <section className='projetos-lista'>
                    {projetosDesenvolvidosUser.length === 0 ? (
                            <p>Nenhum projeto concluído </p>
                        ) : (
                            projetosDesenvolvidosUser.map((projeto, index) => (
                                <div key={index} className="projetos-card">
                                    <img
                                        className="projetos-image"
                                        src={`http://localhost:8080/${projeto.imagem}`}
                                    />
                                    <h1>{projeto.titulo_projeto || "Visita"}</h1>
                                    <p>{truncateText(projeto.descricao, 100)}</p>
                                    <p style={{ 'display': 'flex', alignItems: 'center' }}>
                                        <FaRegUser style={{ marginRight: '8px' }} /> Responsável: {projeto.responsavel}</p>
                                    <p style={{ 'display': 'flex', alignItems: 'center' }}>
                                    <MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de criação: {moment(projeto.data_atribuicao).format('DD-MM-YYYY')}</p>
                                    <a href={`/projetosConcluidos/${projeto.id_projeto}`} className="btn-detalhes">Detalhes</a>
                                </div>
                            ))
                        )}
                    </section>

                    <FloatButton.BackTop visibilityHeight={0} shape="circle" />

                </div>
            );
    }
}