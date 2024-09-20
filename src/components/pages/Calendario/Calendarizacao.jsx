import './Calendarizacao.css';
import React from 'react';
import NavBar from '../../layout/NavBar';
import { Badge, Calendar, FloatButton, notification, Button } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AuthService from '../../auth.service';
import moment from 'moment';

const baseUrl = "http://localhost:8080";

export default function Calendarizacao() {
    const tipo_user = localStorage.getItem('tipo_user')?.trim().toLowerCase();
    const [faltasUser, setFaltasUser] = useState([]);
    const [feriasUser, setFeriasUser] = useState([]);
    const [faltasTodas, setFaltasTodas] = useState([]);
    const [feriasTodas, setFeriasTodas] = useState([]);

    const [user, setUser] = useState({});
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (currentUser && currentUser.id) {
            if (tipo_user === 'colaborador') {
                setUser(currentUser);
                LoadEventosUser(currentUser.id);
            } else if (tipo_user === 'administrador') {
                setUser(currentUser);
                LoadEventos();

            }
        }
        else {
            notification.error({ message: 'User is not logged in. Please log in to submit.' });
        }
    }, []);


    const inicioSemana = moment().startOf('week');
    const fimSemana = moment().endOf('week');
    //Próximos Eventos da semana
    const faltasTodasSemana = faltasTodas.filter(falta => {
        const dataFalta = moment(falta.data_falta);
        return dataFalta.isBetween(inicioSemana, fimSemana, null, '[]');
    });

    const feriasTodasSemana = feriasTodas.filter(ferias => {
        const dataInicio = moment(ferias.data_inicio);
        const dataConclusao = moment(ferias.data_conclusao);
        return (dataInicio.isBetween(inicioSemana, fimSemana, null, '[]') ||
            dataConclusao.isBetween(inicioSemana, fimSemana, null, '[]') ||
            (dataInicio.isBefore(inicioSemana) && dataConclusao.isAfter(fimSemana)));
    });

    //Próximos Eventos da semana do user

    const faltasUserSemana = faltasUser.filter(falta => {
        const dataFalta = moment(falta.data_falta);
        return dataFalta.isBetween(inicioSemana, fimSemana, null, '[]')  && falta.estado.trim() === 'Aprovada';
    });

    const feriasUserSemana = feriasUser.filter(ferias => {
        const dataInicio = moment(ferias.data_inicio);
        const dataConclusao = moment(ferias.data_conclusao);
        return (dataInicio.isBetween(inicioSemana, fimSemana, null, '[]') ||
            dataConclusao.isBetween(inicioSemana, fimSemana, null, '[]') ||
            (dataInicio.isBefore(inicioSemana) && dataConclusao.isAfter(fimSemana)  && ferias.estado.trim() === 'Aprovada'));
    });

    const eventos_aprovados_user = (value) => {
        const date = moment(value.format('YYYY-MM-DD'));


        const faltasNoDia = faltasUser.filter(falta => {
            const dataFalta = moment(falta.data_falta);
            return dataFalta.isSame(date) && falta.estado.trim() === 'Aprovada';
        });

        const feriasNoDia = feriasUser.filter(f => {
            const dataInicio = moment(f.data_inicio, 'YYYY-MM-DD');
            const dataConclusao = moment(f.data_conclusao, 'YYYY-MM-DD');
            return date.isBetween(dataInicio, dataConclusao, null,  '[]') && f.estado && f.estado.trim() === 'Aprovada';
        });
        

        return (
            <div className="calendar-events">
                {faltasNoDia.length > 0 && (
                    <div className="calendar-event">
                        <Badge status="error" text="Falta" />
                    </div>
                )}
                {feriasNoDia.length > 0 && (
                    <div className="calendar-event">
                        <Badge status="success" text="Férias" />
                    </div>
                )}
            </div>
        );
    };

    const eventos_aprovados = (value) => {


        const date = moment(value.format('YYYY-MM-DD'));


        const faltasNoDia = faltasTodas.filter(falta => {
            const dataFalta = moment(falta.data_falta);
            return dataFalta.isSame(date) && falta.estado  &&falta.estado.trim() === 'Aprovada';
        });

        const feriasNoDia = feriasTodas.filter(f => {
            const dataInicio = moment(f.data_inicio, 'YYYY-MM-DD');
            const dataConclusao = moment(f.data_conclusao, 'YYYY-MM-DD');
            return date.isBetween(dataInicio, dataConclusao, null,  '[]') && f.estado && f.estado.trim() === 'Aprovada';
        });


        return (
            <div className="calendar-events">
                {faltasNoDia.length > 0 && (
                    <div className="calendar-event">
                        {faltasNoDia.map((falta, index) => (
                            <Badge
                                key={index}
                                status="error"
                                text={`Falta ${falta.autor}`}
                            />
                        ))}
                    </div>
                )}
                {feriasNoDia.length > 0 && (
                    <div className="calendar-event">
                        {feriasNoDia.map((ferias, index) => (
                            <Badge
                                key={index}
                                status="success"
                                text={`Férias ${ferias.autor}`}
                            />
                        ))}
                    </div>
                )}
            </div>

        );
    };



    const LoadEventosUser = async () => {
        try {
            const res = await axios.get(`${baseUrl}/calendario/list/${currentUser.id}`);

            if (res.data.success) {
                setFaltasUser(res.data.faltas);
                setFeriasUser(res.data.ferias);

            } else {
                notification.error({ message: "Erro ao carregar solicitações de faltas" });
            }
        } catch (error) {
            notification.error({ message: `Erro: ${error.message}` });
        }
    }

    const LoadEventos = async () => {
        try {
            const res = await axios.get(`${baseUrl}/calendario/list`);

            if (res.data.success) {
                setFaltasTodas(res.data.faltasComUsers);
                setFeriasTodas(res.data.feriasComUsers);
            } else {
                notification.error({ message: "Erro ao carregar solicitações de faltas" });
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

                    <section className='container-calendario'>
                        <h1>Calendário</h1>

                        <Calendar fullscreen={false} cellRender={eventos_aprovados_user} />

                        <Button href='/ferias' className="btn-ferias">Marcar Férias</Button>
                        <Button href="/faltas" className="btn-faltas">Faltas</Button>

                        <div className="proximos-eventos">
                            <h2><strong>Próximos Eventos</strong></h2>
                            <h5><strong>Faltas</strong></h5>
                            {faltasUserSemana.length > 0 ? (
                                <ul>
                                    {faltasUserSemana.map((falta, index) => (
                                        <li key={index}>
                                            {`Data: ${falta.data_falta ? moment(falta.data_falta).format('DD/MM/YYYY') : 'N/A'}`}                            .
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Não há faltas registadas.</p>
                            )}

                            <h5><strong>Férias</strong></h5>
                            {feriasUserSemana.length > 0 ? (
                                <ul>
                                    {feriasUserSemana.map((ferias, index) => (
                                        <li key={index}>
                                            {`Início: ${ferias.data_inicio ? moment(ferias.data_inicio).format('DD/MM/YYYY') : 'N/A'}, Fim: ${ferias.data_conclusao ? moment(ferias.data_conclusao).format('DD/MM/YYYY') : 'N/A'}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Não há férias registradas.</p>
                            )}
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
        case 'administrador':
            return (
                <div>
                    <NavBar />

                    <section className='container-calendario'>
                        <h1>Calendário</h1>

                        <Calendar fullscreen={false} cellRender={eventos_aprovados} />

                        <Button href='/ferias' className="btn-ferias">Marcar Férias</Button>
                        <Button href="/faltas" className="btn-faltas">Faltas</Button>

                        <div className="proximos-eventos">
                            <h2><strong>Próximos Eventos</strong></h2>
                            <h5><strong>Faltas</strong></h5>
                            {faltasTodasSemana.length > 0 ? (
                                <ul>
                                    {faltasTodasSemana.map((falta, index) => (
                                        <li key={index}>
                                            {`Data: ${falta.data_falta ? moment(falta.data_falta).format('DD/MM/YYYY') : 'N/A'}, Colaborador: ${falta.autor}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Não há faltas registadas.</p>
                            )}

                            <h5><strong>Férias</strong></h5>
                            {feriasTodasSemana.length > 0 ? (
                                <ul>
                                    {feriasTodasSemana.map((ferias, index) => (
                                        <li key={index}>
                                            {`Início: ${ferias.data_inicio ? moment(ferias.data_inicio).format('DD/MM/YYYY') : 'N/A'}, Fim: ${ferias.data_conclusao ? moment(ferias.data_conclusao).format('DD/MM/YYYY') : 'N/A'}, , Colaborador: ${ferias.autor}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Não há férias registradas.</p>
                            )}
                        </div>
                    </section>
                    <FloatButton.BackTop />
                </div>
            );
    }
}


