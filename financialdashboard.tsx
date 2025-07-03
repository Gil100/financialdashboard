import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Filter, TrendingUp, DollarSign, Receipt, AlertCircle, CheckCircle } from 'lucide-react';

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([
    {
      id: 1,
      orderDate: '2024-01-15',
      clientName: 'חברת ABC',
      orderDetails: 'מכל חלב 5000L + מערכת קירור',
      transactionAmount: 45000,
      vatPercent: 17,
      totalPayment: 52650,
      projectReceipts: 30000,
      remainingBalance: 22650,
      projectNotes: 'פרויקט דחוף - לקוח VIP'
    },
    {
      id: 2,
      orderDate: '2024-02-01',
      clientName: 'משק השמש',
      orderDetails: 'מכל חלב 3000L + מערכת קירור',
      transactionAmount: 32000,
      vatPercent: 17,
      totalPayment: 37440,
      projectReceipts: 37440,
      remainingBalance: 0,
      projectNotes: 'פרויקט הושלם בהצלחה'
    },
    {
      id: 3,
      orderDate: '2024-02-15',
      clientName: 'חוות הזית',
      orderDetails: 'מכל חלב 7000L + מערכת קירור מתקדמת',
      transactionAmount: 68000,
      vatPercent: 17,
      totalPayment: 79560,
      projectReceipts: 15000,
      remainingBalance: 64560,
      projectNotes: 'ממתין לאישור נוסף'
    }
  ]);

  const [selectedProject, setSelectedProject] = useState('all');
  const [isEditing, setIsEditing] = useState(null);
  const [newProject, setNewProject] = useState({
    orderDate: '',
    clientName: '',
    orderDetails: '',
    transactionAmount: '',
    vatPercent: 17,
    projectReceipts: '',
    projectNotes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // חישוב KPI
  const dashboardData = useMemo(() => {
    const filteredProjects = selectedProject === 'all' 
      ? projects 
      : projects.filter(p => p.id === parseInt(selectedProject));

    const totalTransactionAmount = filteredProjects.reduce((sum, p) => sum + p.transactionAmount, 0);
    const totalVatAmount = filteredProjects.reduce((sum, p) => sum + (p.transactionAmount * p.vatPercent / 100), 0);
    const totalPayment = filteredProjects.reduce((sum, p) => sum + p.totalPayment, 0);
    const totalReceipts = filteredProjects.reduce((sum, p) => sum + p.projectReceipts, 0);
    const totalRemaining = filteredProjects.reduce((sum, p) => sum + p.remainingBalance, 0);

    const completionRate = totalPayment > 0 ? (totalReceipts / totalPayment) * 100 : 0;
    const completedProjects = filteredProjects.filter(p => p.remainingBalance === 0).length;
    const inProgressProjects = filteredProjects.filter(p => p.remainingBalance > 0).length;

    return {
      totalTransactionAmount,
      totalVatAmount,
      totalPayment,
      totalReceipts,
      totalRemaining,
      completionRate,
      completedProjects,
      inProgressProjects,
      totalProjects: filteredProjects.length
    };
  }, [projects, selectedProject]);

  const handleAddProject = () => {
    const totalPayment = newProject.transactionAmount * (1 + newProject.vatPercent / 100);
    const remainingBalance = totalPayment - (newProject.projectReceipts || 0);

    const project = {
      id: Date.now(),
      ...newProject,
      transactionAmount: parseFloat(newProject.transactionAmount),
      vatPercent: parseFloat(newProject.vatPercent),
      totalPayment,
      projectReceipts: parseFloat(newProject.projectReceipts || 0),
      remainingBalance
    };

    setProjects([...projects, project]);
    setNewProject({
      orderDate: '',
      clientName: '',
      orderDetails: '',
      transactionAmount: '',
      vatPercent: 17,
      projectReceipts: '',
      projectNotes: ''
    });
    setShowAddForm(false);
  };

  const handleEditProject = (id, updatedProject) => {
    const totalPayment = updatedProject.transactionAmount * (1 + updatedProject.vatPercent / 100);
    const remainingBalance = totalPayment - updatedProject.projectReceipts;

    setProjects(projects.map(p => 
      p.id === id 
        ? { ...updatedProject, id, totalPayment, remainingBalance }
        : p
    ));
    setIsEditing(null);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const filteredProjectsForTable = projects.filter(project =>
    project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.orderDetails.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const KPICard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 border-r-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">דשבורד פיננסי חכם</h1>
            <div className="flex space-x-reverse space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                דשבורד
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'database' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                מסד נתונים
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Project Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-reverse space-x-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">סינון לפי פרויקט:</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-right"
                >
                  <option value="all">כל הפרויקטים</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.clientName} - {project.orderDetails.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPICard
                title="סכום עסקאות"
                value={formatCurrency(dashboardData.totalTransactionAmount)}
                icon={DollarSign}
                color="#3B82F6"
              />
              <KPICard
                title="סכום מע״מ"
                value={formatCurrency(dashboardData.totalVatAmount)}
                icon={Receipt}
                color="#10B981"
              />
              <KPICard
                title="סה״כ לתשלום"
                value={formatCurrency(dashboardData.totalPayment)}
                icon={TrendingUp}
                color="#8B5CF6"
              />
              <KPICard
                title="תקבולים לפרויקט"
                value={formatCurrency(dashboardData.totalReceipts)}
                icon={CheckCircle}
                color="#06B6D4"
              />
              <KPICard
                title="יתרה לתשלום"
                value={formatCurrency(dashboardData.totalRemaining)}
                icon={AlertCircle}
                color="#EF4444"
              />
              <KPICard
                title="אחוז השלמה"
                value={`${dashboardData.completionRate.toFixed(1)}%`}
                icon={TrendingUp}
                color="#F59E0B"
                subtitle={`${dashboardData.completedProjects} מתוך ${dashboardData.totalProjects} פרויקטים`}
              />
            </div>

            {/* Project Status Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטוס פרויקטים</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.completedProjects}</div>
                  <div className="text-sm text-green-800">פרויקטים שהושלמו</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardData.inProgressProjects}</div>
                  <div className="text-sm text-yellow-800">פרויקטים בתהליך</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.totalProjects}</div>
                  <div className="text-sm text-blue-800">סה״כ פרויקטים</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-reverse space-x-4">
                  <Search className="h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="חיפוש לפי שם לקוח או פירוט הזמנה..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-80 text-right"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-reverse space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>הוסף פרויקט</span>
                </button>
              </div>
            </div>

            {/* Add Project Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">הוסף פרויקט חדש</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="date"
                    placeholder="תאריך הזמנה"
                    value={newProject.orderDate}
                    onChange={(e) => setNewProject({...newProject, orderDate: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="שם לקוח"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({...newProject, clientName: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-right"
                  />
                  <input
                    type="text"
                    placeholder="פירוט הזמנה"
                    value={newProject.orderDetails}
                    onChange={(e) => setNewProject({...newProject, orderDetails: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-right"
                  />
                  <input
                    type="number"
                    placeholder="סכום עסקה"
                    value={newProject.transactionAmount}
                    onChange={(e) => setNewProject({...newProject, transactionAmount: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="מע״מ (%)"
                    value={newProject.vatPercent}
                    onChange={(e) => setNewProject({...newProject, vatPercent: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="תקבולים לפרויקט"
                    value={newProject.projectReceipts}
                    onChange={(e) => setNewProject({...newProject, projectReceipts: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="הערות לפרויקט"
                    value={newProject.projectNotes}
                    onChange={(e) => setNewProject({...newProject, projectNotes: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-right md:col-span-2"
                  />
                </div>
                <div className="flex justify-end space-x-reverse space-x-4 mt-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleAddProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    שמור
                  </button>
                </div>
              </div>
            )}

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך הזמנה</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם לקוח</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פירוט הזמנה</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום עסקה</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מע״מ (%)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סה״כ לתשלום</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תקבולים</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">יתרה</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הערות</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjectsForTable.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        isEditing={isEditing === project.id}
                        onEdit={() => setIsEditing(project.id)}
                        onSave={(updatedProject) => handleEditProject(project.id, updatedProject)}
                        onCancel={() => setIsEditing(null)}
                        onDelete={() => handleDeleteProject(project.id)}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectRow = ({ project, isEditing, onEdit, onSave, onCancel, onDelete, formatCurrency }) => {
  const [editData, setEditData] = useState(project);

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td className="px-6 py-4">
          <input
            type="date"
            value={editData.orderDate}
            onChange={(e) => setEditData({...editData, orderDate: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.clientName}
            onChange={(e) => setEditData({...editData, clientName: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1 text-right"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.orderDetails}
            onChange={(e) => setEditData({...editData, orderDetails: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1 text-right"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            value={editData.transactionAmount}
            onChange={(e) => setEditData({...editData, transactionAmount: parseFloat(e.target.value)})}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            value={editData.vatPercent}
            onChange={(e) => setEditData({...editData, vatPercent: parseFloat(e.target.value)})}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {formatCurrency(editData.transactionAmount * (1 + editData.vatPercent / 100))}
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            value={editData.projectReceipts}
            onChange={(e) => setEditData({...editData, projectReceipts: parseFloat(e.target.value)})}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {formatCurrency((editData.transactionAmount * (1 + editData.vatPercent / 100)) - editData.projectReceipts)}
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.projectNotes}
            onChange={(e) => setEditData({...editData, projectNotes: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1 text-right"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-reverse space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.orderDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{project.clientName}</td>
      <td className="px-6 py-4 text-sm text-gray-900 text-right max-w-xs truncate">{project.orderDetails}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(project.transactionAmount)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.vatPercent}%</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(project.totalPayment)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(project.projectReceipts)}</td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${project.remainingBalance === 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(project.remainingBalance)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 text-right max-w-xs truncate">{project.projectNotes}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-reverse space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FinancialDashboard;