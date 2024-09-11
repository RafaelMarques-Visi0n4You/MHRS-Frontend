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
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar carregar projeto!" });
        } finally {
            setLoading(false);
        }
    };

    const handleAdicionarObjetivo = async () => {
        if (novoObjetivo.trim() === '') {
            notification.error({ message: 'O objetivo não pode estar vazio.' });
            return;
        }

        const novosObjetivos = [...objetivos, { descricao: novoObjetivo, data_criacao: new Date(), concluido: false, user_conclui: null }];

        try {
            const response = await axios.put(`http://localhost:8080/projeto/update/${id_projeto}`, {
                objetivos: novosObjetivos,
            });

            if (response.data.success) {
                setObjetivos(novosObjetivos);
                setNovoObjetivo('');
                setInputObjetivo(false);
                notification.success({ message: 'Objetivo adicionado com sucesso!' });
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            console.error("Erro ao tentar atualizar objetivos:", error);
            notification.error({ message: "Erro ao tentar atualizar objetivos!" });
        }
    };

    const handleSelectChange = (value) => {
        setSelectedDevelopers(value);
    };

    const handleAdicionarDesenvolvedor = async () => {
        try {
            const response = await axios.put(`http://localhost:8080/projeto/update/desenvolvedores/${id_projeto}`, {
                desenvolvedores: selectedDevelopers
            });

            if (response.data.success) {
                notification.success({ message: 'Desenvolvedores atualizados com sucesso!' });
                setSelectedDevelopers([]);
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            console.error("Erro ao tentar adicionar desenvolvedores:", error);
            notification.error({ message: "Erro ao tentar adicionar desenvolvedores!" });
        }
    };

    const handleComentario = (e) => {
        setComentario(e.target.value);
    };

    const handleSubmitComentarios = async () => {
        if (!comentario.trim()) return;

        setLoading(true);

        try {
            const response = await axios.post(`http://localhost:8080/projeto/create/comentarios/${id_projeto}`, {
                comentarios: [
                    {
                        descricao: comentario,
                        autor_comentario: currentUser.nome_utilizador,
                    },
                ],
            });

            if (response.data.success) {
                setTodosComentarios(prevComentarios => [response.data.projeto.comentarios.slice(-1)[0], ...prevComentarios]);
                setComentario("");
            } else {
                console.error("Erro ao adicionar comentário:", response.data.message);
            }
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPontoBloqueio = async () => {
        if (!pontoBloqueio.trim()) return;

        setLoading(true);

        try {
            const response = await axios.post(`http://localhost:8080/projeto/create/pontosBloqueio/${id_projeto}`, {
                pontosBloqueio: [
                    {
                        descricao: pontoBloqueio,
                        autor_pontoBloqueio: currentUser.nome_utilizador,
                    },
                ],
            });

            if (response.data.success) {
                setTodosPontosBloqueio(prevPontosBloqueio => [response.data.projeto.pontosBloqueio.slice(-1)[0], ...prevPontosBloqueio]);
                setPontoBloqueio("");
                setInputPontoBloqueio(false);

            } else {
                console.error("Erro ao adicionar ponto de bloqueio:", response.data.message);
            }
        } catch (error) {
            console.error("Erro ao adicionar ponto de bloqueio:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePontoBloqueioConcluido = async (descricao) => {
        const newCheckedItems = { ...checkedItems, [descricao]: !checkedItems[descricao] };
        setCheckedItems(newCheckedItems);

        try {
            const response = await axios.put(`http://localhost:8080/projeto/update/concluirPontosBloqueio/${id_projeto}`, {
                pontosBloqueio: Object.keys(newCheckedItems).map(desc => ({
                    descricao: desc,
                    concluido: newCheckedItems[desc],
                }))
            });

            if (response.data.success) {
                notification.success({ message: 'Objetivo concluído com sucesso!' });
                setTodosPontosBloqueio(prevItems => prevItems.map(item =>
                    item.descricao === descricao ? { ...item, concluido: newCheckedItems[descricao] } : item
                ));
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            console.error("Erro ao atualizar o item:", error);
            setCheckedItems(prevCheckedItems => ({
                ...prevCheckedItems,
                [descricao]: !prevCheckedItems[descricao]
            }));
        }
    };


    const handleProjetoConcluido = async () => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8080/projeto/update/concluirProjeto/${id_projeto}`);
            if (response.data.success) {
                setProjeto(response.data.projeto);
                notification.success({ message: 'Projeto concluído com sucesso!' });
                navigate('/projetos/atuais');
            } else {
                console.error("Erro ao atualizar estado do projeto:", response.data.message);
            }
        } catch (error) {
            console.error("Erro ao atualizar estado do projeto:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleObjetivoConcluido = async (descricao) => {
        const newCheckedItems = { ...checkedItems, [descricao]: !checkedItems[descricao] };
        setCheckedItems(newCheckedItems);

        try {
            const response = await axios.put(`http://localhost:8080/projeto/update/concluirObjetivos/${id_projeto}`, {
                objetivos: Object.keys(newCheckedItems).map(desc => ({
                    descricao: desc,
                    concluido: newCheckedItems[desc],
                }))
            });

            if (response.data.success) {
                notification.success({ message: 'Objetivo concluído com sucesso!' });
                setObjetivos(prevItems => prevItems.map(item =>
                    item.descricao === descricao ? { ...item, concluido: newCheckedItems[descricao] } : item
                ));
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            console.error("Erro ao atualizar o item:", error);
            setCheckedItems(prevCheckedItems => ({
                ...prevCheckedItems,
                [descricao]: !prevCheckedItems[descricao]
            }));
        }
    };

    const handleInputPontoBloqueio = () => {
        setMostrarInput(!mostrarInput);
    };

    const verificarResponsavel = user && responsavel === user.nome_utilizador;

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
                    {verificarResponsavel && (
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
                                                    {!item.concluido && (
                                                        <Checkbox
                                                            checked={!!checkedItems[item.descricao]}
                                                            onChange={() => handleObjetivoConcluido(item.descricao)}
                                                        >
                                                            <p>{item.descricao}</p>
                                                        </Checkbox>
                                                    )}
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
                                                    {!item.concluido && (
                                                        <Checkbox
                                                            checked={!!checkedItems[item.descricao]}
                                                            onChange={() => handlePontoBloqueioConcluido(item.descricao)}
                                                        >
                                                            <p>{item.descricao}</p>
                                                        </Checkbox>
                                                    )}
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



                            <div style={{ display: 'flex', gap: '10px' }}>
                                {!inputObjetivo && !inputPontoBloqueio && (
                                    <>
                                        <Button
                                            className="adicionar-objetivos"
                                            onClick={() => {
                                                setInputObjetivo(true);
                                                setInputPontoBloqueio(false);
                                            }}
                                        >
                                            <FaPlus /> Objetivo
                                        </Button>
                                        <Button
                                            className="adicionar-objetivos"
                                            onClick={() => {
                                                setInputPontoBloqueio(true);
                                                setInputObjetivo(false);
                                            }}
                                        >
                                            <FaPlus /> Ponto de Bloqueio
                                        </Button>
                                    </>
                                )}

                                {inputPontoBloqueio && (
                                    <div style={{ width: '100%' }}>
                                        <Input.TextArea
                                            style={{ width: '100%', marginBottom: '10px' }}
                                            value={pontoBloqueio}
                                            onChange={(e) => setPontoBloqueio(e.target.value)}
                                            placeholder="Insira o seu ponto de bloqueio"
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Button className="adicionar-objetivos" onClick={handleSubmitPontoBloqueio}>
                                                <FaPlus /> Ponto de Bloqueio
                                            </Button>
                                            <Button className="btn-cancel" onClick={() => setInputPontoBloqueio(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {inputObjetivo && (
                                    <div style={{ width: '100%' }}>
                                        <Input.TextArea
                                            style={{ width: '100%', marginBottom: '10px' }}
                                            value={novoObjetivo}
                                            onChange={(e) => setNovoObjetivo(e.target.value)}
                                            placeholder="Insira um objetivo"
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Button className="adicionar-objetivos" onClick={handleAdicionarObjetivo}>
                                                <FaPlus /> Objetivo
                                            </Button>
                                            <Button className="btn-cancel" onClick={() => setInputObjetivo(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                
                            </div>
                        </>
                    )
                    }
                    {
                        !verificarResponsavel && (
                            <>
                                <Timeline className='timeline' mode="alternate">
                                    {objetivos.map((objetivo, index) => (
                                        <Timeline.Item className='timeline-item' position="right" key={index}>
                                            <div className="timeline-item-content">
                                                <p style={{ fontWeight: '700' }}>Objetivo</p>
                                                <p>{objetivo.descricao}</p>
                                                <p>Data de início: {moment(objetivo.data_criacao).format('DD-MM-YYYY')}</p>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                    {todosPontosBloqueio.map((pontoBloqueio, index) => (
                                        <Timeline.Item className='timeline-item' position="left" key={index}>
                                            <div className="timeline-item-content">
                                                <p style={{ fontWeight: '700' }}>Ponto de Bloqueio </p>
                                                <Checkbox
                                                    checked={!!checkedItems[index + objetivos.length]}
                                                    onChange={() => {
                                                        setCheckedItems(prev => ({
                                                            ...prev,
                                                            [index + objetivos.length]: !prev[index + objetivos.length]
                                                        }));
                                                    }}
                                                >
                                                    <p style={{ textDecoration: checkedItems[index + objetivos.length] ? 'line-through' : 'none' }}>
                                                        {pontoBloqueio.descricao}
                                                    </p>
                                                </Checkbox>
                                                <p>Data bloqueio: {moment(pontoBloqueio.data_criacao).format('DD-MM-YYYY')}</p>
                                                <p>Autor do bloqueio: {pontoBloqueio.autor_pontoBloqueio}</p>
                                                <p>Data resolução: {pontoBloqueio.data_resolucao}</p>

                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                                <Button className="adicionar-objetivos" onClick={handleInputPontoBloqueio}>
                                    <FaPlus /> Ponto de Bloqueio
                                </Button>
                                {mostrarInput && (
                                    <>
                                        <Input.TextArea
                                            style={{ width: '100%' }}
                                            value={pontoBloqueio}
                                            onChange={(e) => setPontoBloqueio(e.target.value)}
                                            placeholder='Insira o seu ponto de bloqueio'
                                        />
                                        <div>
                                            <Button className="adicionar-objetivos" onClick={handleSubmitPontoBloqueio}>
                                                <FaPlus /> Ponto de Bloqueio
                                            </Button>
                                            <Button className="adicionar-objetivos" onClick={handleInputPontoBloqueio}>
                                                Cancelar
                                            </Button>
                                        </div>

                                    </>
                                )}
                            </>
                        )
                    }
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

                        {verificarResponsavel ? (
                            <>

                                <Select
                                    mode="multiple"
                                    style={{ width: '200px', maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}
                                    placeholder="Selecione desenvolvedores"
                                    value={selectedDevelopers}
                                    onChange={handleSelectChange}
                                >
                                    {developers.map(dev => (
                                        <Option key={dev.id_user} value={dev.nome_utilizador} disabled={dev.nome_utilizador === responsavel} >
                                            {dev.nome_utilizador === responsavel ? `${dev.nome_utilizador} (Responsável)` : dev.nome_utilizador}
                                        </Option>
                                    ))}
                                </Select>
                                <br />
                                <Button className='btn-desenvolvedor' onClick={handleAdicionarDesenvolvedor} style={{ marginTop: '10px' }}>
                                    Adicionar Desenvolvedores
                                </Button>
                            </>
                        ) : (
                            selectedDevelopers.map((dev, index) => (
                                <p key={index}>{dev.nome_utilizador}</p>
                            ))
                        )}
                    </h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Atribuição:</h5>
                    <h6>{moment(dataAtribuicao).format('DD-MM-YYYY')}</h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Início:</h5>
                    <h6>{moment(dataInicio).format('DD-MM-YYYY')}</h6>
                    <h5><MdOutlineCalendarMonth style={{ marginRight: '8px' }} />Data de Conclusão Prevista:</h5>
                    <h6>{moment(dataFinalPrevista).format('DD-MM-YYYY')}</h6>

                    {verificarResponsavel &&
                        <Button htmlType="submit" className='concluir-btn' onClick={handleProjetoConcluido}>
                            Concluir Projeto
                        </Button>}
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
                    <div className='comentarios'>
                        <Input.TextArea
                            value={comentario}
                            onChange={handleComentario}
                            placeholder='Escreva um comentário...'
                        />
                        {comentario && (
                            <Button
                                className='btn-comentario'
                                onClick={handleSubmitComentarios}
                            >
                                Publicar
                            </Button>
                        )}
                    </div>
                </div>
            </section >
            <FloatButton.BackTop />
        </div >
    );
}
