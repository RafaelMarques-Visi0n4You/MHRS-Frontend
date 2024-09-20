import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import axios from 'axios';
import AuthService from '../../auth.service';
import { Button, notification, Input, Checkbox, Select, FloatButton, Timeline } from 'antd';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import './PaginasProjetos.css';
import { FaPlus, FaRegUser } from "react-icons/fa";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { FaCommentDots } from "react-icons/fa";
import { LuFileText } from "react-icons/lu";

const { Option } = Select;

export default function ProjetoDetalhes() {
    const { id_projeto } = useParams();
    const [projeto, setProjeto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [descricao, setDescricao] = useState('');
    const [objetivos, setObjetivos] = useState([]);
    const [tituloProjeto, setTituloProjeto] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [dataAtribuicao, setDataAtribuicao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFinalPrevista, setDataFinalPrevista] = useState('');
    const [novoObjetivo, setNovoObjetivo] = useState('');
    const [comentario, setComentario] = useState('');
    const [todosComentarios, setTodosComentarios] = useState([]);
    const [todosPontosBloqueio, setTodosPontosBloqueio] = useState([]);
    const [pontoBloqueio, setPontoBloqueio] = useState('');
    const currentUser = AuthService.getCurrentUser();
    const [mostrarInput, setMostrarInput] = useState(false);
    const [developers, setDevelopers] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [selectedDevelopers, setSelectedDevelopers] = useState([]);
    const [inputPontoBloqueio, setInputPontoBloqueio] = useState(false);
    const [inputObjetivo, setInputObjetivo] = useState(false);
    const [desenvolvedores, setDesenvolvedores] = useState([]);
    const [dataConclusao, setDataConclusao] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            loadProjetoIndividual(id_projeto);
            loadUsers();
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }
    }, [id_projeto]);


    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/user/list');
            if (res.data.success) {
                setDevelopers(res.data.data);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar utilizadores!" });
        } finally {
            setLoading(false);
        }
    };

    const loadProjetoIndividual = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/projeto/list/${id_projeto}`);
            if (res.data.success) {
                setProjeto(res.data.projeto);
                setDescricao(res.data.projeto.descricao);
                setObjetivos(res.data.projeto.objetivos || []);
                setTituloProjeto(res.data.projeto.titulo_projeto);
                setResponsavel(res.data.projeto.responsavel);
                setDataAtribuicao(res.data.projeto.data_atribuicao);
                setDataInicio(res.data.projeto.data_inicio);
                setDataFinalPrevista(res.data.projeto.data_final_prevista);
                setTodosComentarios(res.data.projeto.comentarios || []);
                setTodosPontosBloqueio(res.data.projeto.pontosBloqueio || []);
                setDesenvolvedores(res.data.projeto.desenvolvedores || []);
                setDataConclusao(res.data.projeto.data_conclusao);
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projeto!" });
        } finally {
            setLoading(false);
        }
    };

    const timeline = [
        ...objetivos.flatMap(objetivo => [
            {
                type: 'objetivo',
                data_criacao: objetivo.data_criacao,
                data_conclusao: objetivo.data_conclusao,
                descricao: objetivo.descricao,
                concluido: false,
                user_conclui: null,
            },
            objetivo.concluido && {
                type: 'objetivo',
                data_criacao: objetivo.data_criacao,
                data_conclusao: objetivo.data_conclusao,
                descricao: objetivo.descricao,
                concluido: true,
                user_conclui: objetivo.user_conclui,
            }
        ].filter(Boolean)),
        ...todosPontosBloqueio.flatMap(pontoBloqueio => [
            {
                type: 'pontoBloqueio',
                data_criacao: pontoBloqueio.data_criacao,
                data_conclusao: pontoBloqueio.data_resolucao,
                descricao: pontoBloqueio.descricao,
                autor_pontoBloqueio: pontoBloqueio.autor_pontoBloqueio,
                concluido: false,
            },
            pontoBloqueio.concluido && {
                type: 'pontoBloqueio',
                data_criacao: pontoBloqueio.data_criacao,
                data_conclusao: pontoBloqueio.data_resolucao,
                descricao: pontoBloqueio.descricao,
                autor_pontoBloqueio: pontoBloqueio.autor_pontoBloqueio,
                concluido: true,
            }
        ].filter(Boolean))
    ];

    const dataMaisRecente = (item) => {
        if (item.type === 'objetivo') {
            return item.concluido ? item.data_conclusao : item.data_criacao;
        }
        return item.data_criacao;
    };

    const ordenarTimeline = timeline.slice().sort((a, b) => {
        return moment(dataMaisRecente(a)).isBefore(moment(dataMaisRecente(b))) ? -1 : 1;
    });

    return (
        <div>
            <NavBar />
            <section className="projeto-individual">
                <h1>{tituloProjeto}</h1>

                <div className="info">
                    <h2><LuFileText style={{ marginRight: '8px' }} />Descrição</h2>
                    <p style={{ marginLeft: '35px' }}>{descricao}</p>
                </div>

                <div className="objetivos">
                        <>
                            <Timeline className='timeline' mode="alternate">
                                {ordenarTimeline.map((item, index) => {
                                    if (item.type === 'objetivo') {
                                        return (
                                            <Timeline.Item
                                                key={`objetivo-${index}`}
                                                className='timeline-item'
                                                position="right"
                                            >
                                                <div className="timeline-item-content">
                                                    <p style={{ fontWeight: '700' }}>
                                                        {item.concluido ? 'Objetivo Concluído:' : 'Objetivo'}
                                                    </p>
                                                    
                                                    {item.concluido && (
                                                        <p>{item.descricao}</p>
                                                    )}
                                                    <p>Data de início: {moment(item.data_criacao).format('DD-MM-YYYY')}</p>
                                                    {item.concluido && (
                                                        <p>Data de conclusão: {moment(item.data_conclusao).format('DD-MM-YYYY')}</p>
                                                    )}
                                                </div>
                                            </Timeline.Item>
                                        );
                                    }
                                    if (item.type === 'pontoBloqueio') {
                                        return (
                                            <Timeline.Item
                                                key={`pontoBloqueio-${index}`}
                                                className='timeline-item'
                                                position="left"
                                            >
                                                <div className="timeline-item-content">
                                                    <p style={{ fontWeight: '700' }}>
                                                        {item.concluido ? 'Ponto de Bloqueio Concluído:' : 'Ponto de Bloqueio'}
                                                    </p>
                                                    
                                                    {item.concluido && (
                                                        <p>{item.descricao}</p>
                                                    )}
                                                    <p>Data bloqueio: {moment(item.data_criacao).format('DD-MM-YYYY')}</p>
                                                    <p>Autor do bloqueio: {item.autor_pontoBloqueio}</p>
                                                    {item.concluido && (
                                                        <p>Data resolução: {moment(item.data_conclusao).format('DD-MM-YYYY')}</p>
                                                    )}
                                                </div>
                                            </Timeline.Item>
                                        );
                                    }
                                    return null;
                                })}
                            </Timeline>



                            
                                
                        </>
                
                </div >

                <div className="breves-info">
                    <h5><FaRegUser style={{ marginRight: '8px' }} />Responsável:</h5>
                    <h6>{responsavel}</h6>
                    <h5><FaRegUser style={{ marginRight: '8px' }} />Desenvolvedores:</h5>
                    <h6>
                        <ul>
                            {desenvolvedores.map((dev, index) => (
                                <li key={index}>
                                    {dev}
                                </li>
                            ))}
                        </ul>
                    </h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Atribuição:</h5>
                    <h6>{moment(dataAtribuicao).format('DD-MM-YYYY')}</h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Início:</h5>
                    <h6>{moment(dataInicio).format('DD-MM-YYYY')}</h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Conclusão Prevista:</h5>
                    <h6>{moment(dataFinalPrevista).format('DD-MM-YYYY')}</h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Conclusão: </h5>
                    <h6>{moment(dataConclusao).format('DD-MM-YYYY')}</h6>
                </div>
                <div className='comentarios-projeto'>
                    <h5><FaCommentDots style={{ marginRight: '8px' }} />Comentários</h5>
                    <ul style={{ margin: '40px' }}>
                        {todosComentarios.map((comentario, index) => (
                            <li key={index}>
                                <strong>{comentario.autor_comentario}</strong>: {comentario.descricao}
                                <br />
                                <small>{moment(comentario.data_criacao).format('DD-MM-YYYY HH:mm')}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            </section >
        <FloatButton.BackTop />
        </div >
    );
}
