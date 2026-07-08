import { useState } from 'react';
import { contratosApi } from '../utils/api.js';

const initialForm = {
  nombre: '',
  apellidos: '',
  telefono: '',
  email: '',
  fecha_reserva: '',
};

function ContratoModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    // Real-time validation: Phone number only accepts digits
    if (name === 'telefono' && value && !/^\d+$/.test(value)) {
      return; // Ignore change if value is not a number
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    // FIX (Bug #3): Clear specific field error as soon as the user starts typing (Improves UX)
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate() {
    const newErrors = {};

    // Required fields validation
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios';

    // Phone validation (required and format)
    if (!form.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d+$/.test(form.telefono)) {
      newErrors.telefono = 'El teléfono solo debe contener números';
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Reservation date validation
    if (!form.fecha_reserva) {
      newErrors.fecha_reserva = 'La fecha de reserva es obligatoria';
    } else {
      // Get today's date in YYYY-MM-DD format to compare with the input
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayString = `${yyyy}-${mm}-${dd}`;

      if (form.fecha_reserva < todayString) {
        newErrors.fecha_reserva = 'La fecha de reserva no puede ser anterior a hoy';
      }
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    
    // Check if there are validation errors, set them in state and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { data } = await contratosApi.create(form);
      onSuccess(data);
      // Close modal after successful submission
      onClose();
    } catch (err) {
      console.error('Error creating contrato:', err);
      setErrors({ submit: err.response?.data?.error || 'Error al crear el contrato' });
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'apellidos', label: 'Apellidos', type: 'text' },
    { name: 'telefono', label: 'Teléfono', type: 'tel' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'fecha_reserva', label: 'Fecha de Reserva', type: 'date' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Nuevo Contrato</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                // Native HTML 'min' attribute to block past dates in the visual calendar
                min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field.name] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContratoModal;