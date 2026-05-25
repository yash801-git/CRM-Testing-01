import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingAuth from './pages/LandingAuth';
import BrokerLogin from './pages/BrokerLogin';
import AgentLogin from './pages/AgentLogin';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Properties from './modules/properties/PropertiesPage';
import PropertyDetails from './modules/properties/PropertyDetailsPage';
import Leads from './modules/leads/LeadsPage';
import LeadDetails from './modules/leads/LeadDetailsPage';
import Deals from './modules/deals/DealsPage';
import DealDetails from './modules/deals/DealDetailsPage';
import SiteVisits from './modules/site-visits/SiteVisitsPage';
import Tasks from './modules/tasks/TasksPage';
import Agents from './modules/agents/AgentsPage';
import Profile from './pages/Profile';
import Marketing from './modules/marketing/MarketingPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PublicFormPage from './pages/PublicFormPage';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LandingAuth />} />
        <Route path="/broker" element={<BrokerLogin />} />
        <Route path="/agent" element={<AgentLogin />} />
        <Route path="/login/broker" element={<Navigate to="/broker" replace />} />
        <Route path="/login/agent" element={<Navigate to="/agent" replace />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/public/lead-form" element={<PublicFormPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="pipeline" element={<Deals />} />
          <Route path="pipeline/:id" element={<DealDetails />} />
          <Route path="visits" element={<SiteVisits />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Agents />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
