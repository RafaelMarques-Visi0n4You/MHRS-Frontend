import './App.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registar from './components/pages/Registo/Registar';
import IniciarSessao from './components/pages/IniciarSessao/IniciarSessao';
import HomePage from './components/pages/HomePage/HomePage';
import Perfil from './components/pages/Perfil/VerPerfil';
import Calendario from './components/pages/Calendario/Calendarizacao';
import Faltas from './components/pages/Calendario/Faltas';
import MarcarFerias from './components/pages/Calendario/MarcarFerias';
import Vagas from './components/pages/Vagas/Vagas';
import ProjetosAtuais from './components/pages/Projetos/ProjetosAtuais';
import ProjetosDesenvolvidos from './components/pages/Projetos/ProjetosDesenvolvidos';
import Despesas from './components/pages/Despesas/Despesas';
import Blog from './components/pages/Blog/Blog';
import DetalhesVaga from './components/pages/Vagas/DetalhesVaga';
import SugerirPublicacaoNoticia from './components/pages/Blog/SugerirPublicacaoNoticia';
import ValidarPublicacoes from './components/pages/Blog/ValidarPublicacoes';
import DetalhesPublicacaoAdmin from './components/pages/Blog/DetalhesPublicacaoAdmin';
import DetalhesProjetoConcluido from './components/pages/Projetos/ProjetoIndividualConcluído';
import CandidaturasVaga from './components/pages/Vagas/CandidaturasVagaX';
import DetalhesProjeto from './components/pages/Projetos/ProjetoIndividualAtual';
import ArquivoIdeias from './components/pages/Projetos/ArquivoIdeias';
import EditarPublicacao from './components/pages/Blog/EditarPublicação';
import MinhasPublicacoes from './components/pages/Blog/minhasPublicações';
import MinhasCandidaturas from './components/pages/Vagas/minhasCandidaturas';
import ProgramaIdeias from './components/pages/Projetos/ProgramaIdeias';
import AuthService from './components/auth.service';
import { useEffect, useState } from 'react';
import DetalhesPublicacao from './components/pages/Blog/DetalhesPublicacao';
import ArquivoVagas from './components/pages/Vagas/ArquivoVagas';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  function logOut() {
    AuthService.logout();
  }

  return (
    <Router>
      <Routes>
        {/*Comuns a todos os tipos de users*/}
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/user/registo" element={<Registar />} />
        <Route exact path="/user/login" element={<IniciarSessao />} />
        <Route exact path="/Perfil" element={<Perfil />} />
        <Route exact path="/blog" element={<Blog />} />
        <Route exact path="/blog/:id_publicacao" element={<DetalhesPublicacao/>}/>
        <Route exact path="/blog/minhasPublicacoes" element={<MinhasPublicacoes/>} />
        <Route exact path="/vagas" element={<Vagas />} />
        <Route exact path="/vagas/:id_vaga" element={<DetalhesVaga />} />
        <Route exact path="/vagas/minhasCandidaturas" element={<MinhasCandidaturas />} />
        <Route exact path="/blog/editarPublicacao/:id_publicacao" element={<EditarPublicacao />} />
        <Route exact path="/blog/adicionarNoticia" element={<SugerirPublicacaoNoticia />} />
        <Route exact path="/arquivoIdeias" element={<ArquivoIdeias />} />
        <Route exact path='/programaIdeias' element={<ProgramaIdeias />} />
        <Route exact path="/projetos/:id_projeto" element={<DetalhesProjeto />} />
        <Route exact path="/projetos/atuais" element={<ProjetosAtuais />} />
        <Route exact path="/projetos/desenvolvidos" element={<ProjetosDesenvolvidos />} />
        <Route exact path="/projetosConcluidos/:id_projeto" element={<DetalhesProjetoConcluido />} />
        
        {/*Rotas para Visitantes*/}



        {/*Rotas para administradores*/}
        <Route exact path="/blog/admin/gerirPublicacoes" element={<ValidarPublicacoes />} />
        <Route exact path="/blog/admin/gerirPublicacoes/:id_publicacao" element={<DetalhesPublicacaoAdmin />} />
       
        <Route exact path="/vagas/admin/candidaturas/:id_vaga" element={<CandidaturasVaga />} />
       <Route exact path="/vagas/arquivo" element={<ArquivoVagas />} /> 
        

        {/*Rotas para colaboradores*/}
        <Route exact path="/calendario" element={<Calendario />} />
        <Route exact path="/faltas" element={<Faltas />} />
        <Route exact path="/ferias" element={<MarcarFerias />} />
        
        
        <Route exact path="/despesas" element={<Despesas />} />
      </Routes>
    </Router>
  );
}

export default App;
