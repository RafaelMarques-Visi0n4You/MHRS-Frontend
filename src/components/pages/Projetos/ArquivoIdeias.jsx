import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { notification, Table, Form, Popover, Input, Button, Modal, FloatButton } from 'antd';
import NavBar from '../../layout/NavBar';
import moment from 'moment';
import './PaginasProjetos.css';
import AuthService from '../../auth.service';
import { CiCirclePlus } from "react-icons/ci";

import { useNavigate, useParams } from 'react-router-dom';

const baseUrl = "http://localhost:8080";
export default function ArquivoIdeias() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [user, setUser] = useState({});
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [ficheiroComplementar, setFicheiroComplementar] = useState(null);
    const [selectedIdeia, setSelectedIdeia] = useState({});
    const [isModalIdeiaIndividual, setIsModalIdeiaIndividual] = useState(false);
    const [isRejeitadaIdeiaModalOpen, setIsRejeitadaIdeiaModalOpen] = useState(false);
    const [todasIdeias, setTodasIdeias] = useState([]);
    const [minhasIdeias, setMinhasIdeias] = useState([]);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const [filtroAtivo, setFiltroAtivo] = useState('total');
    const [ideiasFiltradas, setIdeiasFiltradas] = useState([]);
    const [numeroIdeiasTotal, setNumeroIdeiasTotal] = useState(0);
    const [numeroIdeiasRejeitadas, setNumeroIdeiasRejeitadas] = useState(0);
    const [numeroIdeiasAprovadas, setNumeroIdeiasAprovadas] = useState(0);
    const [isReformularIdeiaModalOpen, setIsReformularIdeiaModalOpen] = useState(false);
    const [isEditarIdeiaModalOpen, setIsEditarIdeiaModalOpen] = useState(false);


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
            loadTodasIdeias();
            loadIdeiasUser(currentUser.id);
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
        }
    }, []);


    useEffect(() => {
        const ideias = tipo_user === 'administrador' ? todasIdeias : minhasIdeias;
        if (tipo_user === 'administrador') {
            if (todasIdeias.length > 0) {
                setNumeroIdeiasTotal(todasIdeias.length);
                setNumeroIdeiasRejeitadas(todasIdeias.filter((ideia) => ideia.estado.trim() === 'Rejeitada').length);
                setNumeroIdeiasAprovadas(todasIdeias.filter((ideia) => ideia.estado.trim() === 'Aprovada').length);
            }

        } else {
            if (minhasIdeias.length > 0) {
                setNumeroIdeiasTotal(minhasIdeias.length);
                setNumeroIdeiasRejeitadas(minhasIdeias.filter((ideia) => ideia.estado.trim() === 'Rejeitada').length);
                setNumeroIdeiasAprovadas(minhasIdeias.filter((ideia) => ideia.estado.trim() === 'Aprovada').length);
            }
        }
        let filtradas = ideias;
        switch (filtroAtivo) {
            case 'rejeitadas':
                filtradas = ideias.filter((ideia) => ideia.estado.trim() === 'Rejeitada');
                break;
            case 'aprovadas':
                filtradas = ideias.filter((ideia) => ideia.estado.trim() === 'Aprovada');
                break;
            case 'total':
            default:
                filtradas = ideias;
                break;
        }
        setIdeiasFiltradas(filtradas);
    }, [todasIdeias, minhasIdeias, filtroAtivo, tipo_user]);

    const handleFiltroTotal = () => setFiltroAtivo('total');
    const handleFiltroRejeitadas = () => setFiltroAtivo('rejeitadas');
    const handleFiltroAprovadas = () => setFiltroAtivo('aprovadas');

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const loadIdeiasUser = async () => {
        try {
            const url = `${baseUrl}/ideias/list/${currentUser.id}`;
            const res = await axios.get(url);
            if (res.data.success) {
                setMinhasIdeias(res.data.ideias);
            } else {
                notification.error({ message: "Erro ao carregar ideias" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const loadTodasIdeias = async () => {
        try {
            const url = `${baseUrl}/ideias/listAll`;
            const res = await axios.get(url);
            if (res.data.success) {
                setTodasIdeias(res.data.ideias);
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
                loadTodasIdeias();
                loadIdeiasUser(currentUser.id);
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

    const handleEditarIdeia = async () => {
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
                loadIdeiasUser(currentUser.id);
            } else {
                notification.error({ message: "Erro ao editar ideia" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const handleReformularIdeia = async () => {
        try {
            const formData = new FormData();
            formData.append('titulo_ideia', selectedIdeia.titulo_ideia);
            formData.append('descricao', selectedIdeia.descricao);
            formData.append('id_user', currentUser.id);

            if (selectedIdeia.ficheiro_complementar) {
                formData.append('ficheiro_complementar', selectedIdeia.ficheiro_complementar);
            }

            const res = await axios.put(`${baseUrl}/ideias/reformular/${selectedIdeia.id_ideia}`, formData);
            if (res.data.success) {
                notification.success({ message: "Ideia reformulada com sucesso!" });
                loadTodasIdeias();
                loadIdeiasUser(currentUser.id);
                setIsReformularIdeiaModalOpen(false);
                setIsModalIdeiaIndividual(false);
            } else {
                notification.error({ message: "Erro ao reformular ideia" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    switch (tipo_user) {
        case "administrador":
            return (
                <div>
                    <NavBar />
                    <section className='ideias'>
                        <h1>Arquivo de ideias</h1>
                    </section>
                    <section className='filtro-ideias'>
                        <h6>
                            <a onClick={handleFiltroTotal}
                                style={{
                                    fontWeight: filtroAtivo === 'total' ? 'bold' : 'normal',
                                }}>
                                Todas ({numeroIdeiasTotal})&nbsp;| &nbsp;
                            </a>
                            <a onClick={handleFiltroRejeitadas}
                                style={{
                                    fontWeight: filtroAtivo === 'rejeitadas' ? 'bold' : 'normal',
                                }}>
                                Rejeitadas ({numeroIdeiasRejeitadas})&nbsp;| &nbsp;
                            </a>
                            <a onClick={handleFiltroAprovadas}
                                style={{
                                    fontWeight: filtroAtivo === 'aprovadas' ? 'bold' : 'normal',
                                }}>
                                Aprovadas ({numeroIdeiasAprovadas})
                            </a>
                        </h6>
                    </section>

                    <Table
                        className='tabela-ideias'
                        dataSource={ideiasFiltradas}
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
                        footer={
                            selectedIdeia?.estado?.trim() === 'Rejeitada' ? [
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <Button
                                            className='btn-reformular-ideia'
                                            onClick={() => setIsReformularIdeiaModalOpen(true)}
                                        >
                                            Reformular
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalIdeiaIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            ] : [
                                <Button
                                    className='btn-ok'
                                    onClick={() => setIsModalIdeiaIndividual(false)}
                                >
                                    OK
                                </Button>

                            ]
                        }
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
                        className='modal-reformular-ideia'
                        open={isReformularIdeiaModalOpen}
                        title="Reformular ideia"
                        onCancel={() => setIsReformularIdeiaModalOpen(false)}
                        footer={[
                            <Button
                                key="cancel"
                                onClick={() => setIsReformularIdeiaModalOpen(false)}
                            >
                                Cancelar
                            </Button>,
                            <Button
                                className='btn-reformular-ideia'
                                onClick={handleReformularIdeia}
                            >
                                Reformular
                            </Button>,
                        ]}
                    >
                        <Form onFinish={handleReformularIdeia}>
                            <Input
                                className="Input-titulo-ideia"
                                value={selectedIdeia?.titulo_ideia}
                                onChange={(e) => setSelectedIdeia({ ...selectedIdeia, titulo_ideia: e.target.value })}
                            />
                            <Input.TextArea
                                className="Input-descricao-ideia"
                                placeholder='Descreve a tua ideia'
                                value={selectedIdeia?.descricao}
                                onChange={(e) => setSelectedIdeia({ ...selectedIdeia, descricao: e.target.value })}
                            />
                            <Input
                                className="Input-ficheiro-complementar"
                                type="file"
                                accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                                onChange={(e) => setSelectedIdeia({ ...selectedIdeia, ficheiro_complementar: e.target.files[0] })}
                            />
                        </Form>
                    </Modal>

                    <FloatButton.BackTop />
                </div>
            );

        case "colaborador":
            return (
                <div>
                    <NavBar />
                    <section className='ideias'>
                        <h1>Arquivo de ideias</h1>
                        <Popover
                            className='popover-ideias'
                            content={
                                <Form onFinish={handleSubmitIdeias}>
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
                                    <Button className="btn-Ideia" htmlType="submit">Submeter</Button>
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
                    <section className='filtro-ideias'>
                        <h6>
                            <a onClick={handleFiltroTotal}
                                style={{
                                    fontWeight: filtroAtivo === 'total' ? 'bold' : 'normal',
                                }}>
                                Todas ({numeroIdeiasTotal})&nbsp;| &nbsp;
                            </a>
                            <a onClick={handleFiltroRejeitadas}
                                style={{
                                    fontWeight: filtroAtivo === 'rejeitadas' ? 'bold' : 'normal',
                                }}>
                                Rejeitadas ({numeroIdeiasRejeitadas})&nbsp;| &nbsp;
                            </a>
                            <a onClick={handleFiltroAprovadas}
                                style={{
                                    fontWeight: filtroAtivo === 'aprovadas' ? 'bold' : 'normal',
                                }}>
                                Aprovadas ({numeroIdeiasAprovadas})
                            </a>
                        </h6>
                    </section>
                    <div>
                        <Table
                            className='tabela-ideias'
                            dataSource={ideiasFiltradas}
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
                            footer={
                                selectedIdeia?.estado?.trim() === 'Rejeitada' ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div>
                                            <Button
                                                className='btn-reformular-ideia'
                                                onClick={() => setIsReformularIdeiaModalOpen(true)}
                                            >
                                                Reformular
                                            </Button>
                                        </div>
                                        <div>
                                            <Button
                                                className='btn-ok'
                                                onClick={() => setIsModalIdeiaIndividual(false)}
                                            >
                                                OK
                                            </Button>
                                        </div>
                                    </div>
                                ) : selectedIdeia?.estado?.trim() === 'Em estudo' ? (
                                    <div  style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div>
                                                <Button
                                                    className='btn-editar-ideia'
                                                    onClick={() => setIsEditarIdeiaModalOpen(true)}
                                                >
                                                    Editar Ideia
                                                </Button>
                                            
                                        </div>
                                        <div>
                                            <Button
                                                className='btn-ok'
                                                onClick={() => setIsModalIdeiaIndividual(false)}
                                            >
                                                OK
                                            </Button>
                                        </div>
                                    </div>
                                ) :  selectedIdeia?.estado?.trim() === 'Aprovada' ? (
                                    <Button
                                        className='btn-ok'
                                        onClick={() => setIsModalIdeiaIndividual(false)}
                                    >
                                        OK
                                    </Button>
                                ) : null
                            }
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
                            className='modal-reformular-ideia'
                            open={isReformularIdeiaModalOpen}
                            title="Reformular ideia"
                            onCancel={() => setIsReformularIdeiaModalOpen(false)}
                            footer={[
                                <Button
                                    key="cancel"
                                    onClick={() => setIsReformularIdeiaModalOpen(false)}
                                >
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-reformular-ideia'
                                    onClick={handleReformularIdeia}
                                >
                                    Reformular
                                </Button>,
                            ]}
                        >
                            <Form onFinish={handleReformularIdeia}>
                                <Input
                                    className="Input-titulo-ideia"
                                    value={selectedIdeia?.titulo_ideia}
                                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, titulo_ideia: e.target.value })}
                                />
                                <Input.TextArea
                                    className="Input-descricao-ideia"
                                    placeholder='Descreve a tua ideia'
                                    value={selectedIdeia?.descricao}
                                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, descricao: e.target.value })}
                                />
                                <Input
                                    className="Input-ficheiro-complementar"
                                    type="file"
                                    accept='application/pdf,application/vnd.ms-powerpoint,application/msword'
                                    onChange={(e) => setSelectedIdeia({ ...selectedIdeia, ficheiro_complementar: e.target.files[0] })}
                                />
                            </Form>
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
                    </div>
                    <FloatButton.BackTop />
                </div>
            );

    }
}
