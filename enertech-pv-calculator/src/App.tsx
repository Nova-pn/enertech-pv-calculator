import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import Layout from './components/Layout';
import Home from './components/Home';
import StepProject from './components/StepProject';
import StepConsumption from './components/StepConsumption';
import StepSolar from './components/StepSolar';
import StepBattery from './components/StepBattery';
import StepInverter from './components/StepInverter';
import StepRegulator from './components/StepRegulator';
import Results from './components/Results';
import About from './components/About';

export default function App() {
  return (
    <ProjectProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dimensionnement/projet" element={<StepProject />} />
            <Route path="dimensionnement/consommation" element={<StepConsumption />} />
            <Route path="dimensionnement/solaire" element={<StepSolar />} />
            <Route path="dimensionnement/batterie" element={<StepBattery />} />
            <Route path="dimensionnement/onduleur" element={<StepInverter />} />
            <Route path="dimensionnement/regulateur" element={<StepRegulator />} />
            <Route path="resultats" element={<Results />} />
            <Route path="a-propos" element={<About />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProjectProvider>
  );
}
