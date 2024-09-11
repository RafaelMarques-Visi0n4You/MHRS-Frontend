import './Faltas.css';
import NavBar from "../../layout/NavBar";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, Popover, Button, Input, notification, Table, DatePicker, Form, FloatButton, Badge, Modal } from 'antd';
import AuthService from '../../auth.service';
import { FaRegCalendarPlus } from 'react-icons/fa';

const baseUrl = "http://localhost:8080";

export default function Faltas() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();

    const [faltasUser, setFaltasUser] = useState([]);
    const [faltasTodas, setFaltasTodas] = useState([]);
    const [open, setOpen] = useState(false);
    const [dataFalta, setDataFalta] = useState('');
    const [justificacao, setJustificacao] = useState(null);
    const [numeroFaltasJustificadas, setNumeroFaltasJustificadas] = useState(0);
    const [numeroFaltasInjustificadas, setNumeroFaltasInjustificadas] = useState(0);
    const [selectedFalta, setSelectedFalta] = useState(null);
    const [isModalFaltaIndividual, setIsModalFaltaIndividual] = useState(false);
    const [comentarios, setComentarios] = useState('');
    const [isModalRejeitarFalta, setIsModalRejeitarFalta] = useState(false);
    const [justificacaoFile, setJustificacaoFile] = useState(null);

    const [user, setUser] = useState(null);
    const currentUser = AuthService.getCurrentUser();

    const columns = [
        {
            title: 'Data',
            dataIndex: 'data_falta',
            key: 'data_falta',
            render: date => moment(date).format('DD/MM/YYYY'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.data_falta) - moment(b.data_falta),
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            filters: [
                { text: 'Justificada', value: 'Justificada' },
                { text: 'Injustificada', value: 'Injustificada' },
            ],
            onFilter: (value, record) => {
                return record.tipo === value;
            }
            ,
            sorter: (a, b) => a.tipo.localeCompare(b.tipo),

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
            if (tipo_user.trim() === 'colaborador') {
                setUser(currentUser);
                LoadFalta(currentUser.id);
               
            } else if (tipo_user.trim() === 'administrador') {
                setUser(currentUser);
                LoadFaltaTodas();
            }

        } else {
            notification.error({ message: 'User is not logged in. Please log in to submit ideas.' });
        }
        
    }, []);

    useEffect(() => {
        if (faltasUser.length) {
            const justificadas = faltasUser.filter(falta => falta.tipo.trim() === 'Justificada').length;
            const injustificadas = faltasUser.filter(falta => falta.tipo.trim() === 'Injustificada').length;
            setNumeroFaltasJustificadas(justificadas);
            setNumeroFaltasInjustificadas(injustificadas);
        }
    })

    const faltas_aprovadas_user = (value) => {
        const date = moment(value.format('YYYY-MM-DD'));


        const faltasNoDia = faltasUser.filter(falta => {
            const dataFalta = moment(falta.data_falta);
            return dataFalta.isSame(date, 'day') && falta.estado.trim() === 'Aprovada';
        });


        return (
            <div className="calendar-events">
                {faltasNoDia.length > 0 && (
                    <div className="calendar-event">
                        <Badge status="error" text="Falta" />
                    </div>
                )}
            </div>
        );

    };



    const faltas_aprovadas = (value) => {
        const date = moment(value.format('YYYY-MM-DD'));
        const faltasNoDia = faltasUser.filter(falta => {
            const dataFalta = moment(falta.data_falta);
            return dataFalta.isSame(date) && falta.estado.trim() === 'Aprovada';
        });

        if (faltasNoDia.length > 0) {
            return (
                <div className="calendar-overlay">
                    {faltasNoDia.map((faltas, index) => (
                        <Badge
                            key={index}
                            status="error"
                            text={`Falta ${faltas.autor}`}
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


    const handleMarcarFalta = async () => {
        const formData = new FormData();
        formData.append('data_falta', dataFalta);
        formData.append('id_user', user.id);

        const estado = currentUser?.tipo_user?.trim() === 'colaborador' ? 'Pendente' : 'Aprovada';

        formData.append('estado', estado);
        formData.append('justificacao', justificacao);
        if (currentUser?.tipo_user?.trim() === 'administrador') {
            const justificacaotipo = justificacao ? justificacao : null;
            formData.append('tipo', justificacaotipo ? 'Justificada' : 'Injustificada');
        } else {
            formData.append('tipo', '');
        }



        try {
            const response = await axios.post(`${baseUrl}/faltas/upload`, formData);
            if (response.data.success) {
                notification.success({ message: "Solicitação submetida com sucesso!" });
                LoadFalta(currentUser.id);
                LoadFaltaTodas();
                hide();
                setDataFalta('');
                setJustificacao(null);

            } else {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: "Erro ao tentar adicionar solicitação!" });
        }
    }

    //LISTA DE FALTAS
    const LoadFaltaTodas = async () => {
        try {
            const res = await axios.get(`${baseUrl}/faltas/list`);
            if (res.data.success) {
                setFaltasTodas(res.data.faltasComUsers);
                setFaltasUser(res.data.faltasComUsers);
            } else {
                notification.error({ message: "Erro ao carregar solicitações de faltas" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const LoadFalta = async () => {
        try {
            const res = await axios.get(`${baseUrl}/faltas/list/${currentUser.id}`);

            if (res.data.success) {
                setFaltasUser(res.data.faltasComUsers);

            } else {
                notification.error({ message: "Erro ao carregar solicitações de faltas" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    //APROVAR E REJEITAR FALTA
    const rejeitarFalta = async () => {
        try {
            const res = await axios.put(`${baseUrl}/faltas/rejeitar/${selectedFalta.id_falta}`, {
                validador: currentUser.nome_utilizador,
                comentarios: comentarios
            });
            if (res.data.success) {
                notification.success({ message: "Solicitação rejeitada com sucesso!" });
                LoadFaltaTodas();
                setIsModalRejeitarFalta(false);
                setIsModalFaltaIndividual(false);

            } else {
                notification.error({ message: "Erro ao rejeitar solicitação" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const aprovarFalta = async () => {
        try {


            const justificacaotipo = selectedFalta.justificacao ? selectedFalta.justificacao : null;

            const res = await axios.put(`${baseUrl}/faltas/aprovar/${selectedFalta.id_falta}`,
                {
                    validador: currentUser.nome_utilizador,
                    tipo: justificacaotipo ? 'Justificada' : 'Injustificada'

                });
            if (res.data.success) {
                LoadFaltaTodas();
                setIsModalFaltaIndividual(false);

                notification.success({ message: "Solicitação aprovada com sucesso!" });

            } else {
                notification.error({ message: "Erro ao rejeitar solicitação" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const handleUploadJustificacao = async () => {

        try {

            const formData = new FormData();
            if (!justificacao) {
                notification.error({ message: "Nenhum arquivo foi selecionado." });
                return;
            }

            formData.append('justificacao', justificacao);

            const res = await axios.put(`${baseUrl}/faltas/adicionarJustificacao/${selectedFalta.id_falta}`, formData);
            if (res.data.success) {
                LoadFaltaTodas();
                setIsModalFaltaIndividual(false);

                notification.success({ message: "Justificação adicionada com sucesso!" });

            } else {
                notification.error({ message: "Erro ao justificar falta" });
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
                    <section className="container-faltas">
                        <h1 className='titulo-faltas'>Faltas</h1>
                        <Table className='tabela-faltas' dataSource={faltasUser} columns={columns} style={{ cursor: 'pointer' }} onRow={(record) => ({
                            onClick: () => {
                                setSelectedFalta(record);
                                setIsModalFaltaIndividual(true);
                            },
                        })} />

                        <Modal
                            className='falta-modal'
                            open={isModalFaltaIndividual}
                            title="Detalhes da Falta"
                            onCancel={() => setIsModalFaltaIndividual(false)}
                            width={700}
                            footer={
                                <Button
                                    className='btn-ok'
                                    onClick={() => setIsModalFaltaIndividual(false)}
                                >
                                    OK
                                </Button>

                            }
                        >
                            <p style={{ fontSize: '14px', color: 'gray' }}>{moment(selectedFalta?.data_falta).format('DD/MM/YYYY')}</p>
                            <p><strong>Justificação: </strong></p>
                            <p>
                                {selectedFalta?.justificacao ? (
                                    <a
                                        href={`http://localhost:8080/${selectedFalta.justificacao}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Ver Justificação
                                    </a>
                                ) : (
                                    <div>
                                        <span>Nenhuma justificação disponível</span>
                                        <Input
                                            type="file"
                                            accept="application/pdf, image/*"
                                            style={{ width: '100%', marginTop: '10px' }}
                                            onChange={(e) => setJustificacao(e.target.files[0])}
                                        />
                                        <Button
                                            className='btn-submit-justificar'
                                            onClick={handleUploadJustificacao}
                                            style={{ marginTop: '10px' }}
                                        >
                                            Adicionar Justificação
                                        </Button>
                                    </div>
                                )}
                            </p>

                            {selectedFalta?.estado.trim() === 'Rejeitada' && (
                                <>

                                    <p><strong>Comentários: </strong></p>
                                    <p>{selectedFalta.comentarios ? selectedFalta.comentarios : 'Sem comentários.'}</p>
                                </>
                            )}
                        </Modal>

                        <div className="faltas-injustificadas">
                            <h2><strong>Faltas Injustificadas:</strong></h2>
                            <h1>{numeroFaltasInjustificadas}</h1>
                        </div>

                        <div className="faltas-justificadas">
                            <h2><strong>Faltas Justificadas:</strong></h2>
                            <h1>{numeroFaltasJustificadas}</h1>
                        </div >
                        <div className="calendario">
                            <Calendar fullscreen={false} cellRender={faltas_aprovadas_user} />
                            <Popover
                                content={
                                    <Form onFinish={handleMarcarFalta}>
                                        <p><strong>Data:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataFalta} onChange={(data) => setDataFalta(data)} />
                                        </p>

                                        <p><strong>Justificação:</strong>
                                            <Input type="file"
                                                accept='application/pdf, image/*'
                                                style={{ width: '100%' }}
                                                onChange={(e) => setJustificacao(e.target.files[0])} />
                                        </p>
                                        <Button className="btn-faltas" htmlType="submit"> Submeter </Button>
                                    </Form>
                                }
                                title="Precisas de faltar? Não te esqueças de avisar!"
                                trigger="click"
                                open={open}
                                onOpenChange={handleOpenChange}
                            >
                                <FaRegCalendarPlus style={{ fontSize: '25px', margin: '15px' }} />

                            </Popover>
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div >


            );
        case 'administrador':
            return (
                <div>
                    <NavBar />
                    <section className="container-faltas">
                        <h1 className='titulo-faltas'>Faltas</h1>
                        <Table className='tabela-faltas' dataSource={faltasTodas} columns={columns} onRow={(record) => ({
                            onClick: () => {
                                setSelectedFalta(record);
                                setIsModalFaltaIndividual(true);
                            },
                        })} />
                        <Modal
                            className='falta-modal'
                            open={isModalFaltaIndividual}
                            title="Detalhes da Solicitação"
                            onCancel={() => setIsModalFaltaIndividual(false)}
                            width={700}
                            footer={
                                selectedFalta?.estado.trim() === 'Pendente' ? (
                                    <>
                                        <Button
                                            className='btn-cancel'
                                            onClick={() => setIsModalFaltaIndividual(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className='btn-submit-rejeitar'
                                            onClick={() => setIsModalRejeitarFalta(true)}
                                        >
                                            Rejeitar Pedido
                                        </Button>
                                        <Button
                                            className='btn-submit-aprovar'
                                            onClick={aprovarFalta}
                                        >
                                            Aprovar Pedido
                                        </Button>

                                    </>
                                ) : (
                                    <Button
                                        style={{display: 'flex'}}
                                        className='btn-ok'
                                        onClick={() => setIsModalFaltaIndividual(false)}
                                    >
                                        OK
                                    </Button>
                                )
                            }
                        >
                            <p style={{ fontSize: '14px', color: 'gray' }}>{moment(selectedFalta?.data_falta).format('DD/MM/YYYY')}</p>
                            <p><strong>Autor do pedido: </strong></p>
                            <p>{selectedFalta?.autor}</p>
                            <p><strong>Justificação: </strong></p>
                            <p>
                                {selectedFalta?.justificacao ? (
                                    <a
                                        href={`http://localhost:8080/${selectedFalta.justificacao}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Ver Justificação
                                    </a>
                                ) : (<div>
                                    {selectedFalta?.autor === currentUser.nome_utilizador ? (
                                        <>
                                            <span>Nenhuma justificação disponível</span>
                                            <Input
                                                type="file"
                                                accept="application/pdf, image/*"
                                                style={{ width: '100%', marginTop: '10px' }}
                                                onChange={(e) => setJustificacao(e.target.files[0])}
                                            />
                                            <Button
                                            className='btn-submit-justificar'
                                                onClick={handleUploadJustificacao}
                                                style={{ marginTop: '10px' }}
                                            >
                                                Adicionar Justificação
                                            </Button>
                                        </>
                                    ) : (<span>Nenhuma justificação disponível</span>)} </div>
                                )}
                            </p>

                            {selectedFalta?.estado === 'Rejeitada' && (
                                <>
                                    <p><strong>Comentários: </strong></p>
                                    <p>{selectedFalta.comentarios ? selectedFalta.comentarios : 'Sem comentários.'}</p>
                                </>
                            )}


                        </Modal>
                        <Modal className='rejeitar-solicitacao-modal'
                            open={isModalRejeitarFalta}
                            title="Rejeitar Solicitação"
                            onCancel={() => setIsModalRejeitarFalta(false)}
                            width={700}
                            footer={
                                <>
                                    <Button
                                        className='btn-cancel'
                                        onClick={() => setIsModalRejeitarFalta(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className='btn-submit-rejeitar'
                                        onClick={rejeitarFalta}
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
                        <div className="faltas-injustificadas">
                            <h2><strong>Faltas Injustificadas:</strong></h2>
                            <h1>{numeroFaltasInjustificadas}</h1>
                        </div>

                        <div className="faltas-justificadas">
                            <h2><strong>Faltas Justificadas:</strong></h2>
                            <h1>{numeroFaltasJustificadas}</h1>
                        </div>
                        <div className="calendario">
                            <Calendar fullscreen={false} cellRender={faltas_aprovadas} />
                            <Popover
                                content={
                                    <Form onFinish={handleMarcarFalta}>
                                        <p><strong>Data:</strong>
                                            <DatePicker style={{ width: '100%' }} value={dataFalta} onChange={(data) => setDataFalta(data)} />
                                        </p>
                                        <p><strong>Justificação:</strong>
                                            <Input
                                                style={{ width: '100%' }}
                                                type="file"
                                                accept='application/pdf, image/*'
                                                onChange={(e) => setJustificacao(e.target.files[0])} />
                                        </p>
                                        <Button className="btn-faltas" htmlType="submit"> Submeter </Button>
                                    </Form>
                                }
                                title="Precisas de faltar? Não te esqueças de avisar!"
                                trigger="click"
                                open={open}
                                onOpenChange={handleOpenChange}
                            >
                                <FaRegCalendarPlus style={{ fontSize: '25px', margin: '10px' }} />
                            </Popover>
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div>


            );
    }
}

