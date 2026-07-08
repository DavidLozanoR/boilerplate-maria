const Joi = require('joi');
const db = require('../src/database/db');
const { getContratos } = require('../src/controllers/contratosController');

const contratoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellidos: Joi.string().min(2).max(100).required(),
  telefono: Joi.string().min(6).max(20).required(),
  email: Joi.string().email().required(),
  fecha_reserva: Joi.string().isoDate().required(),
});

describe('Joi Schema Validation', () => {
  test('valid contrato passes validation', () => {
    const { error } = contratoSchema.validate({
      nombre: 'Juan',
      apellidos: 'Pérez',
      telefono: '612345678',
      email: 'juan@example.com',
      fecha_reserva: '2024-06-15',
    });
    expect(error).toBeUndefined();
  });

  test('invalid email fails validation', () => {
    const { error } = contratoSchema.validate({
      nombre: 'Juan',
      apellidos: 'Pérez',
      telefono: '612345678',
      email: 'not-an-email',
      fecha_reserva: '2024-06-15',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('email');
  });

  test('missing required fields fails validation', () => {
    const { error } = contratoSchema.validate({ nombre: 'Juan' });
    expect(error).toBeDefined();
  });
});

describe('Pagination logic', () => {
  test('calculates correct offset', () => {
    const page = 3;
    const limit = 10;
    const offset = (page - 1) * limit;
    expect(offset).toBe(20);
  });

  test('calculates total pages correctly', () => {
    const total = 45;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);
    expect(totalPages).toBe(5);
  });
});

describe('getContratos filters', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM contratos').run();
  });

  test('filters by status and name while keeping pagination consistent', () => {
    db.prepare(`
      INSERT INTO contratos (nombre, apellidos, telefono, email, fecha_reserva, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Juan Pérez', 'García', '612345678', 'juan@example.com', '2024-06-15', 'Firmado');
    db.prepare(`
      INSERT INTO contratos (nombre, apellidos, telefono, email, fecha_reserva, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Juan López', 'Martínez', '612345679', 'juan2@example.com', '2024-06-16', 'Pendiente de firma');
    db.prepare(`
      INSERT INTO contratos (nombre, apellidos, telefono, email, fecha_reserva, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Ana Gómez', 'Ruiz', '612345680', 'ana@example.com', '2024-06-17', 'Firmado');

    const req = { query: { status: 'Firmado', nombre: 'juan', page: '1' } };
    const res = {
      payload: null,
      json(data) {
        this.payload = data;
      },
    };

    getContratos(req, res);

    expect(res.payload.data).toHaveLength(1);
    expect(res.payload.data[0].nombre).toBe('Juan Pérez');
    expect(res.payload.pagination.total).toBe(1);
    expect(res.payload.pagination.totalPages).toBe(1);
    expect(res.payload.pagination.page).toBe(1);
  });
});
