import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { notification, Form, Popover, Input, Button, DatePicker, Space, FloatButton } from 'antd';
import NavBar from '../../layout/NavBar';
import './PaginasProjetos.css';
import { MdOutlineCalendarMonth } from "react-icons/md";
import moment from 'moment';
import AuthService from '../../auth.service';
import { CiCirclePlus } from "react-icons/ci";
import { FaRegUser } from 'react-icons/fa';

const baseUrl = "http://localhost:8080";

export default function ProjetosAtuais() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [projetosAtuais, setProjetosAtuais] = useState([]);
    const [projetosAtuaisUser, setProjetosAtuaisUser] = useState([]);
    const [user, setUser] = useState({});
    const [objetivos, setObjetivos] = useState([{ value: '' }]);
    const [dataInicio, setDataInicio] = useState(null);
    const [dataFinalPrevista, setDataFinalPrevista] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (tipo_user === 'administrador') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                loadProjetosAtuais();
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
            }
        }
        else if (tipo_user === 'colaborador') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                loadProjetosAtuaisUser(currentUser.id)
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
            }
        }
    }, []);

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const loadProjetosAtuais = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/projeto/listEmDesenvolvimento`);
            if (res.data.success) {
                setProjetosAtuais(res.data.projetos);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projetos!" });
        } finally {
            setLoading(false);
        }
    };

    const loadProjetosAtuaisUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/projeto/listProjetosAtuais/${currentUser.id}`);
            if (res.data.success) {
                setProjetosAtuaisUser(res.data.projetos);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projetos!" });
        } finally {
            setLoading(false);
        }
    };


    const handleSubmitProjeto = async () => {
        const formData = new FormData();
        formData.append('titulo_projeto', titulo);
        formData.append('descricao', descricao);
        formData.append('objetivos', JSON.stringify(objetivos.map(o => o.value)));
        formData.append('data_inicio', dataInicio ? dataInicio.format('YYYY-MM-DD') : '');
        formData.append('data_final_prevista', dataFinalPrevista ? dataFinalPrevista.format('YYYY-MM-DD') : '');

        try {
            const response = await axios.post(`${baseUrl}/projeto/create`, formData);
            if (response.data.success) {
                notification.success({ message: "Projeto submetido com sucesso!" });
                loadProjetosAtuais();
                hide();
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar adicionar projeto!" });
        }
    };

    const addObjective = () => {
        setObjetivos([...objetivos, { value: '' }]);
    };

    const removeObjective = (index) => {
        setObjetivos(objetivos.filter((_, i) => i !== index));
    };

    const handleObjectiveChange = (value, index) => {
        const newObjetivos = [...objetivos];
        newObjetivos[index].value = value;
        setObjetivos(newObjetivos);
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
                        <h1>Projetos Atuais</h1>
                        <Popover
                            className='popover-projeto'
                            content={
                                <Form
                                    style={{ gap: '5px' }}
                                    onFinish={handleSubmitProjeto}
                                    layout="vertical"
                                >
                                    <Input
                                        placeholder='Título do Projeto'
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />


                                    <Input.TextArea
                                        placeholder='Descreve o teu projeto'
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                    />


                                    {objetivos.map((obj, index) => (
                                        <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Input
                                                placeholder="Objetivo"
                                                value={obj.value}
                                                onChange={(e) => handleObjectiveChange(e.target.value, index)}
                                            />
                                            <Button type="link" onClick={() => removeObjective(index)}>Remover</Button>
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={addObjective} icon={<CiCirclePlus />}>
                                        Adicionar Objetivo
                                    </Button>


                                    <p style={{ width: '100%' }}><strong>Data de Início:</strong>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            value={dataInicio}
                                            onChange={(date) => setDataInicio(date)}
                                        />
                                    </p>
                                   
                                    <p style={{ width: '100%' }}><strong>Data Final Prevista:</strong>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            value={dataFinalPrevista}
                                            onChange={(date) => setDataFinalPrevista(date)}
                                        />
                                    </p>

                                    <Button htmlType="submit" className="btn-submit-projeto">Submeter</Button>

                                </Form>
                            }
                            title="Submete o teu projeto!"
                            trigger="click"
                            open={open}
                            onOpenChange={handleOpenChange}
                        >
                            <CiCirclePlus className="icone-plus" />
                        </Popover>
                    </section>
                    <section className='projetos-lista'>
                        {projetosAtuais.length === 0 ? (
                            <p>Nenhum projeto em desenvolvimento</p>
                        ) : (
                            projetosAtuais.map((projeto, index) => (
                                <div key={index} className="projetos-card">
                                    <img
                                        className="projetos-image"
                                        src={`http://localhost:8080/${projeto.imagem}`}
                                        alt="Imagem do Projeto"
                                    />
                                    <h1>{projeto.titulo_projeto}</h1>
                                    <p>{truncateText(projeto.descricao, 100)}</p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaRegUser style={{ marginRight: '8px' }} /> Responsável: {projeto.responsavel}
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <MdOutlineCalendarMonth style={{ marginRight: '8px' }} /> Data de criação: {moment(projeto.data_atribuicao).format('DD-MM-YYYY')}
                                    </p>
                                    <a href={`/projetos/${projeto.id_projeto}`} className="btn-detalhes">Detalhes</a>
                                </div>
                            ))
                        )}
                    </section>
                    <FloatButton.BackTop />
                </div>
            );

        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className='projetos'>
                        <h1>Projetos Atuais</h1>
                    </section>
                    <section className='projetos-lista'>
                        {projetosAtuaisUser.length === 0 ? (
                            <p>Nenhum projeto em desenvolvimento</p>
                        ) : (
                            projetosAtuaisUser.map((projeto, index) => (
                                <div key={index} className="projetos-card">
                                    <img
                                        className="projetos-image"
                                        src={`http://localhost:8080/${projeto.imagem}`}
                                        alt="Imagem do Projeto"
                                    />
                                    <h1>{projeto.titulo_projeto}</h1>
                                    <p>{truncateText(projeto.descricao, 100)}</p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaRegUser style={{ marginRight: '8px' }} /> Responsável: {projeto.responsavel}
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <MdOutlineCalendarMonth style={{ marginRight: '8px' }} /> Data de criação: {moment(projeto.data_atribuicao).format('DD-MM-YYYY')}
                                    </p>
                                    <a href={`/projetos/${projeto.id_projeto}`} className="btn-detalhes">Detalhes</a>
                                </div>
                            ))
                        )}
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
    }
}
