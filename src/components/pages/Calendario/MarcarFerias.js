import './MarcarFerias.css';
import NavBar from "../../layout/NavBar";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, Popover, Button, Input, notification, Table, Form, DatePicker, Badge, Modal, FloatButton } from 'antd';
import { FaRegCalendarPlus } from "react-icons/fa";

import AuthService from '../../auth.service';

const baseUrl = "http://localhost:8080";

export default function DatasFerias() {

    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [feriasUser, setFeriasUser] = useState([]);
    const [feriasTodas, setFeriasTodas] = useState([]);
    const [open, setOpen] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [numeroDiasFeriasDisponiveis, setNumeroDiasFeriasDisponiveis] = useState(0);
    const [isModalSolicitacaoIndividual, setIsModalSolicitacaoIndividual] = useState(false);
    const [isModalRejeitarSolicitacao, setIsModalRejeitarSolicitacao] = useState(false);
    const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
    const [numeroDiasFeriasUsados, setNumeroDiasFeriasUsados] = useState(0);
    const [user, setUser] = useState({});
    const currentUser = AuthService.getCurrentUser();

    const columns = [
        {
            title: 'Data de Início',
            dataIndex: 'data_inicio',
            key: 'data_inicio',
            render: date => moment(date).format('DD/MM/YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data_inicio) - moment(b.data_inicio),
        },
        {
            title: 'Data de Conclusão',
            dataIndex: 'data_conclusao',
            key: 'data_conclusao',
            render: date => moment(date).format('DD/MM/YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data_conclusao) - moment(b.data_conclusao),
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            filters: [
                { text: 'Aprovada', value: 'Aprovada' },
                { text: 'Rejeitada', value: 'Rejeitada' },
                { text: 'Pendente', value: 'Pendente' },
            ],
            onFilter: (value, record) => {
                return record.estado.trim() === value;
            }
            ,
            sorter: (a, b) => a.estado.localeCompare(b.estado),
        },
    ];

    useEffect(() => {
        if (currentUser && currentUser.id) {
            if (tipo_user === 'colaborador') {
                setUser(currentUser);
                LoadDataFerias(currentUser.id);
                fetchNumeroDiasFeriasDisponiveis(currentUser.id);
                fetchNumeroDiasFeriasUsados(currentUser.id);
            } else if (tipo_user === 'administrador') {
                setUser(currentUser);
                LoadFeriasTodas();
                fetchNumeroDiasFeriasDisponiveis(currentUser.id);
                fetchNumeroDiasFeriasUsados(currentUser.id);
            }
        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
        }
    }, []);


    const ferias_aprovadas_user = (value) => {
        const date = moment(value.format('YYYY-MM-DD'), 'YYYY-MM-DD');


        const feriasNoDia = feriasUser.filter(f => {
            const dataInicio = moment(f.data_inicio, 'YYYY-MM-DD');
            const dataConclusao = moment(f.data_conclusao, 'YYYY-MM-DD');
            return date.isBetween(dataInicio, dataConclusao, null, '[]') && f.estado.trim() === 'Aprovada';
        });

        if (feriasNoDia.length > 0) {
            return (
                <div className="calendar-overlay">
                    {feriasNoDia.map((index) => (
                        <Badge key={index} status="success" text="Férias" />
                    ))}
                </div>
            );
        }

        return null;
    };


    const ferias_aprovadas = (value) => {
        const date = moment(value.format('YYYY-MM-DD'));

        const feriasNoDia = feriasTodas.filter(f => {
            const dataInicio = moment(f.data_inicio, 'YYYY-MM-DD');
            const dataConclusao = moment(f.data_conclusao, 'YYYY-MM-DD');
            return date.isBetween(dataInicio, dataConclusao, null, '[]') && f.estado.trim() === 'Aprovada';
        });

        if (feriasNoDia.length > 0) {
            return (
                <div className="calendar-overlay">
                    {feriasNoDia.map((ferias, index) => (
                        <Badge
                            key={index}
                            status="success"
                            text={`Férias ${ferias.autor}`}
                        />
                    ))}
                </div>
            );
        }
        return null;
    };


    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const handleEliminarFerias = async () => {
        try {
            const response = await axios.delete(`${baseUrl}/ferias/delete/${selectedSolicitacao.id_solicitacao}`);
            if (response.data.success) {
                notification.success({ message: "Solicitação eliminada com sucesso!" });
                LoadDataFerias(currentUser.id);
                LoadFeriasTodas();
                setIsModalSolicitacaoIndividual(false);
            } else {
                notification.error({ message: response.data.message || "Erro ao tentar eliminar solicitação de férias." });
            }
        } catch (error) {
            console.error("Erro ao tentar eliminar solicitação de férias:", error);
            notification.error({ message: "Erro ao tentar eliminar solicitação de férias. Por favor, tente novamente mais tarde." });
        }
    };


    const handleMarcarFerias = async () => {

        if (!dataInicio || !dataFim) {
            console.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const estado = currentUser?.tipo_user?.trim() === 'administrador' ? 'Aprovada' : 'Pendente';

        try {
            const response = await axios.post(`${baseUrl}/ferias/create`,
                {
                    id_user: currentUser.id,
                    data_inicio: dataInicio,
                    data_conclusao: dataFim,
                    estado: estado
                });
            if (response.data.success) {
                notification.success({ message: "Solicitação de férias enviada com sucesso!" });
                LoadDataFerias(currentUser.id);
                LoadFeriasTodas();
                hide();
                setDataInicio('');
                setDataFim('');
            } else {
                notification.error({ message: response.data.message || "Erro ao tentar adicionar solicitação de férias." });
            }
        } catch (error) {
            console.error("Erro ao tentar adicionar solicitação de férias:", error);
            notification.error({ message: "Erro ao tentar adicionar solicitação de férias. Por favor, tente novamente mais tarde." });
        }
    };

    //LISTAR FÉRIAS
    const LoadDataFerias = async () => {
        try {
            const res = await axios.get(`${baseUrl}/ferias/list/${currentUser.id}`);
            if (res.data.success) {
                setFeriasUser(res.data.feriasComUsers);
            } else {
                notification.error({ message: "Erro ao carregar solicitações de férias" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const LoadFeriasTodas = async () => {
        try {
            const res = await axios.get(`${baseUrl}/ferias/list`);
            if (res.data.success) {
                setFeriasTodas(res.data.feriasComUsers);
            } else {
                notification.error({ message: "Erro ao carregar solicitações de férias" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //DIAS DE FÉRIAS DISPONÍVEIS

    const fetchNumeroDiasFeriasDisponiveis = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/calendario/diasFeriasRestantes/${currentUser.id}`);
            if (res.data.success) {
                setNumeroDiasFeriasDisponiveis(res.data.dias_ferias_restantes);
            } else {
                notification.error({ message: "Erro ao carregar dados das solicitações" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //DIAS DE FÉRIAS USADOS
    const fetchNumeroDiasFeriasUsados = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/calendario/diasFeriasUsados/${currentUser.id}`);
            if (res.data.success) {
                setNumeroDiasFeriasUsados(res.data.feriasUtilizadas);
            } else {
                notification.error({ message: "Erro ao carregar dados das solicitações" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //APROVAR E REJEITAR FÉRIAS
    const rejeitarSolicitacao = async () => {
        try {
            const res = await axios.put(`${baseUrl}/ferias/rejeitar/${selectedSolicitacao.id_solicitacao}`, {
                validador: currentUser.nome_utilizador,
                comentarios: comentarios
            });
            if (res.data.success) {
                notification.success({ message: "Solicitação rejeitada com sucesso!" });
                LoadFeriasTodas();
                setIsModalSolicitacaoIndividual(false);
                setIsModalRejeitarSolicitacao(false);

            } else {
                notification.error({ message: "Erro ao rejeitar solicitação" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const aprovarSolicitacao = async () => {
        try {
            const res = await axios.put(`${baseUrl}/ferias/aprovar/${selectedSolicitacao.id_solicitacao}`,
                {
                    validador: currentUser.nome_utilizador
                });
            if (res.data.success) {
                LoadFeriasTodas();
                setIsModalSolicitacaoIndividual(false);

                notification.success({ message: "Solicitação aprovada com sucesso!" });

            } else {
                notification.error({ message: "Erro ao rejeitar solicitação" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    switch (tipo_user) {
        case 'colaborador':
            return (
                <div>
                    <NavBar />
                    <section className="container-ferias">
                        <h1 className="titulo-Ferias">Férias</h1>

                        <Table className='tabela-ferias' dataSource={feriasUser} columns={columns} onRow={(record) => ({
                            onClick: () => {
                                setSelectedSolicitacao(record);
                                setIsModalSolicitacaoIndividual(true);
                            }
                        })} />

                        <Modal
                            className='solicitacao-modal'
                            open={isModalSolicitacaoIndividual}
                            title="Detalhes da Solicitação"
                            onCancel={() => setIsModalSolicitacaoIndividual(false)}
                            width={700}
                            footer={
                                selectedSolicitacao?.estado.trim() === 'Pendente' ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}> <>

                                        <Button
                                            className='btn-eliminar'
                                            onClick={handleEliminarFerias}
                                        >
                                            Eliminar
                                        </Button>
                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalSolicitacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>

                                    </></div>
                                ) : selectedSolicitacao?.estado.trim() === 'Aprovada' ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}> <>
                                        <Button
                                            className='btn-eliminar'
                                            onClick={handleEliminarFerias}
                                        >
                                            Eliminar
                                        </Button>
                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalSolicitacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalSolicitacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </>
                                )
                            }
                        >
                            <p><strong>Data de Início: </strong></p>
                            <p>{moment(selectedSolicitacao?.data_inicio).format('DD/MM/YYYY')}</p>
                            <p><strong>Data de Conclusão: </strong></p>
                            <p>{moment(selectedSolicitacao?.data_conclusao).format('DD/MM/YYYY')}</p>

                            {selectedSolicitacao?.estado.trim() === 'Rejeitada' && (
                                <>
                                    <p><strong>Comentários: </strong></p>
                                    <p>{selectedSolicitacao?.comentarios}</p>
                                </>
                            )}


                        </Modal>

                        <div className="dias-ferias-disponiveis">
                            <h2><strong>Dias de Férias Disponíveis:</strong></h2>
                            <h1>{numeroDiasFeriasDisponiveis}</h1>
                        </div>
                        <div className="dias-ferias-usados">
                            <h2><strong>Dias de Férias Usados:</strong></h2>
                            <h1>{numeroDiasFeriasUsados}</h1>
                        </div>
                        <div className='calendario'>
                            <Calendar fullscreen={false} cellRender={ferias_aprovadas_user} />
                            <Popover
                                className='popover-ferias'
                                content={
                                    <Form onFinish={handleMarcarFerias}>
                                        <p><strong>Data de Início:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataInicio} onChange={(data) => setDataInicio(data)} />
                                        </p>
                                        <p><strong>Data de Fim:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataFim} onChange={(data) => setDataFim(data)} />
                                        </p>
                                        <Button className="btn-ferias" htmlType="submit"> Submeter </Button>
                                    </Form>
                                }
                                title="Marca as tuas férias!"
                                trigger="click"
                                open={open}
                                onOpenChange={handleOpenChange}
                            >
                                <FaRegCalendarPlus style={{ fontSize: '25px', margin: '15px' }} />

                            </Popover>
                        </div>
                    </section>
                </div>
            );
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className="container-ferias">
                        <h1 className="titulo-Ferias">Férias</h1>

                        <Table className='tabela-ferias' dataSource={feriasTodas} columns={columns} onRow={(record) => ({
                            onClick: () => {
                                setSelectedSolicitacao(record);
                                setIsModalSolicitacaoIndividual(true);
                            },
                        })} />
                        <Modal
                            className='solicitacao-modal'
                            open={isModalSolicitacaoIndividual}
                            title="Detalhes da Solicitação"
                            onCancel={() => setIsModalSolicitacaoIndividual(false)}
                            width={700}
                            footer={
                                selectedSolicitacao?.estado?.trim() === 'Pendente' ? (<>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div>
                                            {selectedSolicitacao?.autor?.trim() === currentUser?.nome_utilizador?.trim() && (
                                                <Button

                                                    className='btn-eliminar'
                                                    onClick={handleEliminarFerias}
                                                >
                                                    Eliminar
                                                </Button>
                                            )}
                                        </div>
                                        <div>
                                            <Button
                                                className='btn-cancel'
                                                onClick={() => setIsModalSolicitacaoIndividual(false)}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                className='btn-submit-rejeitar'
                                                onClick={() => setIsModalRejeitarSolicitacao(true)}
                                            >
                                                Rejeitar Pedido
                                            </Button>
                                            <Button
                                                className='btn-submit-aprovar'
                                                onClick={aprovarSolicitacao}
                                            >
                                                Aprovar Pedido
                                            </Button>
                                        </div>
                                    </div></>
                                ) : selectedSolicitacao?.estado?.trim() === 'Aprovada' ? (

                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        {selectedSolicitacao?.autor?.trim() === currentUser?.nome_utilizador?.trim() && (
                                            <Button

                                                className='btn-eliminar'
                                                onClick={handleEliminarFerias}
                                            >
                                                Eliminar
                                            </Button>
                                        )}

                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalSolicitacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                    </div>
                                ) : (
                                    

                                        <Button
                                            className='btn-ok'
                                            onClick={() => setIsModalSolicitacaoIndividual(false)}
                                        >
                                            OK
                                        </Button>
                                  

                                )
                            }


                        >
                            <p><strong>Autor do pedido: </strong></p>
                            <p>{selectedSolicitacao?.autor}</p>
                            <p><strong>Data de Início: </strong></p>
                            <p>{moment(selectedSolicitacao?.data_inicio).format('DD/MM/YYYY')}</p>
                            <p><strong>Data de Conclusão: </strong></p>
                            <p>{moment(selectedSolicitacao?.data_conclusao).format('DD/MM/YYYY')}</p>

                            {selectedSolicitacao?.estado?.trim() === 'Rejeitada' && (
                                <>
                                    <p><strong>Comentários: </strong></p>
                                    <p>{selectedSolicitacao.comentarios}</p>
                                </>
                            )}


                        </Modal>

                        <Modal className='rejeitar-solicitacao-modal'
                            open={isModalRejeitarSolicitacao}
                            title="Rejeitar Solicitação"
                            onCancel={() => setIsModalRejeitarSolicitacao(false)}
                            width={700}
                            footer={
                                <>
                                    <Button
                                        className='btn-cancel'
                                        onClick={() => setIsModalRejeitarSolicitacao(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className='btn-submit-rejeitar'
                                        onClick={rejeitarSolicitacao}
                                    >
                                        Rejeitar Pedido
                                    </Button>
                                </>
                            }
                        >
                            <Input.TextArea
                                placeholder="Comentários"
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                            />
                        </Modal>
                        <div className="dias-ferias-disponiveis">
                            <h2><strong>Dias de Férias Disponíveis:</strong></h2>
                            <h1>{numeroDiasFeriasDisponiveis}</h1>
                        </div>
                        <div className="dias-ferias-usados">
                            <h2><strong>Dias de Férias Usados:</strong></h2>
                            <h1>{numeroDiasFeriasUsados}</h1>
                        </div>
                        <div className='calendario'>
                            <Calendar fullscreen={false} cellRender={ferias_aprovadas} />
                            <Popover
                                className='popover-ferias'
                                content={
                                    <Form onFinish={handleMarcarFerias}>
                                        <p><strong>Data de Início:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataInicio} onChange={(data) => setDataInicio(data)} />
                                        </p>
                                        <p><strong>Data de Fim:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataFim} onChange={(data) => setDataFim(data)} />
                                        </p>
                                        <Button className="btn-ferias" htmlType="submit"> Submeter </Button>
                                    </Form>
                                }
                                title="Marca as tuas férias!"
                                trigger="click"
                                open={open}
                                onOpenChange={handleOpenChange}
                            >
                                <FaRegCalendarPlus style={{ fontSize: '25px', margin: '15px' }} />

                            </Popover>
                        </div>
                    </section >
                    <FloatButton.BackTop />

                </div >
            );
    }
}
