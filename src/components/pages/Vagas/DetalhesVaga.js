import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, } from 'react-router-dom';
import { Button, FloatButton, Input, notification } from 'antd';
import AuthService from '../../auth.service';
import moment from 'moment';
import NavBar from '../../layout/NavBar';

import './Vagas.css';
import { MdOutlineCalendarMonth, MdOutlineMail } from 'react-icons/md';
import { FaListCheck, FaRegUser, FaUser } from "react-icons/fa6";
import { BsFileText } from "react-icons/bs";


export default function DetalhesVaga() {
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [vaga, setVaga] = useState({});
    const { id_vaga } = useParams();
    const [curriculo, setCurriculo] = useState(null);
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [numeroCandidaturas, setNumeroCandidaturas] = useState(0);
    const currentUser = AuthService.getCurrentUser();
    const tipo_user = currentUser?.tipo_user?.trim().toLowerCase();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            if (tipo_user === 'colaborador') {

                LoadVagaIndividual();
            }
            else if (tipo_user === 'administrador') {
                LoadVagaIndividual();
                fetchNumeroCandidaturas();
            }
        } else {
            LoadVagaIndividual()
        }

    }, [id_vaga, tipo_user]);

    const LoadVagaIndividual = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/vaga/list/${id_vaga}`);
            if (res.data.success) {
                setVaga(res.data.data);
                console.log(res.data.data);
            } else {
                notification.error({ message: "Erro ao carregar dados da vaga" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };


    const fetchNumeroCandidaturas = async () => {
        try {
            const url = `http://localhost:8080/candidaturas/count/${id_vaga}`;
            const res = await axios.get(url);
            console.log(res.data);
            if (res.data.success) {
                setNumeroCandidaturas(res.data.totalCandidatos);
            } else {
                notification.error({ message: "Erro ao carregar dados da vaga" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const handleSubmit = async () => {

        if (!curriculo) {
            notification.error({ message: 'Selecione um ficheiro!' });
            return;
        }

        const formData = new FormData();
        formData.append('cv', curriculo);
        formData.append('id_vaga', id_vaga);
        formData.append('informacoes_contacto', currentUser.email);
        formData.append('nome_candidato', currentUser.nome_utilizador);

        try {
            const response = await axios.post('http://localhost:8080/candidaturas/upload', formData);
            if (response.data.success) {
                notification.success({ message: "Candidatura efetuada com sucesso!" });
                setCurriculo(null);
                LoadVagaIndividual();
            } else {
                notification.error({ message: "Erro ao enviar a candidatura" });
            }

        } catch (error) {
            console.error('Erro ao enviar o arquivo:', error);
            notification.error({ message: 'Erro ao enviar o arquivo. Por favor, tente novamente.' });
        }
    };

    const handleSubmitCandidaturaVisitante = async () => {

        if (!curriculo) {
            notification.error({ message: 'Selecione um ficheiro!' });
            return;
        }

        const formData = new FormData();
        formData.append('cv', curriculo);
        formData.append('id_vaga', id_vaga);
        formData.append('email', email);
        formData.append('nome_candidato', nome);


        try {
            const response = await axios.post('http://localhost:8080/candidaturas/create/userVisitante', formData);
            if (response.data.success) {
                notification.success({ message: "Candidatura efetuada com sucesso!" });
                setCurriculo(null);
                setEmail('');
                setNome('');
                LoadVagaIndividual();
                navigate("/vagas");

            } else {
                notification.error({ message: "Erro ao enviar a candidatura" });
            }

        } catch (error) {
            console.error('Erro ao enviar o arquivo:', error);
            notification.error({ message: 'Erro ao enviar o arquivo. Por favor, tente novamente.' });
        }
    };
    switch (tipo_user) {
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className='vaga-individual'>
                        <h1>{vaga?.titulo_vaga}</h1>
                        <div className="container-detalhes">
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} className='data-criacao' /><strong>Data de Criação:</strong></h5>
                            <h6>{moment(vaga?.data_criacao).format('DD-MM-YYYY')}</h6>
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} /><strong>Data de Conclusão das Candidaturas:</strong></h5>
                            <h6>{moment(vaga?.data_encerramento).format('DD-MM-YYYY')}</h6>
                        </div>

                        <div className='descricao-vaga'>
                            <h2><BsFileText style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Descrição</strong></h2>
                            <h3>{vaga?.descricao}</h3>
                        </div>

                        <div className='requisitos'>
                            <h2><FaListCheck style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Requisitos</strong></h2>
                            <ul>
                                {vaga?.requisitos?.map((requisito, index) => (
                                    <li key={index}>{requisito}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="container-candidatos">
                            <h2><strong>Não percas a oportunidade!</strong></h2>
                            <h2><strong>Candidata-te!</strong></h2>
                            <h3 htmlFor="curriculo">Anexa o teu currículo!</h3>
                            <Input
                                className="Input-ficheiro-complementar"
                                type="file"
                                accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                                onChange={(e) => setCurriculo(e.target.files[0])}
                            />
                            <Button onClick={handleSubmit} className="btn-candidatos">Candidatar-me</Button>
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className='vaga-individual'>
                        <h1>{vaga?.titulo_vaga}</h1>
                        <div className="container-detalhes">
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} className='data-criacao' /><strong>Data de Criação:</strong></h5>
                            <h6>{moment(vaga?.data_criacao).format('DD-MM-YYYY')}</h6>
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} /><strong>Data de Conclusão das Candidaturas:</strong></h5>
                            <h6>{moment(vaga?.data_encerramento).format('DD-MM-YYYY')}</h6>

                            {vaga?.estado?.trim() === 'Atribuída' &&

                                <div>
                                    <h5><FaRegUser style={{ marginRight: '8px' }} /><strong>Atribuída a:</strong></h5>
                                    <h6>{vaga?.candidato_escolhido}</h6>
                                    <h5><MdOutlineMail style={{ marginRight: '8px' }}/><strong>Email do Candidato:</strong></h5>
                                    <h6>{vaga?.contacto_candidato_escolhido}</h6>
                                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} /><strong>Data de Atribuição:</strong></h5>
                                    <h6>{moment(vaga?.data_atribuicao).format('DD-MM-YYYY')}</h6>
                                </div>
                            }
                        </div>

                        <div className='descricao-vaga'>
                            <h2><BsFileText style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Descrição</strong></h2>
                            <h3>{vaga?.descricao}</h3>
                        </div>

                        <div className='requisitos'>
                            <h2><FaListCheck style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Requisitos</strong></h2>
                            <ul>
                                {vaga?.requisitos?.map((requisito, index) => (
                                    <li key={index}>{requisito}</li>
                                ))}
                            </ul>
                        </div>
                        {(vaga?.estado?.trim() === 'Em aberto' || vaga?.estado?.trim() === 'Em análise') &&
                            <div className="container-candidatos">
                                <h2 className="titulo-candidatos"><strong>Número de Candidatos:</strong></h2>
                                <h1 className='numero-candidatos'><strong>{numeroCandidaturas}</strong></h1>
                                <Button href={`/vagas/admin/candidaturas/${vaga?.id_vaga}`} className="btn-candidatos">Avaliar Candidatos</Button>
                            </div>
                        }

                        
                    </section>
                    <FloatButton.BackTop />
                </div>
            );

        default:
            return (
                <div>
                    <NavBar />
                    <section className='vaga-individual'>
                        <h1>{vaga?.titulo_vaga}</h1>
                        <div className="container-detalhes">
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} className='data-criacao' /><strong>Data de Criação:</strong></h5>
                            <h6>{moment(vaga?.data_criacao).format('DD-MM-YYYY')}</h6>
                            <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} /><strong>Data de Conclusão das Candidaturas:</strong></h5>
                            <h6>{moment(vaga?.data_encerramento).format('DD-MM-YYYY')}</h6>
                        </div>

                        <div className='descricao-vaga'>
                            <h2><BsFileText style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Descrição</strong></h2>
                            <h3>{vaga?.descricao}</h3>
                        </div>

                        <div className='requisitos'>
                            <h2><FaListCheck style={{ marginRight: '10px', fontSize: '20px', display: 'inline-flex' }} /><strong>Requisitos</strong></h2>
                            <ul>
                                {vaga.requisitos?.map((requisito, index) => (
                                    <li key={index}>{requisito}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="container-candidatos">
                            <h2><strong>Não percas a oportunidade!</strong></h2>
                            <h2><strong>Candidata-te!</strong></h2>
                            <h3 htmlFor="curriculo">Anexa o teu currículo!</h3>
                            <Input
                                className="Input-ficheiro-complementar"
                                type="file"
                                accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                                onChange={(e) => setCurriculo(e.target.files[0])}
                            />
                            <p><strong>Nome:</strong>
                                <Input
                                    type="text"
                                    style={{ width: '100%' }}
                                    placeholder='Insira o seu nome'
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)} />
                            </p>
                            <p><strong>Email:</strong>
                                <Input className='input-email'
                                    type="text"
                                    style={{ width: '100%' }}
                                    placeholder='Insira um email de contacto'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} />
                            </p>
                            <Button onClick={handleSubmitCandidaturaVisitante} className="btn-candidatos">Candidatar-me</Button>
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div>
            )
    }
}

