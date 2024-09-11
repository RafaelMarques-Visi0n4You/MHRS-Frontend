import './Vagas.css';
import React, { useState, useEffect } from 'react';
import NavBar from '../../layout/NavBar';
import { notification, Button, Modal, Table, FloatButton, Steps } from 'antd';
import AuthService from '../../auth.service';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import moment from 'moment';

export default function MinhasCandidaturas() {
    const currentUser = AuthService.getCurrentUser();
    const tipo_user = currentUser?.tipo_user?.trim().toLowerCase();

    const [candidaturas, setCandidaturas] = useState([]);
    const [candidaturasVisitante, setCandidaturasVisitante] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedCandidatura, setSelectedCandidatura] = useState(null);
    const [isModalCandidaturaIndividual, setIsModalCandidaturaIndividual] = useState(false);

    const columns = [
        { title: 'Vaga', dataIndex: 'titulo_vaga', key: 'titulo_vaga' },
        {
            title: 'Estado', dataIndex: 'status', key: 'estado',
            filters: [
                { text: 'Em análise', value: 'Em análise' },
                { text: 'A aguardar análise', value: 'A aguardar análise' },
                { text: 'Análise Concluída', value: 'Análise Concluída' },

            ],
            onFilter: (value, record) => {
                return record.status.trim() === value;
            }
            ,
            sorter: (a, b) => a.status.localeCompare(b.status),

        },
        {
            title: 'Resultado', dataIndex: 'resultado', key: 'resultado',
            filters: [
                { text: 'Atribuída', value: 'Atribuída' },
                { text: 'Não atribuída', value: 'Não atribuída' },

            ],
            onFilter: (value, record) => {
                return record?.resultado?.trim() === value;
            }
            ,
            sorter: (a, b) => a.resultado.localeCompare(b.resultado),
        },
        {
            title: '', key: 'acoes', render: (record) => (
                <FaSearch style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setSelectedCandidatura(record);
                        setIsModalCandidaturaIndividual(true);
                    }}
                />
            )
        }
    ];



    useEffect(() => {
        try {
            if (currentUser && currentUser.id) {
                console.log('User is logged in:', currentUser);
                setUser(currentUser);
                minhasCandidaturas(currentUser.id);
            } else {
                notification.error({ message: 'User is not logged in. Please log in to submit.' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            notification.error({ message: 'Failed to fetch user data.' });
        }
    }, []);

    const steps = [
        {
            title: 'A aguardar análise',
            description: 'Candidatura submetida com sucesso! A aguardar análise.',
        },
        {
            title: 'Em Análise',
            description: 'A sua candidatura está em análise.',
        },
        {
            title: 'Análise Concluída',
            description: 'Processo finalizado.',
        },
    ];

    const currentStep = steps.findIndex(step => step.title.trim().toLowerCase() === selectedCandidatura?.status?.trim().toLowerCase());

    const minhasCandidaturas = async () => {
        try {
            if (tipo_user === 'colaborador') {
                const response = await axios.get(`http://localhost:8080/candidaturas/list/${currentUser.id}`);
                if (response.data.success) {
                    setCandidaturas(response.data.dadosCandidatura);
                    console.log('Candidaturas:', response.data.dadosCandidatura);
                } else {
                    console.error(response.data.message);
                    notification.error({ message: response.data.message });
                }
            } else {

                const response = await axios.get(`http://localhost:8080/candidaturas/listVisitante/${currentUser.id}`);
                if (response.data.success) {
                    setCandidaturasVisitante(response.data.dadosCandidaturaVisitante);
                } else {
                    console.error(response.data.message);
                    notification.error({ message: response.data.message });
                }
            }

        } catch (error) {
            console.error('Erro ao carregar candidaturas:', error);
            notification.error({ message: 'Erro ao carregar candidaturas.' });
        }
    }

    if (tipo_user === 'colaborador') {
        return (
            <div>
                <NavBar />
                <section className='candidaturas'>
                    <h1>As minhas candidaturas</h1>
                </section>
                <Table className='tabela-ideias' dataSource={candidaturas} columns={columns} />
                <Modal
                    className='modal-candidatura'
                    title='Candidatura'
                    open={isModalCandidaturaIndividual}
                    onCancel={() => setIsModalCandidaturaIndividual(false)}
                    width={900}
                    footer={[
                        <Button className="btn-ok" onClick={() => setIsModalCandidaturaIndividual(false)}>
                            OK
                        </Button>
                    ]}
                >
                    <div className="modal-conteudo">
                        <div className='dados-candidatura'>
                            <p style={{ fontSize: '14px', color: 'gray' }}>
                                {selectedCandidatura?.data_submissao
                                    ? moment(selectedCandidatura.data_submissao).format('DD-MM-YYYY')
                                    : 'Não disponível'} </p>
                            <p><strong>Vaga:</strong></p>
                            <p>{selectedCandidatura?.titulo_vaga}</p>

                            {selectedCandidatura?.resultado !== null ? (
                                <>
                                    <p><strong>Resultado:</strong></p>
                                    <p>{selectedCandidatura?.resultado}</p>
                                    <p><strong>Data do resultado:</strong></p>
                                    <p>
                                        {selectedCandidatura?.data_resultado
                                            ? moment(selectedCandidatura.data_resultado).format('DD-MM-YYYY')
                                            : 'Não disponível'} </p>
                                </>
                            ) : null
                            }
                        </div>
                        <div className="status-candidatura">
                            <Steps
                                direction="vertical"
                                current={currentStep}
                                items={steps}

                            />
                        </div>
                    </div>
                </Modal >


                <FloatButton.BackTop />
            </div >
        );
    }
    else {
        return (
            <div>
                <NavBar />
                <section className='candidaturas'>
                    <h1>As minhas candidaturas</h1>
                </section>
                <Table className='tabela-ideias' dataSource={candidaturasVisitante} columns={columns} />
                <Modal
                    className='modal-candidatura'
                    title='Candidatura'
                    open={isModalCandidaturaIndividual}
                    onCancel={() => setIsModalCandidaturaIndividual(false)}
                    width={900}
                    footer={[
                        <Button className="btn-ok" onClick={() => setIsModalCandidaturaIndividual(false)}>
                            OK
                        </Button>
                    ]}
                >
                    <div className="modal-conteudo">
                        <div className='dados-candidatura'>
                            <p style={{ fontSize: '14px', color: 'gray' }}>
                                {selectedCandidatura?.data_submissao
                                    ? moment(selectedCandidatura?.data_submissao).format('DD-MM-YYYY')
                                    : 'Não disponível'} </p>
                            <p><strong>Vaga:</strong></p>
                            <p>{selectedCandidatura?.titulo_vaga}</p>

                            {selectedCandidatura?.resultado !== null ? (
                                <>
                                    <p><strong>Resultado:</strong></p>
                                    <p>{selectedCandidatura?.resultado}</p>
                                    <p><strong>Data do resultado:</strong></p>
                                    <p>
                                        {selectedCandidatura?.data_resultado
                                            ? moment(selectedCandidatura.data_resultado).format('DD-MM-YYYY')
                                            : 'Não disponível'} </p>
                                </>
                            ) : null
                            }
                        </div>
                        <div className="status-candidatura">
                            <Steps
                                direction="vertical"
                                current={currentStep}
                                items={steps}

                            />
                        </div>
                    </div>
                </Modal >


                <FloatButton.BackTop />
            </div >
        );
    }
}
