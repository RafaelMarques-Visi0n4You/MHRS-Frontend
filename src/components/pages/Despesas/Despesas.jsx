import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, notification, Table, Select, Modal, DatePicker } from 'antd';
import NavBar from '../../layout/NavBar';
import './PaginasDespesas.css';
import AuthService from '../../auth.service';
import moment from 'moment';
import { RiMoneyEuroCircleLine } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";

const { Option } = Select;
const baseUrl = "http://localhost:8080";

export default function Despesas() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [minhasDespesas, setMinhasDespesas] = useState([]);
    const [todasDespesas, setTodasDespesas] = useState([]);
    const [despesa, setDespesa] = useState("");
    const [valor, setValor] = useState("");
    const [dataDespesa, setDataDespesa] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [options, setOptions] = useState([]);
    const [optionsUsers, setOptionsUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [user, setUser] = useState({});
    const [selectedDespesa, setSelectedDespesa] = useState(null);
    const [isModalDespesaIndividual, setIsModalDespesaIndividual] = useState(false);
    const currentUser = AuthService.getCurrentUser();
    const [comentarios, setComentarios] = useState("");
    const [isModalRejeitarDespesa, setIsModalRejeitarDespesa] = useState(false);
    const [isModalReembolso, setIsModalReembolso] = useState(false);
    const [isModalEditarDespesa, setIsModalEditarDespesa] = useState(false);
    const columns = tipo_user === "administrador" ? [
        {
            title: 'Autor',
            dataIndex: 'autor',
            key: 'autor'
        },
        {
            title: 'Destinatário',
            dataIndex: 'destinatario',
            key: 'destinatario',
            render: (destinatario) => destinatario === currentUser.nome_utilizador ? 'Próprio' : destinatario
        },
        {
            title: 'Data da despesa',
            dataIndex: 'data',
            key: 'data',
            render: (data) => moment(data).format('DD-MM-YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data) - moment(b.data),
        },
        {
            title: 'Valor',
            dataIndex: 'valor',
            key: 'valor'
        },
        {
            title: 'Projeto Associado',
            dataIndex: 'projeto',
            key: 'projeto'
        },
        {
            title: "Estado",
            dataIndex: 'estado',
            key: 'estado',
            filters: [
                { text: 'Aprovado', value: 'Aprovado' },
                { text: 'Rejeitado', value: 'Rejeitado' },
                { text: 'Pendente', value: 'Pendente' },
            ],
            onFilter: (value, record) => {
                return record.estado.trim() === value;
            }
            ,
            sorter: (a, b) => a.estado.localeCompare(b.estado),
        },
        {
            title: 'Data do reembolso',
            dataIndex: 'data_reembolso',
            key: 'data_reembolso',
            render: (data) => data ? moment(data).format('DD-MM-YYYY') : 'Não disponível',
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data_reembolso) - moment(b.data_reembolso),
        },
        {
            title: '', key: 'acoes', render: (record) => (
                <FaSearch style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setSelectedDespesa(record);
                        setIsModalDespesaIndividual(true);
                    }}
                />
            )
        },
    ] : [
        {
            title: 'Data da despesa',
            dataIndex: 'data',
            key: 'data',
            render: (data) => moment(data).format('DD-MM-YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data) - moment(b.data),
        },
        {
            title: 'Valor',
            dataIndex: 'valor',
            key: 'valor'
        },
        {
            title: 'Projeto Associado',
            dataIndex: 'projeto',
            key: 'projeto'
        },
        {
            title: "Estado",
            dataIndex: 'estado',
            key: 'estado',
            filters: [
                { text: 'Aprovado', value: 'Aprovado' },
                { text: 'Rejeitado', value: 'Rejeitado' },
                { text: 'Pendente', value: 'Pendente' },
            ],
            onFilter: (value, record) => {
                return record.estado.trim() === value;
            }
            ,
            sorter: (a, b) => a.estado.localeCompare(b.estado),
        },
        {
            title: 'Data do reembolso',
            dataIndex: 'data_reembolso',
            key: 'data_reembolso',
            render: (data) => data ? moment(data).format('DD-MM-YYYY') : 'Não disponível',
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data_reembolso) - moment(b.data_reembolso),
        },
        {
            title: '', key: 'acoes', render: (record) => (
                <FaSearch style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setSelectedDespesa(record);
                        setIsModalDespesaIndividual(true);
                    }}
                />
            )
        },
    ];
    useEffect(() => {
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            if (tipo_user === 'administrador') {
                loadDespesasTodas();
                loadAllProjetos();
                loadUsers();
            } else if (tipo_user === 'colaborador') {
                loadMinhasDespesas(currentUser.id);
                loadMeusProjetos();
            }

        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }

    }, [selectedDespesa]);

    const loadUsers = async () => {
        try {
            const res = await axios.get(`${baseUrl}/user/list`);
            if (res.data.success) {
                const users = res.data.data || [];
                const formattedUsers = users.map(user => ({
                    value: user.id_user,
                    label: user.nome_utilizador === currentUser.nome_utilizador ? 'Próprio' : user.nome_utilizador
                }));
                if (currentUser.nome_utilizador === formattedUsers.label) {
                    formattedUsers.label = 'Próprio'
                }
                setOptionsUsers(formattedUsers);

            } else {
                notification.error({ message: "Erro ao carregar utilizadores" });
            }
        } catch (error) {
            if (error.response) {
                notification.error({ message: `Erro: ${error.response.data.message || error.message}` });
            } else if (error.request) {
                notification.error({ message: "Erro: Sem resposta do servidor. Verifique a sua conexão com a internet." });
            } else {
                notification.error({ message: `Erro: ${error.message}` });
            }
        }
    }

    //Carregar Projetos
    const loadAllProjetos = async () => {
        try {
            const res = await axios.get(`${baseUrl}/projeto/listAll`);
            if (res.data.success) {
                const projetos = res.data.projetos || [];
                const formattedOptions = projetos.map(proj => ({
                    value: proj.id_projeto,
                    label: proj.titulo_projeto
                }));
                setOptions(formattedOptions);
            } else {
                notification.error({ message: "Erro ao carregar projetos" });
            }
        } catch (error) {
            if (error.response) {
                notification.error({ message: `Erro: ${error.response.data.message || error.message}` });
            } else if (error.request) {
                notification.error({ message: "Erro: Sem resposta do servidor. Verifique a sua conexão com a internet." });
            } else {
                notification.error({ message: `Erro: ${error.message}` });
            }
        }
    };

    const loadMeusProjetos = async () => {
        try {
            const res = await axios.get(`${baseUrl}/projeto/listProjetosAtuais/${currentUser.id}`);
            if (res.data.success) {
                const projetos = res.data.projetos || [];
                const formattedOptions = projetos.map(proj => ({
                    value: proj.id_projeto,
                    label: proj.titulo_projeto
                }));
                setOptions(formattedOptions);
            } else {
                notification.error({ message: "Erro ao carregar projetos" });
            }
        } catch (error) {
            if (error.response) {
                notification.error({ message: `Erro: ${error.response.data.message || error.message}` });
            } else if (error.request) {
                notification.error({ message: "Erro: Sem resposta do servidor. Verifique sua conexão com a internet." });
            } else {
                notification.error({ message: `Erro: ${error.message}` });
            }
        }
    }


    //EDITAR DESPESA
    const handleEditarDespesa = async () => {
        try {

            const res = await axios.put(`${baseUrl}/despesas/update/${selectedDespesa.id_despesa}`, {
                descricao: selectedDespesa.descricao,
                valor: selectedDespesa.valor,
                data: selectedDespesa.data,
                id_projeto: selectedDespesa.id_projeto,

            });
            if (res.data.success) {


                setIsModalEditarDespesa(false);
                setIsModalDespesaIndividual(false);
                loadMinhasDespesas();
                notification.success({ message: "Despesa editada com sucesso!" });
            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //APROVAR E REJEITAR DESPESA
    const handleAprovarDespesa = async () => {
        try {
            const res = await axios.put(`${baseUrl}/despesas/update/aprovar/${selectedDespesa.id_despesa}`,
                { validador: currentUser.nome_utilizador }

            );
            if (res.data.success) {
                notification.success({ message: "Despesa aprovada com sucesso!" });
                loadDespesasTodas();
                setIsModalDespesaIndividual(false);
            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const handleRejeitarDespesa = async () => {
        try {
            const res = await axios.put(`${baseUrl}/despesas/update/rejeitar/${selectedDespesa.id_despesa}`,
                {
                    validador: currentUser.nome_utilizador,
                    comentarios: comentarios,
                }
            );
            if (res.data.success) {
                notification.success({ message: "Despesa rejeitada com sucesso!" });
                loadDespesasTodas();
                setIsModalDespesaIndividual(false);
                setIsModalRejeitarDespesa(false);

            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    //LISTAR DESPESAS 
    const loadDespesasTodas = async () => {
        try {
            const res = await axios.get(`${baseUrl}/despesas/list`);
            if (res.data.success) {
                setTodasDespesas(res.data.todosRembolsosDespesas);
            } else {
                notification.error({ message: "Erro ao carregar despesas" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const loadMinhasDespesas = async () => {
        try {
            const res = await axios.get(`${baseUrl}/despesas/list/${currentUser.id}`);
            if (res.data.success) {
                setMinhasDespesas(res.data.despesasComReembolsosUser);
            } else {
                notification.error({ message: "Erro ao carregar despesas" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //Adicionar Despesa
    const handleSubmitDespesa = async () => {
        if (!despesa || !valor || !dataDespesa) {
            notification.error({ message: "Todos os campos são obrigatórios" });
            return;
        }

        if (selectedOption === null) {
            setSelectedOption(null);
        }

        try {
            const res = await axios.post(`${baseUrl}/despesas/create`, {
                descricao: despesa,
                valor: valor,
                data: dataDespesa,
                id_user: currentUser.id,
                id_projeto: selectedOption,
                destinatario: currentUser.id
            });
            if (res.data.success) {
                notification.success({ message: "Despesa adicionada com sucesso!" });
                loadMinhasDespesas();
                setIsModalReembolso(false)
                setDataDespesa("");
                setDespesa("");
                setValor("");
                setSelectedOption("");

            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const handleSubmitReembolsos = async () => {
        if (!despesa || !valor || !dataDespesa) {
            notification.error({ message: "Todos os campos são obrigatórios" });
            return;
        }
        if (selectedOption === null) {
            setSelectedOption(null);
        }
        try {
            const res = await axios.post(`${baseUrl}/reembolsos/create`,
                {
                    descricao: despesa,
                    valor: valor,
                    data_despesa: dataDespesa,
                    id_user: currentUser.id,
                    id_projeto: selectedOption,
                    destinatario: selectedUser
                });
            if (res.data.success) {
                notification.success({ message: "Despesa adicionada com sucesso!" });

                setDataDespesa("");
                setDespesa("");
                setValor("");
                setSelectedOption("");
                setSelectedUser("");
                loadDespesasTodas();
                setIsModalReembolso(false);

            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    };

    const handleDeleteDespesa = async () => {
        try {
            const res = await axios.put(`${baseUrl}/despesas/delete/${selectedDespesa.id_despesa}`);
            if (res.data.success) {
                notification.success({ message: "Despesa eliminada com sucesso!" });
                loadMinhasDespesas();
                setIsModalDespesaIndividual(false);
            } else {
                notification.error({ message: res.data.message });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    switch (tipo_user) {
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className="despesas">
                        <h1 className='titulo-projetos-atribuidos'>Despesas</h1>
                        <Button className='btn-reembolso'
                            onClick={() => setIsModalReembolso(true)}
                        ><RiMoneyEuroCircleLine />Pedir Reembolso</Button>
                        <Modal
                            className='modal-despesa'
                            open={isModalReembolso}
                            title="Pede o teu reembolso!"
                            onCancel={() => setIsModalReembolso(false)}
                            width={1000}
                            footer={[
                                <Button className='btn-cancel' onClick={() => setIsModalReembolso(false)}>
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-editar'
                                    onClick={handleSubmitReembolsos}
                                >
                                    Pedir Reembolso
                                </Button>,


                            ]}
                        >
                            <p><strong>Despesa:</strong></p>
                            <Input
                                className="Input-despesa"
                                placeholder='Despesa'
                                value={despesa}
                                onChange={(e) => setDespesa(e.target.value)}
                            />
                            <p><strong>Valor:</strong></p>
                            <Input
                                className="Input-valor"
                                type="number"
                                placeholder='Valor'
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <p><strong>Data:</strong></p>
                            <DatePicker
                                className="Input-data-despesa"
                                value={dataDespesa}
                                onChange={(date) => setDataDespesa(date)}
                                style={{ width: '100%' }}
                            />
                            <p><strong>Selecione o projeto:</strong></p>
                            <Select
                                className="Input-projeto"
                                value={selectedOption}
                                onChange={(value) => setSelectedOption(value)}
                                placeholder="Selecione uma opção"
                                style={{ width: '100%' }}
                            >
                                <Option value={null}>Sem projeto Associado</Option>
                                {options.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                            <p><strong>Selecione o colaborador:</strong></p>
                            <Select
                                className="Input-projeto"
                                value={selectedUser}
                                onChange={(value) => setSelectedUser(value)}
                                placeholder="Selecione um user"
                                style={{ width: '100%' }}
                            >
                                {optionsUsers.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Modal>
                    </section>
                    <Table
                        className='tabela-ideias'
                        dataSource={todasDespesas}
                        columns={columns}
                    />
                    <Modal
                        title="Despesa"
                        visible={isModalDespesaIndividual}
                        className='modal-despesa'
                        width={700}
                        onCancel={() => setIsModalDespesaIndividual(false)}
                        footer={[
                            selectedDespesa?.estado?.trim() === 'Pendente' ? (
                                <>

                                    <Button className='btn-cancel' onClick={() => setIsModalDespesaIndividual(false)}>
                                        Cancelar
                                    </Button>
                                    <Button className='btn-rejeitar' onClick={() => setIsModalRejeitarDespesa(true)}>
                                        Rejeitar Despesa
                                    </Button>

                                    <Button className='btn-aprovar' onClick={handleAprovarDespesa}>
                                        Aprovar Despesa
                                    </Button>

                                    <Modal
                                        title="Rejeitar Despesa"
                                        className='modal-rejeitar'
                                        visible={isModalRejeitarDespesa}
                                        onCancel={() => setIsModalRejeitarDespesa(false)}
                                        footer={[
                                            <Button className='btn-cancel' onClick={() => setIsModalRejeitarDespesa(false)}>
                                                Cancelar
                                            </Button>,
                                            <Button className='btn-rejeitar' onClick={handleRejeitarDespesa}>
                                                Rejeitar Despesa
                                            </Button>
                                        ]}
                                    >
                                        <Input.TextArea
                                            className="Input-comentarios"
                                            placeholder='Comentários'
                                            value={comentarios}
                                            onChange={(e) => setComentarios(e.target.value)}
                                        />
                                    </Modal>

                                </>

                            ) : (
                                selectedDespesa?.estado?.trim() === 'Aprovado' || selectedDespesa?.estado?.trim() === 'Rejeitado' ? (
                                    <Button className='btn-ok' onClick={() => setIsModalDespesaIndividual(false)}>
                                        OK
                                    </Button>
                                ) : null)]}
                    >
                        <p style={{ fontSize: '14px', color: 'gray' }}>
                            {selectedDespesa?.data
                                ? moment(selectedDespesa.data).format('DD-MM-YYYY')
                                : selectedDespesa?.data_despesa
                                    ? moment(selectedDespesa.data_despesa).format('DD-MM-YYYY')
                                    : 'Não disponível'} </p>
                        <p><strong>Descrição: </strong></p>
                        <p>{selectedDespesa?.descricao}</p>
                        <p><strong>Valor: </strong></p>
                        <p>{selectedDespesa?.valor}</p>
                        <p><strong>Projeto Associado: </strong></p>
                        <p>{selectedDespesa?.projeto}</p>

                        {selectedDespesa?.estado?.trim() === 'Rejeitado' && (
                            <>
                                <p><strong>Comentários: </strong></p>
                                <p>{selectedDespesa?.comentarios}</p>
                            </>
                        )}

                        {selectedDespesa?.estado?.trim() === 'Aprovado' && (
                            <>
                                <p><strong>Data do rembolso:</strong></p>
                                <p >
                                    {selectedDespesa?.data_reembolso
                                        ? moment(selectedDespesa?.data_reembolso).format('DD-MM-YYYY')

                                        : 'Não disponível'}</p>                            </>
                        )}
                    </Modal>

                </div>
            );
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className="despesas">
                        <h1>Despesas</h1>
                        <Button className='btn-reembolso'
                            onClick={() => setIsModalReembolso(true)}
                            style={{ gap: '10px' }}><RiMoneyEuroCircleLine />Pedir Reembolso</Button>
                        <Modal
                            className='modal-despesa'
                            open={isModalReembolso}
                            title="Pede o teu reembolso!"
                            onCancel={() => setIsModalReembolso(false)}
                            width={1000}
                            footer={[
                                <Button className='btn-cancel' onClick={() => setIsModalReembolso(false)}>
                                    Cancelar
                                </Button>,
                                <Button
                                    className='btn-editar'
                                    onClick={handleSubmitDespesa}
                                >
                                    Pedir Reembolso
                                </Button>,
                            ]}
                        >
                            <p><strong>Despesa:</strong></p>
                            <Input
                                className="Input-despesa"
                                placeholder='Despesa'
                                value={despesa}
                                onChange={(e) => setDespesa(e.target.value)}
                            />
                            <p><strong>Valor:</strong></p>
                            <Input
                                className="Input-valor"
                                type="number"
                                placeholder='Valor'
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <p><strong>Data:</strong></p>
                            <DatePicker
                                className="Input-data-despesa"
                                value={dataDespesa}
                                onChange={(date) => setDataDespesa(date)}
                                style={{ width: '100%' }}
                            />
                            <p><strong>Selecione o projeto:</strong></p>
                            <Select
                                className="Input-projeto"
                                value={selectedOption}
                                onChange={(value) => setSelectedOption(value)}
                                placeholder="Selecione uma opção"
                                style={{ width: '100%' }}
                            >
                                <Option value={null}>Sem projeto Associado</Option>
                                {options.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Modal>
                    </section>
                    <Table
                        className='tabela-ideias'
                        dataSource={minhasDespesas}
                        columns={columns}
                    />
                    <Modal
                        title="Despesa"
                        className='modal-despesa'
                        open={isModalDespesaIndividual}
                        width={700}
                        onCancel={() => setIsModalDespesaIndividual(false)}
                        footer={[
                            selectedDespesa?.estado?.trim() === 'Pendente' ? (
                                <>
                                    {selectedDespesa?.id_user === currentUser?.id && (
                                        <>
                                            <Button className='btn-eliminar' onClick={handleDeleteDespesa}>
                                                Eliminar
                                            </Button>
                                            <Button className='btn-editar' onClick={() => setIsModalEditarDespesa(true)}>
                                                Editar
                                            </Button>
                                            <Modal
                                                title="Editar Despesa"
                                                className='modal-editar'
                                                open={isModalEditarDespesa}
                                                onCancel={() => setIsModalEditarDespesa(false)}
                                                footer={[
                                                    <Button className='btn-cancel' onClick={() => setIsModalEditarDespesa(false)}>
                                                        Cancelar
                                                    </Button>,
                                                    <Button className='btn-editar' onClick={handleEditarDespesa}>
                                                        Editar Despesa
                                                    </Button>
                                                ]}
                                            >
                                                <Input
                                                    className="Input-despesa"
                                                    placeholder='Despesa'
                                                    value={selectedDespesa?.descricao}
                                                    onChange={(e) => {
                                                        setSelectedDespesa({ ...selectedDespesa, descricao: e.target.value });
                                                    }}
                                                />
                                                <Input
                                                    className="Input-valor"
                                                    type="number"
                                                    placeholder='Valor'
                                                    value={selectedDespesa?.valor}
                                                    onChange={(e) => {
                                                        setSelectedDespesa({ ...selectedDespesa, valor: e.target.value });
                                                    }}
                                                />
                                                <DatePicker
                                                    className="Input-data-despesa"
                                                    value={selectedDespesa?.data ? moment(selectedDespesa.data) : null}
                                                    onChange={(date) => {
                                                        setSelectedDespesa({ ...selectedDespesa, data: date ? date.format('YYYY-MM-DD') : null });
                                                    }}
                                                    style={{ width: '100%' }}
                                                />

                                                <Select
                                                    className="Input-projeto"
                                                    value={selectedDespesa?.id_projeto}
                                                    onChange={(value) => {
                                                        setSelectedDespesa({ ...selectedDespesa, id_projeto: value });
                                                    }}
                                                    placeholder="Selecione uma opção"
                                                    style={{ width: '100%' }}
                                                >
                                                    <Option value={null}>Sem projeto Associado</Option>
                                                    {options.map((option) => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Modal>
                                        </>
                                    )}
                                </>

                            ) : (
                                selectedDespesa?.estado?.trim() === 'Aprovado' || selectedDespesa?.estado?.trim() === 'Rejeitado' ? (
                                    <Button className='btn-ok' onClick={() => setIsModalDespesaIndividual(false)}>
                                        OK
                                    </Button>
                                ) : null)]}
                    >
                        <p style={{ fontSize: '14px', color: 'gray' }}>
                            {selectedDespesa?.data
                                ? moment(selectedDespesa?.data).format('DD-MM-YYYY')
                                : selectedDespesa?.data_despesa
                                    ? moment(selectedDespesa?.data_despesa).format('DD-MM-YYYY')
                                    : 'Não disponível'}</p>
                        <p><strong>Descrição: </strong></p>
                        <p>{selectedDespesa?.descricao}</p>
                        <p><strong>Valor: </strong></p>
                        <p>{selectedDespesa?.valor}</p>
                        <p><strong>Projeto Associado: </strong></p>
                        <p>{selectedDespesa?.projeto}</p>

                        {selectedDespesa?.estado?.trim() === 'Rejeitado' && (
                            <>
                                <p><strong>Comentários: </strong></p>
                                <p>{selectedDespesa?.comentarios}</p>
                            </>
                        )}
                        {selectedDespesa?.estado?.trim() === 'Aprovado' && (
                            <>
                                <p><strong>Data do rembolso:</strong></p>
                                <p >
                                    {selectedDespesa?.data_reembolso
                                        ? moment(selectedDespesa?.data_reembolso).format('DD-MM-YYYY')

                                        : 'Não disponível'}</p>
                            </>
                        )}
                    </Modal>

                </div>
            );
    }
}