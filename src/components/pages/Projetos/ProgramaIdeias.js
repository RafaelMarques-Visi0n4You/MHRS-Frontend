import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { notification, Table, Form, Popover, Input, Button, Modal, DatePicker } from 'antd';
import NavBar from '../../layout/NavBar';
import moment from 'moment';
import './PaginasProjetos.css';
import AuthService from '../../auth.service';
import { CiCirclePlus } from "react-icons/ci";

import { useParams } from 'react-router-dom';
const baseUrl = "http://localhost:8080";

export default function ProgramaIdeias() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const { id_user } = useParams();
    const [user, setUser] = useState({});
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [ficheiroComplementar, setFicheiroComplementar] = useState(null);
    const [selectedIdeia, setSelectedIdeia] = useState({});
    const [isModalIdeiaIndividual, setIsModalIdeiaIndividual] = useState(false);
    const [isRejeitadaIdeiaModalOpen, setIsRejeitadaIdeiaModalOpen] = useState(false);
    const [isEditarIdeiaModalOpen, setIsEditarIdeiaModalOpen] = useState(false);
    const [ideiasEmEstudo, setIdeiasEmEstudo] = useState([]);
    const [dataConclusao, setDataConclusao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isModalAprovarIdeia, setIsModalAprovarIdeia] = useState(false);

    const currentUser = AuthService.getCurrentUser();

    const columns = tipo_user === "administrador" ? [
        { title: 'Título', dataIndex: 'titulo_ideia', key: 'titulo_ideia' },
        { title: 'Autor', dataIndex: 'autor', key: 'autor' },
        { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', render: (descricao) => truncateText(descricao, 50) },
        { title: 'Data de Criação', dataIndex: 'data_criacao', key: 'data_criacao', render: date => moment(date).format('DD/MM/YYYY') },
        { title: 'Ficheiro Complementar', dataIndex: 'ficheiro_complementar', key: 'ficheiro_complementar', render: (ficheiro) => <a href={`http://localhost:8080/${ficheiro}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>Ver ficheiro</a> },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },

    ] : [
        { title: 'Título', dataIndex: 'titulo_ideia', key: 'titulo_ideia' },
        { title: 'Descrição', dataIndex: 'descricao', key: 'descricao', render: (descricao) => truncateText(descricao, 50) },
        { title: 'Data de Criação', dataIndex: 'data_criacao', key: 'data_criacao', render: date => moment(date).format('DD/MM/YYYY') },
        { title: 'Ficheiro Complementar', dataIndex: 'ficheiro_complementar', key: 'ficheiro_complementar', render: (ficheiro) => <a href={`http://localhost:8080/${ficheiro}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>Ver ficheiro</a> },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
    ];

    const truncateText = (text, limit) => {
        if (!text) return '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            loadIdeiasEmEstudo();
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
        }
    }, []);

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const loadIdeiasEmEstudo = async () => {
        try {
            const url = `${baseUrl}/ideias/listEmEstudo`;
            const res = await axios.get(url);
            if (res.data.success) {
                setIdeiasEmEstudo(res.data.ideias);
            } else {
                notification.error({ message: "Erro ao carregar ideias" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const handleSubmitIdeias = async () => {
        if (!ficheiroComplementar) {
            notification.error({ message: 'Selecione um ficheiro!' });
            return;
        }

        const formData = new FormData();
        formData.append('titulo_ideia', titulo);
        formData.append('descricao', descricao);
        formData.append('ficheiroComplementar', ficheiroComplementar);
        formData.append('id_user', user.id);

        try {
            const response = await axios.post(`${baseUrl}/ideias/create`, formData);
            if (response.data.success) {
                notification.success({ message: "Ideia submetida com sucesso!" });
                loadIdeiasEmEstudo();
                setTitulo("");
                setDescricao("");
                setFicheiroComplementar(null);
                hide();
            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar adicionar ideia!" });
        }
    };

    const aprovarIdeia = async () => {
        try {
            setLoading(true);
            const res = await axios.put(`${baseUrl}/ideias/aprovar/${selectedIdeia.id_ideia}`, {
                validador: currentUser.nome_utilizador,
                data_conclusao: dataConclusao,
                data_inicio: dataInicio,
            })

            if (res.data.success) {
                notification.success({ message: "Ideia aprovada com sucesso!" });
                loadIdeiasEmEstudo();
                setIsModalIdeiaIndividual(false);
                setIsModalAprovarIdeia(false);
            } else {
                notification.error({ message: "Erro ao aprovar ideia" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }

    const rejeitarIdeia = async () => {
        setLoading(true);
        try {
            const url = `${baseUrl}/ideias/rejeitar/${selectedIdeia.id_ideia}`;
            const res = await axios.put(url, {
                validador: currentUser.nome_utilizador,
                comentarios: comentarios,
            });

            if (res.data.success) {
                notification.success({ message: "Ideia rejeitada com sucesso!" });
                loadIdeiasEmEstudo();
                setIsModalIdeiaIndividual(false);
                setIsRejeitadaIdeiaModalOpen(false);
            } else {
                notification.error({ message: "Erro ao rejeitar ideia" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
        finally {
            setLoading(false);
        }

    }

    const handleEditarIdeia = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo_ideia', selectedIdeia.titulo_ideia);
            formData.append('descricao', selectedIdeia.descricao);
            if (selectedIdeia.ficheiro_complementar) {
                formData.append('ficheiro_complementar', selectedIdeia.ficheiro_complementar);
            }

            const res = await axios.put(`${baseUrl}/ideias/update/${selectedIdeia.id_ideia}`,
                formData
            );

            if (res.data.success) {
                notification.success({ message: "Ideia editada com sucesso!" });

                setIsEditarIdeiaModalOpen(false);
                setIsModalIdeiaIndividual(false);
                loadIdeiasEmEstudo();
            } else {
                notification.error({ message: "Erro ao editar ideia" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    return (
        <div>
            <NavBar />
            <section className='ideias'>
                <h1>Programa de ideias</h1>
                <Popover
                    className='popover-ideias'
                    content={
                        <Form
                            onFinish={handleSubmitIdeias}>
                            <Input
                                className="Input-titulo-ideia"
                                placeholder='Título da ideia'
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                            <Input.TextArea
                                className="Input-descricao-ideia"
                                placeholder='Descreve a tua ideia'
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                            <Input
                                className="Input-ficheiro-complementar"
                                type="file"
                                accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                                onChange={(e) => setFicheiroComplementar(e.target.files[0])}
                            />
                            <Button className="btn-submit-ideia" htmlType="submit" type='primary'>Submeter</Button>
                        </Form>
                    }
                    title="Submete a tua ideia!"
                    trigger="click"
                    open={open}
                    onOpenChange={handleOpenChange}
                >
                    <CiCirclePlus className="icone-plus" />
                </Popover>
            </section>
            <Table
                className='tabela-ideias'
                dataSource={ideiasEmEstudo}
                columns={columns}
                style={{ pointer: 'cursor' }}
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedIdeia(record);
                        setIsModalIdeiaIndividual(true);
                    },
                })}
            />
            <Modal
                className='ideias-modal'
                open={isModalIdeiaIndividual}
                title={selectedIdeia?.titulo_ideia}
                onCancel={() => setIsModalIdeiaIndividual(false)}
                width={700}
                footer={[
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                            {selectedIdeia?.id_user === currentUser.id && (
                                <Button
                                    className='btn-editar-ideia'
                                    onClick={() => setIsEditarIdeiaModalOpen(true)}
                                >
                                    Editar Ideia
                                </Button>
                            )}
                        </div>
                        <div>
                            <Button
                                className='btn-cancel'
                                onClick={() => setIsModalIdeiaIndividual(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className='btn-submit-rejeitar'
                                onClick={() => setIsRejeitadaIdeiaModalOpen(true)}
                            >
                                Rejeitar Ideia
                            </Button>
                            <Button
                                className='btn-submit-aprovar'
                                onClick={() => setIsModalAprovarIdeia(true)}
                            >
                                Aprovar Ideia
                            </Button>
                        </div>
                    </div>

                ]}
            >
                <div>
                    <p style={{ fontSize: '14px', color: 'gray' }}>
                        {selectedIdeia?.data_criacao ? moment(selectedIdeia.data_criacao).format('DD/MM/YYYY') : ''}
                    </p>
                    <p><strong>Descrição:</strong></p>
                    <p>{selectedIdeia?.descricao}</p>
                    <p><strong>Ficheiro Complementar:</strong></p>
                    <p>{selectedIdeia?.ficheiro_complementar ? (
                        <a
                            href={`http://localhost:8080/${selectedIdeia.ficheiro_complementar}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver ficheiro
                        </a>
                    ) : (
                        'Nenhum ficheiro disponível'
                    )}</p>
                </div>
            </Modal>
            <Modal
                className='editar-ideia-modal'
                open={isEditarIdeiaModalOpen}
                title="Editar Ideia"
                onCancel={() => setIsEditarIdeiaModalOpen(false)}
                footer={[
                    <>
                        <Button className='btn-cancel' onClick={() => setIsEditarIdeiaModalOpen(false)}>
                            Cancelar
                        </Button>

                        <Button
                            className='btn-editar-ideia'
                            onClick={handleEditarIdeia}
                        >
                            Editar Ideia
                        </Button>
                    </>
                ]}
            >
                <Input
                    style={{ marginBottom: '10px' }}
                    value={selectedIdeia?.titulo_ideia}
                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, titulo_ideia: e.target.value })}
                />
                <Input.TextArea
                    style={{ marginBottom: '10px' }}
                    value={selectedIdeia?.descricao}
                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, descricao: e.target.value })}
                />
                <Input
                    style={{ marginBottom: '10px' }}
                    type="file"
                    accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, ficheiro_complementar: e.target.files[0] })}
                />
            </Modal>
            <Modal
                className='rejeitar-ideia-modal'
                open={isRejeitadaIdeiaModalOpen}
                title="Rejeitar Ideia"
                onCancel={() => setIsRejeitadaIdeiaModalOpen(false)}
                footer={[
                    <Button className='btn-cancel' onClick={() => setIsRejeitadaIdeiaModalOpen(false)}>
                        Cancelar
                    </Button>,
                    <Button
                        className='btn-submit-rejeitar'
                        onClick={rejeitarIdeia}
                    >
                        Rejeitar Ideia
                    </Button>,
                ]}
            >
                <Input.TextArea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Comentários"
                />
            </Modal>
            <Modal
                className='modal-ideia-aprovada'
                open={isModalAprovarIdeia}
                title="Ideia"
                onCancel={() => setIsModalAprovarIdeia(false)}
                footer={[
                    <>
                        <Button className='btn-cancel' onClick={() => setIsModalAprovarIdeia(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className='btn-submit-aprovar'
                            onClick={aprovarIdeia}
                        >
                            Aprovar Ideia
                        </Button></>
                ]}
            >
                <DatePicker
                    style={{ width: '100%', marginBottom: '10px' }}
                    className='data-inicio'
                    placeholder="Data de Início"
                    onChange={(date) => setDataInicio(date)}
                />
                <DatePicker
                    style={{ width: '100%', marginBottom: '10px' }}
                    className='data-conclusao'
                    placeholder="Data de Conclusão Prevista"
                    onChange={(date) => setDataConclusao(date)}
                />
            </Modal>
        </div>
    );
}
