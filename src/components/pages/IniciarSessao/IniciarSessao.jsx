import React, { useState } from 'react';
import './IniciarSessao.css';
import Logo from '../../../img/Logo.png';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../auth.service';

export default function IniciarSessao() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [passVisitante, setPassVisitante] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVisitante, setIsVisitante] = useState(false);

  async function HandleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
  
    try {
      let res;
      if (isVisitante) {
        res = await AuthService.loginVisitante(email, passVisitante);
        navigate("/vagas/minhasCandidaturas");
      } else {
        res = await AuthService.login(user, pass);
        navigate("/blog");
      }
  
      if (res) {
        localStorage.setItem('tipo_user', res.user.tipo_user);
        localStorage.setItem('id_calendario', res.user.id_calendario);
      } else {
        setMessage("Autenticação falhou.");
      }
  
    } catch (error) {
      setMessage("Autenticação falhou.");
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className="background">
      <div className="container-iniciar-sessao">
        <img className="logo-login-registo" src={Logo} alt="mhr" />
        <h1 className="inicio-sessao">Iniciar Sessão</h1>
        {message && (
          <div className="form-group">
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          </div>
        )}
        <form onSubmit={HandleLogin}>
          <div>
            <label style={{fontSize:'20px'}}>
              <input
                type="checkbox"
                checked={isVisitante}
                onChange={() => setIsVisitante(!isVisitante)}
                style={{ marginRight: '8px' }}
              />
              Iniciar Sessão como Visitante
            </label>
          </div>

          {!isVisitante ? (
            <>
              <div className="container-input">
                <label htmlFor="username" className="visually-hidden">Nome de utilizador</label>
                <input
                  className="input-inicio-sessao"
                  type="text"
                  id="username"
                  placeholder="Nome de utilizador"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required />
                <div className="icon">
                  <i className="fa fa-user" aria-hidden="true"></i>
                </div>
              </div>

              <div className="container-input">
                <label htmlFor="password" className="visually-hidden">Palavra-passe</label>
                <input
                  className="input-inicio-sessao"
                  type="password"
                  id="password"
                  placeholder="Palavra-passe"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required />
                <div className="icon">
                  <i className="fa fa-key" aria-hidden="true"></i>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="container-input">
                <label htmlFor="email" className="visually-hidden">Email</label>
                <input
                  className="input-inicio-sessao"
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />
                <div className="icon">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                </div>
              </div>

              <div className="container-input">
                <label htmlFor="passwordVisitante" className="visually-hidden">Palavra-passe</label>
                <input
                  className="input-inicio-sessao"
                  type="password"
                  id="passwordVisitante"
                  placeholder="Palavra-passe"
                  value={passVisitante}
                  onChange={(e) => setPassVisitante(e.target.value)}
                  required />
                <div className="icon">
                  <i className="fa fa-key" aria-hidden="true"></i>
                </div>
              </div>
            </>
          )}

          <button className="btn-entrar" type="submit" disabled={loading}>
            {loading ? "A carregar..." : "Entrar"}
          </button>
        </form>
        <h2 className="conta-nova">Ainda não tens conta?</h2>
        <Link to="/user/registo" id="btn-registo" className="btn-entrar">Regista-te</Link>
      </div>
    </div>
  );
};
