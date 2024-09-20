import './HomePage.css';
import React from 'react';
import NavBar from '../../layout/NavBarHomePage';

export default function HomePage() {
    return (
        <div className='container-fluid'>
        <NavBar />
            <div className='row'>
                <div className='col-md-6'>
                    <div>
                        <div className="quadrado1"></div>
                    </div>
                    <div className="palavra-quadrado1">
                        <p className="Palavra1">Ambição</p>
                        <div className="quadrado2"></div>
                    </div>
                    <div className="palavra-quadrado2">
                        <p className="Palavra2">Criatividade</p>
                        <div className="quadrado3"></div>
                    </div>
                    <div className="palavra-quadrado3">
                        <p className="Palavra3">Responsabilidade</p>
                        <div className="quadrado4"></div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h1 className="titulo">Bem Vindo!</h1>
                    <p className="SubTitulo">Potenciando pessoas, construindo futuros!</p>
                </div>
            </div>
        </div>
        );
}