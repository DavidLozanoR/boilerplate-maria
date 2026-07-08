import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // use searchParams to get query params
import ContratoModal from '../components/ContratoModal.jsx';
import { contratosApi } from '../utils/api.js';
import { formatDate } from '../utils/helpers.js';

const statusColors = {
  'Pendiente de firma': 'bg-yellow-100 text-yellow-700',
  Firmado: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
};

// Fix: wrap table in a div with overflow-x-auto and add min-width to table
function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // State to hold the contract being edited
  const [contratoToEdit, setContratoToEdit] = useState(null);

  // Param to get query params for filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const nombreQuery = searchParams.get('nombre') || '';
  const statusQuery = searchParams.get('status') || '';

  async function fetchContratos(page = 1, nombre = '', status = '') {
    setLoading(true);
    try {
    // FIX: Added nombre and status filters to the API call
      const { data } = await contratosApi.getAll(page, nombre, status);
      setContratos(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching contratos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fix: added name and status to the dependency array to refetch when they change
  useEffect(() => {
    fetchContratos(pagination.page, nombreQuery, statusQuery);
  }, [pagination.page, nombreQuery, statusQuery]);

  useEffect(() => {
    if (!notification) return;

    const timer = window.setTimeout(() => setNotification(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  async function handleAction(action, id) {
    try {
      if (action === 'cancelar') await contratosApi.cancelar(id);
      if (action === 'firmar') await contratosApi.firmar(id);
      if (action === 'reenviar') {
        await contratosApi.reenviar(id);
        setNotification('Email enviado correctamente');
      }
      if (action === 'editar') {
        // search for the contrato in the current list and set it to edit
        const contrato = contratos.find(c => c.id === id);
        setContratoToEdit(contrato);
        setShowModal(true);
        return;
      }
      fetchContratos(pagination.page, nombreQuery, statusQuery); // Refresh the list after action
    } catch (err) {
      console.error(`Error on action ${action}:`, err);
    }
  }

  function handleNewContrato(newContrato) {
    // Force refresh the list after creating a new contrato
    fetchContratos(pagination.page, nombreQuery, statusQuery);
    setNotification('Contrato guardado y correo enviado exitosamente');
    closeModal();
  }

  // Function to close the modal and reset the editing state
  function closeModal() {
    setShowModal(false);
    setContratoToEdit(null);
  }

  return (
    <div>
      {notification && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notification}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contratos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nuevo Contrato
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Fix: Added overflow-x-auto wrapper*/}
        <div className="overflow-x-auto">
          {/* Fix: Added min-w-max to ensure minimum width and enable scrolling */}
          <table className="w-full min-w-max text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Apellidos', 'Teléfono', 'Email', 'Fecha Reserva', 'Contrato', 'Status', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Cargando...</td>
                </tr>
              ) : contratos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No hay contratos</td>
                </tr>
              ) : (
                contratos.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{c.apellidos}</td>
                    <td className="px-4 py-3 text-gray-600">{c.telefono}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(c.fecha_reserva)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.contrato || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleAction('editar', c.id)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Editar</button>
                        <button onClick={() => handleAction('reenviar', c.id)} className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">Reenviar</button>
                        <button onClick={() => handleAction('cancelar', c.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Cancelar</button>
                        <button onClick={() => handleAction('firmar', c.id)} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">Firmar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ContratoModal
          contratoToEdit={contratoToEdit} // Pass the contrato to edit to the modal
          onClose={closeModal} // Use the closeModal function to close the modal 
          onSuccess={handleNewContrato}
        />
      )}
    </div>
  );
}

export default Contratos;